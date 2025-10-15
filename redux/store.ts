    // src/app/store.js
    import { configureStore } from '@reduxjs/toolkit';
    import authSlice from "./reducers/authReducer/authSlice";
    import artistSlice from "./reducers/artistReducer/artistSlice";
    import messageSlice from "./reducers/messageReducer/messageSlice";
    import posterSlice from "./reducers/posterReducer/posterSlice";

    export const store = configureStore({
      reducer: {
        auth: authSlice,
        artist: artistSlice,
        messages: messageSlice,
        poster: posterSlice,
      },
        middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // prevent some redux warnings
    }),
    
    });
    export type RootState = ReturnType<typeof store.getState>;
    export type AppDispatch = typeof store.dispatch;