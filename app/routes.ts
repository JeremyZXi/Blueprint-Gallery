import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    { path: "/admin", file: "routes/admin.tsx" },
    { path: "/submit", file: "routes/submit.tsx"},
    { path: "/gallery", file: "routes/gallery.tsx"}
] satisfies RouteConfig;