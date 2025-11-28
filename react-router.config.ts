import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Keep SSR enabled for API routes, but use SPA mode for client-side routing
  ssr: true,
  // Use server build for API routes only
  serverBuildFile: "index.js",
} satisfies Config;
