    // src/app/store.js
    import { configureStore } from '@reduxjs/toolkit';
    import authSlice from "./reducers/authReducer/authSlice";
    import artistSlice from "./reducers/artistReducer/artistSlice";

    export const store = configureStore({
      reducer: {
        auth: authSlice,
        artist: artistSlice,
      },
    });
    export type RootState = ReturnType<typeof store.getState>;
    export type AppDispatch = typeof store.dispatch;