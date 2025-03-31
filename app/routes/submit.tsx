import Submission from "../components/submission";
import Layout from "../components/Layout";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Submit IA | Blueprint Gallery" },
    { name: "description", content: "Submit your IA design project to the Blueprint Gallery" },
  ];
}

export default function SubmitPage() {
    return (
        <Layout>
            <div className="p-6">
                <Submission />
            </div>
        </Layout>
    );
}