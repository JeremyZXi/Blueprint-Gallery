import type { Route } from "./+types/home";
import Layout from "../components/Layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Blueprint Gallery" },
    { name: "description", content: "A gallery of IB Design Technology IA projects" },
  ];
}

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50 p-6">
        <h1 className="text-5xl font-bold mb-8 text-center text-blue-800">Blueprint Gallery</h1>
        <p className="text-xl mb-10 text-center max-w-2xl text-gray-600">
          Explore innovative IA projects or submit your own design to our growing collection.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          {/* Gallery Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
            <div className="h-48 bg-blue-200 flex items-center justify-center">
              <span className="text-5xl">🔍</span>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">Browse Gallery</h2>
              <p className="text-gray-600 mb-4">
                Explore our collection of innovative design projects.
              </p>
              <a
                href="/gallery"
                className="block w-full py-2 text-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                View Gallery
              </a>
            </div>
          </div>
          
          {/* Submit Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
            <div className="h-48 bg-green-200 flex items-center justify-center">
              <span className="text-5xl">📤</span>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">Submit Your IA</h2>
              <p className="text-gray-600 mb-4">
                Share your design project with the community.
              </p>
              <a
                href="/submit"
                className="block w-full py-2 text-center bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Submit Project
              </a>
            </div>
          </div>
        </div>
        
        {/* Admin Link (smaller, at bottom) */}
        <div className="mt-12">
          <a
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Admin Access
          </a>
        </div>
      </div>
    </Layout>
  );
}
