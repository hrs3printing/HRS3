import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./index.css";
import App from "./App.jsx";

const base = import.meta.env.BASE_URL.replace(/\/$/, "") || "";
const routerBasename = base === "" || base === "/" ? undefined : base;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#18181b",
            color: "#fafafa",
            fontSize: "12px",
          },
        }}
      />
      <App />
    </BrowserRouter>
  </StrictMode>,
);
