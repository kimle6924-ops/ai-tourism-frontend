const config = {
  // Empty string → requests use relative path (/api/...) → routed via Vite proxy → no CORS
  baseUrl: import.meta.env.VITE_API_BASE_URL || '',
};

export default config;

