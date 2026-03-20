import { configureStore } from '@reduxjs/toolkit';
import loginReducer from './slice/LoginSlice';
import registerReducer from './slice/RegisterSlice';
import profileReducer from './slice/ProfileSlice';
import categoryReducer from './slice/CategorySlice';
import chatbotReducer from './slice/ChatbotGeminiSlice';
import preferencesReducer from './slice/PreferencesSlice';
import placesReducer from './slice/PlacesSlice';

export const store = configureStore({
  reducer: {
    login: loginReducer,
    register: registerReducer,
    profile: profileReducer,
    category: categoryReducer,
    chatbot: chatbotReducer,
    preferences: preferencesReducer,
    places: placesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
