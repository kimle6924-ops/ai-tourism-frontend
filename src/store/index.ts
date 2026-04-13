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
import locationUserReducer from './slice/LocationUserSlice';
import locationRecommendReducer from './slice/LocationRecommendSlice';
import adminUsersReducer from './slice/AdminManagerUserSlice';
import adminOverviewReducer from './slice/AdminManagerOverviewSlice';
import adminPlacesReducer from './slice/AdminPlaceSlice';
import adminEventsReducer from './slice/AdminEventSlice';
import moderationReducer from './slice/ModerationSlice';
import adminCategoriesReducer from './slice/AdminCategorySlice';
import mediaReducer from './slice/MediaSlice';
import adminReviewsReducer from './slice/AdminReviewSlice';
import userReviewReducer from './slice/UserReviewSlice';
import rankReducer from './slice/RankSlice';

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
    locationUser: locationUserReducer,
    locationRecommend: locationRecommendReducer,
    adminUsers: adminUsersReducer,
    adminOverview: adminOverviewReducer,
    adminPlaces: adminPlacesReducer,
    adminEvents: adminEventsReducer,
    moderation: moderationReducer,
    adminCategories: adminCategoriesReducer,
    media: mediaReducer,
    adminReviews: adminReviewsReducer,
    userReview: userReviewReducer,
    rank: rankReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
