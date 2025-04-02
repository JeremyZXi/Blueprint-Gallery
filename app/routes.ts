import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    { path: "/admin", file: "routes/admin.tsx" },
    { path: "/submit", file: "routes/submit.tsx"},
    { path: "/gallery", file: "routes/gallery.tsx"},
    { path: "/api/approveSubmission", file: "api/approveSubmission/route.ts" },
    { path: "/api/rejectSubmission", file: "api/rejectSubmission/route.ts" },
    { path: "/api/approveIA", file: "routes/api.approveIA.tsx" },
    { path: "/api/rejectIA", file: "routes/api.rejectIA.tsx" },
    { path: "/api/submitIA", file: "routes/api.submitIA.tsx" },
    { path: "/api/updateSubmission", file: "routes/api.updateSubmission.tsx" },
    { path: "/api/deleteSubmissionImage", file: "routes/api.deleteSubmissionImage.tsx" }
] satisfies RouteConfig;