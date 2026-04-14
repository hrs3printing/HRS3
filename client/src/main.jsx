import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "react-hot-toast";

import "./index.css";
import App from "./App.jsx";

const rootElement = document.getElementById("root");

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <Toaster
          position="top-right"
          containerStyle={{
            top: "12px",
            right: "12px",
            left: "12px", // allows better fit on small screens
          }}
          toastOptions={{
            style: {
              background: "#000",
              color: "#fff",
              fontSize: "12px",
              padding: "10px 14px",
              borderRadius: "8px",
              maxWidth: "100%",
            },
            success: {
              iconTheme: {
                primary: "#fff",
                secondary: "#000",
              },
            },
          }}
        />
        <App />
      </CartProvider>
    </BrowserRouter>
  </StrictMode>,
);
