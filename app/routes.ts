import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    { path: "/admin", file: "routes/admin.tsx" },
    { path: "/submit", file: "routes/submit.tsx"},
    { path: "/gallery", file: "routes/gallery.tsx" },
    { path: "/IA-gallery", file: "routes/IA-gallery.tsx"},
    { path: "/MYP-gallery", file: "routes/MYP-gallery.tsx"},
    { path: "/DP-gallery", file: "routes/DP-gallery.tsx"},
    { path: "/about", file: "routes/about.tsx"},
    { path: "/emailtest", file: "routes/emailtest.tsx" },
    { path: "/api/approveIA", file: "routes/api.approveIA.tsx" },
    { path: "/api/rejectIA", file: "routes/api.rejectIA.tsx" },
    { path: "/api/submitIA", file: "routes/api.submitIA.tsx" },
    { path: "/api/updateSubmission", file: "routes/api.updateSubmission.tsx" },
    { path: "/api/deleteSubmissionImage", file: "routes/api.deleteSubmissionImage.tsx" },
    { path: "*", file: "routes/notfound.tsx" }
] satisfies RouteConfig;