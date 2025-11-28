import { StrictMode, startTransition } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import type { RouteObject } from "react-router-dom";

// Import route modules
import { Layout, default as App, ErrorBoundary } from "./root";
import Home from "./routes/home";
import Admin from "./routes/admin";
import Submit from "./routes/submit";
import Gallery from "./routes/gallery";
import IAGallery from "./routes/IA-gallery";
import MYPGallery from "./routes/MYP-gallery";
import DPGallery from "./routes/DP-gallery";
import About from "./routes/about";
import EmailTest from "./routes/emailtest";
import NotFound from "./routes/notfound";

// Helper component to wrap routes with Layout
function RootLayout() {
  return (
    <Layout>
      <App />
    </Layout>
  );
}

// Helper component for error boundary
function RootErrorBoundary({ error }: { error: unknown }) {
  return (
    <Layout>
      <ErrorBoundary error={error} />
    </Layout>
  );
}

// Define routes manually for SPA mode
const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RootErrorBoundary error={new Error("Route error")} />,
    children: [
      { index: true, element: <Home /> },
      { path: "admin", element: <Admin /> },
      { path: "submit", element: <Submit /> },
      { path: "gallery", element: <Gallery /> },
      { path: "IA-gallery", element: <IAGallery /> },
      { path: "MYP-gallery", element: <MYPGallery /> },
      { path: "DP-gallery", element: <DPGallery /> },
      { path: "about", element: <About /> },
      { path: "emailtest", element: <EmailTest /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];

const router = createBrowserRouter(routes);

startTransition(() => {
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
});

