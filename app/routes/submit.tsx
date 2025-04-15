import Submission from "../components/submission";
import Layout from "../components/Layout";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Submit Your Work | Blueprint Gallery" },
    { name: "description", content: "Submit your IA design project to the Blueprint Gallery" },
  ];
}

const TypeSelector = ({ selectedType, onTypeChange }: { selectedType: string; onTypeChange: (type: string) => void }) => {
    return (
        <div className="flex w-full gap-4 mb-8">
            <button
                onClick={() => onTypeChange('MYP')}
                className={`flex-1 py-3 px-4 rounded-lg text-lg font-medium transition-all duration-300 ${
                    selectedType === 'MYP'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
            >
                MYP
            </button>
            <button
                onClick={() => onTypeChange('DP')}
                className={`flex-1 py-3 px-4 rounded-lg text-lg font-medium transition-all duration-300 ${
                    selectedType === 'DP'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                }`}
            >
                DP
            </button>
            <button
                onClick={() => onTypeChange('IA')}
                className={`flex-1 py-3 px-4 rounded-lg text-lg font-medium transition-all duration-300 ${
                    selectedType === 'IA'
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
            >
                IA
            </button>
        </div>
    );
};

export default function SubmitPage() {
    return (
        <Layout>
            <div className="p-6">
                <Submission />
            </div>
        </Layout>
    );
}