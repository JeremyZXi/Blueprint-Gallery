import { ServeOptions } from "@react-router/serve";

export const serveOptions: ServeOptions = {
  assets: {
    path: "build/client/assets",
    route: "/assets"
  }
}; 