import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";

import App from "./App.tsx";
import { store } from "../redux/store.ts";
import "./index.css";

// ✅ Configure Axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// ✅ Google OAuth Client ID (ensure it's defined in .env)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "427806335835-7aqju9ehekue8ufglu13ds7a4qld8d8i.apps.googleusercontent.com";

// ✅ Mount React App
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found. Make sure your HTML has a div with id='root'.");
}

createRoot(rootElement).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>
);
