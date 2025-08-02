import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        srcDir: "src",
        filename: "sw.ts",
        strategies: "injectManifest",
        manifest: {
          name: "Sree Sai School",
          short_name: "SreeSai",
          theme_color: "#ffffff",
          start_url: "/",
          scope: "/",
          display: "standalone",
          background_color: "#ffffff",
          description: "Sree Sai School web application",
          icons: [
            {
              src: "/manifest-icon-192.maskable.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/manifest-icon-512.maskable.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
            { src: "/apple-icon-180.png", sizes: "180x180", type: "image/png" },
          ],
        },
      }),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    envPrefix: "VITE_",
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL),
    },
  };
});
