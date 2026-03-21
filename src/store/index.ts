import { configureStore } from '@reduxjs/toolkit';
import loginReducer from './slice/LoginSlice';
import registerReducer from './slice/RegisterSlice';
import profileReducer from './slice/ProfileSlice';
import categoryReducer from './slice/CategorySlice';
import chatbotReducer from './slice/ChatbotGeminiSlice';
import preferencesReducer from './slice/PreferencesSlice';
import placesReducer from './slice/PlacesSlice';
import discoveryReducer from './slice/DiscoverySlice';
import locationDetailReducer from './slice/LocationDetaiSlice';
import reviewReducer from './slice/ReviewSlice';

export const store = configureStore({
  reducer: {
    login: loginReducer,
    register: registerReducer,
    profile: profileReducer,
    category: categoryReducer,
    chatbot: chatbotReducer,
    preferences: preferencesReducer,
    places: placesReducer,
    discovery: discoveryReducer,
    locationDetail: locationDetailReducer,
    reviews: reviewReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
