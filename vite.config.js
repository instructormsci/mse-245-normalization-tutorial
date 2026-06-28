import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves project sites under /<repo>/, so assets must be
// requested with that prefix. For local `npm run dev` Vite ignores this
// and serves from "/".
export default defineConfig({
  base: "/mse-245-normalization-tutorial/",
  plugins: [react()],
});
