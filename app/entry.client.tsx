import { StrictMode, startTransition } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import type { RouteObject } from "react-router-dom";

// Import routes configuration
import routesConfig from "./routes";
import { routeConfigToRoutes } from "@react-router/dev/routes";

// Convert route config to React Router routes
const routes = routeConfigToRoutes(routesConfig) as RouteObject[];

const router = createBrowserRouter(routes);

startTransition(() => {
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
});

