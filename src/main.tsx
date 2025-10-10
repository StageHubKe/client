import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "../redux/store.ts";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
