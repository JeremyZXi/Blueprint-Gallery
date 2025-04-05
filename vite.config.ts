import { reactRouter } from "@react-router/dev/vite";
import { vercelPreset } from "@vercel/react-router";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter({ presets: [vercelPreset()] }), tsconfigPaths()],
});
