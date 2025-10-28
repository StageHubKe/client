    // src/app/store.js
    import { configureStore } from '@reduxjs/toolkit';
    import authSlice from "./reducers/authReducer/authSlice";
    import artistSlice from "./reducers/artistReducer/artistSlice";
    import messageSlice from "./reducers/messageReducer/messageSlice";
    import posterSlice from "./reducers/posterReducer/posterSlice";
    import bidSlice from "./reducers/bidReducer/bidSlice";
    import notificationSlice from "./reducers/notificationReducer/notificationSlice"
    import eventSlice from "./reducers/EventReducer/eventSlice";
    import meetSlice from "./reducers/meetReducer/meetSlice";

    export const store = configureStore({
      reducer: {
        auth: authSlice,
        artist: artistSlice,
        messages: messageSlice,
        poster: posterSlice,
        bid: bidSlice, 
        notification: notificationSlice,
        event: eventSlice,
        meet: meetSlice,
      },
        middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
    
    });
    export type RootState = ReturnType<typeof store.getState>;
    export type AppDispatch = typeof store.dispatch;