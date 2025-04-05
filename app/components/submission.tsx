import { useState } from "react";
import type { ChangeEvent } from "react";
import { handleSubmission } from "../utils/supabaseSubmission";
import { testSupabaseConnection } from "../utils/testSupabase";

const materials = ["Alloy", "Wood", "Plastic", "Glass", "Fabric", "Composite"];
const colors = ["Red", "Blue", "Green", "Black", "White", "Yellow"];
const functions = [
    "Organization & Storage",
    "Life Improvement & Decor",
    "Health & Wellness",
    "Innovative Gadgets & Tools",
    "Accessibility & Mobility Solutions"
];

interface FormData {
    firstName: string;
    lastName: string;
    gradeLevel: string;
    email: string;
    title: string;
    description: string;
    material: string[];
    color: string[];
    function: string[];
    pdf: File | null;
    images: File[];
}

const Submission = () => {
    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        gradeLevel: "",
        email: "",
        title: "",
        description: "",
        material: [],
        color: [],
        function: [],
        pdf: null,
        images: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<"untested" | "success" | "failed">("untested");

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTagSelect = (category: keyof FormData, tag: string) => {
        if (category === 'material' || category === 'color' || category === 'function') {
            setFormData((prev) => ({
                ...prev,
                [category]: prev[category].includes(tag)
                    ? prev[category].filter((t: string) => t !== tag)
                    : [...prev[category], tag]
            }));
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'pdf' | 'images') => {
        if (!e.target.files) return;
        
        const files = Array.from(e.target.files);
        if (type === "pdf") {
            setFormData((prev) => ({ ...prev, pdf: files[0] }));
        } else {
            setFormData((prev) => ({
                ...prev,
                images: [...prev.images, ...files].slice(0, 6) // Ensure max 6 images
            }));
        }
    };

    const isValidForm = () => {
        console.log("Validating form...", formData);
        return (
            formData.firstName.trim() !== "" &&
            formData.lastName.trim() !== "" &&
            formData.gradeLevel.trim() !== "" &&
            formData.email.trim() !== "" &&
            formData.title.trim() !== "" &&
            formData.material.length > 0 &&
            formData.color.length > 0 &&
            formData.function.length > 0 &&
            formData.pdf !== null &&
            formData.images.length >= 3
        );
    };

    const updateProgress = (progress: number) => {
        setUploadProgress(progress);
    };

    const handleSubmitForm = async () => {
        if (!isValidForm()) {
            alert("Please fill out all required fields.");
            return;
        }

        try {
            setIsSubmitting(true);
            setUploadProgress(0);
            
            console.log("Starting Supabase submission process...");
            console.log("Form data:", {
                ...formData,
                pdf: formData.pdf?.name,
                images: formData.images.map(img => img.name)
            });
            
            // Handle the submission process using Supabase
            const result = await handleSubmission(formData, updateProgress);
            
            console.log("Submission complete!", result);
            alert("Submission successful! Your project will be reviewed by an administrator.");
            
            // Reset form after successful submission
            setFormData({
                firstName: "",
                lastName: "",
                gradeLevel: "",
                email: "",
                title: "",
                description: "",
                material: [],
                color: [],
                function: [],
                pdf: null,
                images: [],
            });

        } catch (error) {
            console.error("Error during submission:", error);
            let errorMessage = "Please try again.";
            
            if (error instanceof Error) {
                console.error("Error type:", error.constructor.name);
                console.error("Error message:", error.message);
                errorMessage = error.message;
                
                // Try to extract more information if it's a Supabase error
                if (error.hasOwnProperty('error') && error.hasOwnProperty('message')) {
                    // @ts-ignore
                    console.error("Supabase error details:", error.error, error.message);
                    // @ts-ignore
                    errorMessage = `${error.message} (${error.error})`;
                }
            }
            
            alert("Submission failed: " + errorMessage);
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    const handleTestConnection = async () => {
        setIsTestingConnection(true);
        setConnectionStatus("untested");
        
        try {
            const isConnected = await testSupabaseConnection();
            setConnectionStatus(isConnected ? "success" : "failed");
            alert(isConnected 
                ? "Connection to Supabase successful! You can submit your project now." 
                : "Connection to Supabase failed. Please check the console for details.");
        } catch (error) {
            console.error("Error testing connection:", error);
            setConnectionStatus("failed");
            alert("Error testing connection to Supabase.");
        } finally {
            setIsTestingConnection(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Submit Your IA</h2>
            
            {/* Test Connection Button */}
            <div className="mb-4">
                <button 
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className={`px-4 py-2 text-sm rounded 
                        ${connectionStatus === "success" ? "bg-green-100 text-green-800" : 
                          connectionStatus === "failed" ? "bg-red-100 text-red-800" : 
                          "bg-blue-100 text-blue-800"} 
                        hover:opacity-80 transition-opacity`}
                >
                    {isTestingConnection ? "Testing..." : "Test Supabase Connection"}
                </button>
                {connectionStatus === "success" && (
                    <span className="ml-2 text-green-600">✓ Connected</span>
                )}
                {connectionStatus === "failed" && (
                    <span className="ml-2 text-red-600">✗ Connection failed</span>
                )}
            </div>
            
            {isSubmitting && (
                <div className="mb-6">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Uploading your project... {Math.round(uploadProgress)}%</p>
                </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
                <input 
                    type="text" 
                    name="firstName" 
                    value={formData.firstName}
                    placeholder="First Name e.g. Tina"
                    className="border p-2 rounded"
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                />
                <input 
                    type="text" 
                    name="lastName" 
                    value={formData.lastName}
                    placeholder="Last Name e.g. Qiu"
                    className="border p-2 rounded"
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                />
                <input 
                    type="text" 
                    name="gradeLevel" 
                    value={formData.gradeLevel}
                    placeholder="Grade Level e.g. 11"
                    className="border p-2 rounded"
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                />
                <input 
                    type="email" 
                    name="email" 
                    value={formData.email}
                    placeholder="Email Address e.g. something@example.com"
                    className="border p-2 rounded"
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                />
            </div>
            
            <div className="mt-4">
                <input 
                    type="text" 
                    name="title" 
                    value={formData.title}
                    placeholder="Project Title" 
                    className="border p-2 rounded w-full"
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                />
            </div>
            
            <div className="mt-4">
                <textarea 
                    name="description" 
                    value={formData.description}
                    placeholder="Project Description (optional)" 
                    className="border p-2 rounded w-full h-32"
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                />
            </div>

            {/* Material Selection */}
            <h3 className="mt-4">Select Main Material</h3>
            <div className="flex flex-wrap gap-2">
                {materials.map((mat) => (
                    <button
                        key={mat}
                        className={`p-2 border rounded ${formData.material.includes(mat) ? "bg-blue-500 text-white cursor-pointer" : "bg-gray-100 cursor-pointer"} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isSubmitting && handleTagSelect("material", mat)}
                        disabled={isSubmitting}
                    >
                        {mat}
                    </button>
                ))}
            </div>

            {/* Color Selection */}
            <h3 className="mt-4">Select Main Color</h3>
            <div className="flex flex-wrap gap-2">
                {colors.map((col) => (
                    <button
                        key={col}
                        className={`p-2 border rounded ${formData.color.includes(col) ? "bg-blue-500 text-white cursor-pointer" : "bg-gray-100 cursor-pointer"} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isSubmitting && handleTagSelect("color", col)}
                        disabled={isSubmitting}
                    >
                        {col}
                    </button>
                ))}
            </div>

            {/* Function Selection */}
            <h3 className="mt-4">Select Main Function</h3>
            <div className="flex flex-wrap gap-2">
                {functions.map((func) => (
                    <button
                        key={func}
                        className={`p-2 border rounded ${formData.function.includes(func) ? "bg-blue-500 text-white cursor-pointer" : "bg-gray-100 cursor-pointer"} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isSubmitting && handleTagSelect("function", func)}
                        disabled={isSubmitting}
                    >
                        {func}
                    </button>
                ))}
            </div>

            {/* File Upload */}
            <h3 className="mt-4">Upload Your IA PDF</h3>
            <label className={`border p-2 rounded block cursor-pointer ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input 
                    type="file" 
                    accept="application/pdf" 
                    className="hidden"
                    onChange={(e) => !isSubmitting && handleFileChange(e, "pdf")}
                    disabled={isSubmitting}
                />
                {formData.pdf ? formData.pdf.name : "Click to upload a PDF"}
            </label>

            <h3 className="mt-4">Upload IA Photos (At least 3, Max 6)</h3>
            <div className="border p-4 rounded flex gap-2 overflow-x-auto">
                {formData.images.map((img, index) => (
                    <div
                        key={index}
                        className={`relative w-20 h-20 cursor-pointer group ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isSubmitting && setFormData((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                        }))}
                    >
                        <img
                            src={URL.createObjectURL(img)}
                            alt={`Uploaded ${index + 1}`}
                            className="w-full h-full object-cover rounded shadow transition duration-200
                   hover:brightness-75 hover:saturate-150 hover:hue-rotate-[-50deg] hover:sepia-[100%]"
                        />
                        <div className="absolute inset-0 flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="text-red-500 font-bold text-6xl">X</span>
                        </div>
                    </div>
                ))}
                {formData.images.length < 6 && !isSubmitting && (
                    <label
                        className={`border p-2 rounded flex items-center justify-center cursor-pointer w-20 h-20 bg-gray-100 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => !isSubmitting && handleFileChange(e, "images")}
                            disabled={isSubmitting}
                        />
                        <span className="text-gray-500 text-sm">+ Add More</span>
                    </label>
                )}
            </div>

            <button 
                onClick={handleSubmitForm} 
                className={`mt-4 bg-green-500 text-white p-2 rounded w-full cursor-pointer ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
        </div>
    );
};

export default Submission;