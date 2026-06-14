import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv, type ProxyOptions } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ envMode }) => {
  const env = loadEnv({ mode: envMode, prefixes: ["VITE_"] });
  const serverUrl =
    process.env.VITE_REACT_APP_SERVER_URL ||
    env.rawPublicVars.VITE_REACT_APP_SERVER_URL ||
    "http://localhost:3010";
  const isProd = envMode === "production";
  const devProxy = Object.fromEntries(
    (["/api", "/v1", "/mj", "/pg"] as const).map((key) => [
      key,
      {
        target: serverUrl,
        changeOrigin: true,
        bypass:
          key === "/api"
            ? (req) =>
                /^\/api(?:[/?#]|$)/.test(req.url ?? "") ? undefined : true
            : undefined,
      },
    ]),
  ) as Record<string, ProxyOptions>;

  return {
    plugins: [pluginReact()],
    source: {
      entry: {
        index: "./src/main.tsx",
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    html: {
      template: "./index.html",
    },
    server: {
      host: "0.0.0.0",
      strictPort: true,
      proxy: devProxy,
    },
    output: {
      minify: isProd,
      target: "web",
      distPath: {
        root: "dist",
      },
    },
    performance: {
      removeConsole: isProd ? ["log"] : false,
      buildCache: {
        cacheDigest: [process.env.VITE_REACT_APP_VERSION],
      },
    },
  };
});
