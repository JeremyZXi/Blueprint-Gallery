import Gallery from "../components/Gallery";
import Layout from "../components/Layout";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IA Gallery | Blueprint Gallery" },
    { name: "description", content: "Browse innovative IA design projects" },
  ];
}

export default function GalleryPage() {
  return (
    <Layout>
      <Gallery />
    </Layout>
  );
} 