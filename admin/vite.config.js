import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // For same-origin deploy under /admin: VITE_BASE=/admin/ npm run build
  base: process.env.VITE_BASE || "/",
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
  },
  build: {
    target: "es2020",
  },
});
