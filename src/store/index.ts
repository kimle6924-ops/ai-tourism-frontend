import { configureStore } from '@reduxjs/toolkit';
import loginReducer from './slice/LoginSlice';
import registerReducer from './slice/RegisterSlice';
import profileReducer from './slice/ProfileSlice';

export const store = configureStore({
  reducer: {
    login: loginReducer,
    register: registerReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
