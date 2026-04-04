import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import config from '../config/config';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// ─────────────────────────────────────────────
// Token helpers (localStorage)
// ─────────────────────────────────────────────
const TOKEN_KEY = 'auth_tokens';

export const saveTokens = (tokens: AuthTokens) => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
};

export const getTokens = (): AuthTokens | null => {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
};

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getAccessToken = (): string | null => getTokens()?.accessToken ?? null;
export const getRefreshToken = (): string | null => getTokens()?.refreshToken ?? null;

// ─────────────────────────────────────────────
// User helpers (localStorage)
// ─────────────────────────────────────────────
const USER_KEY = 'auth_user';

export const saveUser = (user: any) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): any | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
// Axios instance
// ─────────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: config.baseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ─────────────────────────────────────────────
// Request interceptor – attach access token
// ─────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (reqConfig: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      reqConfig.headers = reqConfig.headers ?? {};
      (reqConfig.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      console.log(`[Token] Request: ${reqConfig.method?.toUpperCase()} ${reqConfig.url} | accessToken: ...${token.slice(-8)}`);
    } else {
      console.log(`[Token] Request: ${reqConfig.method?.toUpperCase()} ${reqConfig.url} | (no token)`);
    }
    return reqConfig;
  },
  (error: unknown) => Promise.reject(error),
);

// ─────────────────────────────────────────────
// Refresh token logic (queue to avoid parallel refreshes)
// ─────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// ─────────────────────────────────────────────
// Response interceptor – auto-refresh on 401
// ─────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const currentAccess = getAccessToken();
      const refreshToken = getRefreshToken();

      console.group('[Token] 401 detected — attempting refresh');
      console.log('  URL             :', originalRequest.url);
      console.log('  accessToken now :', currentAccess ? `...${currentAccess.slice(-8)}` : 'null');
      console.log('  refreshToken now:', refreshToken ? `...${refreshToken.slice(-8)}` : 'null');
      console.groupEnd();

      if (!refreshToken) {
        console.warn('[Token] No refresh token found → clearing tokens');
        clearTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${config.baseUrl}/api/Auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );

        const newTokens: AuthTokens = {
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          expiresAt: data.data.expiresAt,
        };

        console.group('[Token] Refresh SUCCESS');
        console.log('  new accessToken :', `...${newTokens.accessToken.slice(-8)}`);
        console.log('  new refreshToken:', `...${newTokens.refreshToken.slice(-8)}`);
        console.log('  expiresAt       :', newTokens.expiresAt);
        console.groupEnd();

        saveTokens(newTokens);
        axiosInstance.defaults.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;

        processQueue(null, newTokens.accessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        console.group('[Token] Refresh FAILED');
        console.error('  status:', refreshError?.response?.status);
        console.error('  body  :', refreshError?.response?.data);
        console.groupEnd();
        // Refresh failed → clear tokens and notify app to force logout
        clearTokens();
        processQueue(refreshError as AxiosError, null);
        // Dispatch a global event so UI layers (Redux) can react
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
