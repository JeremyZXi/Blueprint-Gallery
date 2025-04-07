import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { handleSubmission } from "../utils/supabaseSubmission";
import { fetchColorTags, fetchMaterialTags, type ColorTag, type MaterialTag } from "../utils/fetchSupabase";

// Regular React components instead of styled-components
interface StyledInputProps {
  name: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  icon?: "search" | "user" | "email" | "grade" | "title" | "description" | "file" | "image";
}

// Input component with icon
const StyledInput = ({ 
  name, 
  value, 
  placeholder, 
  type = "text", 
  onChange, 
  disabled = false, 
  icon = "search" 
}: StyledInputProps) => {
  const renderIcon = () => {
    if (icon === "search") {
      return (
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" viewBox="0 0 24 24">
          <g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" /></g>
        </svg>
      );
    } else if (icon === "user") {
      return (
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" viewBox="0 0 24 24">
          <g><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></g>
        </svg>
      );
    } else if (icon === "email") {
      return (
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" viewBox="0 0 24 24">
          <g><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></g>
        </svg>
      );
    } else if (icon === "grade") {
      return (
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" viewBox="0 0 24 24">
          <g><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" /></g>
        </svg>
      );
    } else if (icon === "title") {
      return (
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" viewBox="0 0 24 24">
          <g><path d="M5 4v3h5.5v12h3V7H19V4z" /></g>
        </svg>
      );
    } else if (icon === "description") {
      return (
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" viewBox="0 0 24 24">
          <g><path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z" /></g>
        </svg>
      );
    } else if (icon === "file") {
      return (
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" viewBox="0 0 24 24">
          <g><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></g>
        </svg>
      );
    } else if (icon === "image") {
      return (
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" viewBox="0 0 24 24">
          <g><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></g>
        </svg>
      );
    } else {
      return (
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" viewBox="0 0 24 24">
          <g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" /></g>
        </svg>
      );
    }
  };

  return (
    <div className="relative w-full">
      {renderIcon()}
      <input 
        name={name}
        value={value}
        placeholder={placeholder}
        type={type}
        onChange={onChange}
        disabled={disabled}
        className="w-full h-10 pl-10 pr-3 py-2 rounded-lg bg-gray-100 border-2 border-transparent focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition"
      />
    </div>
  );
};

interface StyledTextareaProps {
  name: string;
  value: string;
  placeholder: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

// Textarea component with icon
const StyledTextarea = ({ 
  name, 
  value, 
  placeholder, 
  onChange, 
  disabled = false 
}: StyledTextareaProps) => {
  return (
    <div className="relative w-full">
      <svg className="absolute left-4 top-4 w-4 h-4 text-gray-400" aria-hidden="true" viewBox="0 0 24 24">
        <g><path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z" /></g>
      </svg>
      <textarea 
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        className="w-full min-h-[120px] pl-10 pr-3 py-2 rounded-lg bg-gray-100 border-2 border-transparent focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition resize-vertical"
      />
    </div>
  );
};

// File upload component
interface FileUploadButtonProps {
  label: string;
  accept: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  fileName: string | null;
  icon?: "file" | "image";
}

const FileUploadButton = ({ 
  label, 
  accept, 
  onChange, 
  disabled = false,
  fileName = null,
  icon = "file"
}: FileUploadButtonProps) => {
  return (
    <div className="relative w-full mt-1">
      <label className={`relative flex items-center w-full h-10 pl-10 pr-3 py-2 rounded-lg bg-gray-100 border-2 border-transparent hover:border-blue-300 hover:bg-white hover:ring-2 hover:ring-blue-100 outline-none transition cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {icon === "file" ? (
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" viewBox="0 0 24 24">
            <g><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></g>
          </svg>
        ) : (
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" viewBox="0 0 24 24">
            <g><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></g>
          </svg>
        )}
        <input 
          type="file" 
          accept={accept}
          className="hidden"
          onChange={onChange}
          disabled={disabled}
        />
        <span className="text-gray-600 truncate">{fileName || label}</span>
      </label>
    </div>
  );
};

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
    otherMaterial: string;
    otherColor: string;
    otherFunction: string;
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
        otherMaterial: "",
        otherColor: "",
        otherFunction: "",
        pdf: null,
        images: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formErrors, setFormErrors] = useState<{[key: string]: boolean}>({});
    const [showErrorBanner, setShowErrorBanner] = useState(false);
    
    const [colorTags, setColorTags] = useState<ColorTag[]>([]);
    const [materialTags, setMaterialTags] = useState<MaterialTag[]>([]);
    const [isLoadingTags, setIsLoadingTags] = useState(true);
    
    useEffect(() => {
        const loadTags = async () => {
            try {
                setIsLoadingTags(true);
                const [colorTagsData, materialTagsData] = await Promise.all([
                    fetchColorTags(),
                    fetchMaterialTags()
                ]);
                
                setColorTags(colorTagsData);
                setMaterialTags(materialTagsData);
            } catch (error) {
                console.error("Error loading tags:", error);
            } finally {
                setIsLoadingTags(false);
            }
        };
        
        loadTags();
    }, []);
    
    // Add flash effect styles when component mounts
    useEffect(() => {
        // Create and add stylesheet for flash animation
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes flashBackground {
                0% { background-color: white; }
                50% { background-color: #FEE2E2; }
                100% { background-color: white; }
            }
            
            @keyframes flashSuccessBackground {
                0% { background-color: white; }
                50% { background-color: #DCFCE7; }
                100% { background-color: white; }
            }
            
            body.flashing {
                animation: flashBackground 0.8s ease;
            }
            
            body.success-flashing {
                animation: flashSuccessBackground 0.8s ease;
            }
            
            .form-container {
                position: relative;
                z-index: 1;
                background-color: white;
                border-radius: 0.5rem;
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            }
            
            .blur-backdrop {
                backdrop-filter: blur(5px);
                background-color: rgba(255, 255, 255, 0.6);
            }
        `;
        document.head.appendChild(style);
        
        // Cleanup
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    
    const [submissionSuccess, setSubmissionSuccess] = useState(false);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Clear the error for this field if it exists
        if (formErrors[name]) {
            setFormErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleTagSelect = (category: keyof FormData, tag: string) => {
        if (category === 'material' || category === 'color' || category === 'function') {
            // Clear the error for this category if it exists
            if (formErrors[category]) {
                setFormErrors(prev => {
                    const updated = { ...prev };
                    delete updated[category];
                    return updated;
                });
            }
            
            if (tag === 'Other') {
                // If Other is selected, add it to the list if not already present
                if (!formData[category].includes('Other')) {
                    setFormData((prev) => ({
                        ...prev,
                        [category]: [...prev[category], 'Other']
                    }));
                }
            } else {
                // For non-Other tags, toggle as before
                setFormData((prev) => ({
                    ...prev,
                    [category]: prev[category].includes(tag)
                        ? prev[category].filter((t: string) => t !== tag)
                        : [...prev[category], tag]
                }));
            }
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'pdf' | 'images') => {
        if (!e.target.files) return;
        
        const files = Array.from(e.target.files);
        if (type === "pdf") {
            setFormData((prev) => ({ ...prev, pdf: files[0] }));
            
            // Clear PDF error if it exists
            if (formErrors.pdf) {
                setFormErrors(prev => {
                    const updated = { ...prev };
                    delete updated.pdf;
                    return updated;
                });
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                images: [...prev.images, ...files].slice(0, 6) // Ensure max 6 images
            }));
            
            // Clear images error if we now have at least 3 images
            if (formErrors.images && formData.images.length + files.length >= 3) {
                setFormErrors(prev => {
                    const updated = { ...prev };
                    delete updated.images;
                    return updated;
                });
            }
        }
    };

    const isValidForm = () => {
        console.log("Validating form...", formData);
        
        // Create an object to track field errors
        const errors: {[key: string]: boolean} = {};
        
        // Check required text fields
        if (formData.firstName.trim() === "") errors.firstName = true;
        if (formData.lastName.trim() === "") errors.lastName = true;
        if (formData.gradeLevel.trim() === "") errors.gradeLevel = true;
        if (formData.email.trim() === "") errors.email = true;
        if (formData.title.trim() === "") errors.title = true;
        
        // If "Other" is selected for a category, ensure the corresponding custom value is provided
        if (formData.material.length === 0) {
            errors.material = true;
        } else if (formData.material.includes('Other') && formData.otherMaterial.trim() === '') {
            errors.otherMaterial = true;
        }
        
        if (formData.color.length === 0) {
            errors.color = true;
        } else if (formData.color.includes('Other') && formData.otherColor.trim() === '') {
            errors.otherColor = true;
        }
        
        if (formData.function.length === 0) {
            errors.function = true;
        } else if (formData.function.includes('Other') && formData.otherFunction.trim() === '') {
            errors.otherFunction = true;
        }
        
        // Check files
        if (formData.pdf === null) errors.pdf = true;
        if (formData.images.length < 3) errors.images = true;
        
        // Update form errors state
        setFormErrors(errors);
        
        // Form is valid if there are no errors
        return Object.keys(errors).length === 0;
    };

    const updateProgress = (progress: number) => {
        setUploadProgress(progress);
    };

    const handleSubmitForm = async () => {
        if (!isValidForm()) {
            setShowErrorBanner(true);
            
            // Flash the background
            document.body.classList.add('flashing');
            setTimeout(() => {
                document.body.classList.remove('flashing');
            }, 800);
            
            // Auto-hide the error banner after 1 second
            setTimeout(() => {
                setShowErrorBanner(false);
            }, 1000);
            
            return;
        }

        try {
            setIsSubmitting(true);
            setUploadProgress(0);
            
            console.log("Starting Supabase submission process...");
            
            // Process tags to include custom "Other" values if selected
            const processedFormData = {
                ...formData,
                material: formData.material.map(mat => 
                    mat === 'Other' ? `Other: ${formData.otherMaterial}` : mat
                ),
                color: formData.color.map(col => 
                    col === 'Other' ? `Other: ${formData.otherColor}` : col
                ),
                function: formData.function.map(func => 
                    func === 'Other' ? `Other: ${formData.otherFunction}` : func
                )
            };
            
            console.log("Form data:", {
                ...processedFormData,
                pdf: processedFormData.pdf?.name,
                images: processedFormData.images.map(img => img.name)
            });
            
            // Handle the submission process using Supabase
            const result = await handleSubmission(processedFormData, updateProgress);
            
            console.log("Submission complete!", result);
            
            // Show success message in the progress modal instead of alert
            setSubmissionSuccess(true);
            setUploadProgress(100);
            
            // Flash success background
            document.body.classList.add('success-flashing');
            
            // Auto-hide the success message after 1 second
            setTimeout(() => {
                document.body.classList.remove('success-flashing');
                setIsSubmitting(false);
                setSubmissionSuccess(false);
                
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
                    otherMaterial: "",
                    otherColor: "",
                    otherFunction: "",
                    pdf: null,
                    images: [],
                });
                
                // Clear any errors
                setFormErrors({});
                setShowErrorBanner(false);
            }, 1000);

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
            
            // Show error in the progress modal
            setSubmissionSuccess(false);
            alert("Submission failed: " + errorMessage);
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-start pt-20 px-4 sm:px-6 md:px-8 lg:px-10">
            {/* Error Modal */}
            {showErrorBanner && (
                <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-70 w-full max-w-md bg-white border border-red-500 shadow-lg rounded-md overflow-hidden">
                    <div className="p-4 flex items-center space-x-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="text-sm font-medium text-gray-900">Please fill in all required fields</div>
                    </div>
                </div>
            )}
            
            {/* Submission Progress */}
            {isSubmitting && (
                <div className="fixed inset-0 z-70 flex items-center justify-center blur-backdrop">
                    <div className="bg-white p-6 rounded-lg max-w-sm w-full shadow-xl">
                        <h2 className="text-lg font-semibold mb-4">
                            {submissionSuccess ? "Submission Complete!" : "Submitting your work..."}
                        </h2>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                            <div 
                                className={`h-2.5 rounded-full transition-all duration-300 ${submissionSuccess ? "bg-green-500" : "bg-blue-600"}`} 
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                        {submissionSuccess ? (
                            <div className="text-center">
                                <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-sm text-gray-600">Your project has been submitted successfully!</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">Please wait, uploading files...</p>
                        )}
                    </div>
                </div>
            )}

            <div className="max-w-2xl mx-auto p-6 relative w-full form-container">
                <h2 className="text-2xl font-bold mb-4">Submit Your Design Project</h2>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        {formErrors.firstName && (
                            <p className="text-red-500 text-xs font-medium mb-1">First name is required</p>
                        )}
                        <div className={formErrors.firstName ? "border-red-100 bg-red-50 rounded-lg" : ""}>
                            <StyledInput 
                                name="firstName" 
                                value={formData.firstName}
                                placeholder="First Name e.g. Tina"
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                icon="user"
                            />
                        </div>
                    </div>
                    <div>
                        {formErrors.lastName && (
                            <p className="text-red-500 text-xs font-medium mb-1">Last name is required</p>
                        )}
                        <div className={formErrors.lastName ? "border-red-100 bg-red-50 rounded-lg" : ""}>
                            <StyledInput 
                                name="lastName" 
                                value={formData.lastName}
                                placeholder="Last Name e.g. Qiu"
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                icon="user"
                            />
                        </div>
                    </div>
                    <div>
                        {formErrors.gradeLevel && (
                            <p className="text-red-500 text-xs font-medium mb-1">Grade level is required</p>
                        )}
                        <div className={formErrors.gradeLevel ? "border-red-100 bg-red-50 rounded-lg" : ""}>
                            <StyledInput 
                                name="gradeLevel" 
                                value={formData.gradeLevel}
                                placeholder="Grade Level e.g. 11"
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                icon="grade"
                            />
                        </div>
                    </div>
                    <div>
                        {formErrors.email && (
                            <p className="text-red-500 text-xs font-medium mb-1">Email is required</p>
                        )}
                        <div className={formErrors.email ? "border-red-100 bg-red-50 rounded-lg" : ""}>
                            <StyledInput 
                                type="email" 
                                name="email" 
                                value={formData.email}
                                placeholder="Email Address e.g. something@example.com"
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                icon="email"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="mt-4">
                    {formErrors.title && (
                        <p className="text-red-500 text-xs font-medium mb-1">Project title is required</p>
                    )}
                    <div className={formErrors.title ? "border-red-100 bg-red-50 rounded-lg" : ""}>
                        <StyledInput 
                            name="title" 
                            value={formData.title}
                            placeholder="Project Title" 
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            icon="title"
                        />
                    </div>
                </div>
                
                <div className="mt-4">
                    <StyledTextarea 
                        name="description" 
                        value={formData.description}
                        placeholder="Project Description (optional)" 
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                    />
                </div>

                {/* Material Selection */}
                <h3 className={`mt-4 text-sm font-semibold ${formErrors.material ? "text-red-500" : ""}`}>Select Main Material</h3>
                {isLoadingTags ? (
                    <div className="flex items-center space-x-2 mt-2">
                        <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500 text-xs">Loading materials...</span>
                    </div>
                ) : materialTags.length === 0 ? (
                    <p className="text-gray-500 text-xs mt-2">No materials available. Please check back later.</p>
                ) : (
                    <div className={`flex flex-col gap-2 mt-1 ${formErrors.material ? "p-2 border-red-100 bg-red-50 rounded-lg" : ""}`}>
                        <div className="flex flex-wrap gap-1">
                            {materialTags.map((mat) => (
                                <button
                                    key={mat.id}
                                    className={`px-2 py-1 text-xs rounded-full ${formData.material.includes(mat.name) ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'transition-colors'}`}
                                    onClick={() => !isSubmitting && handleTagSelect("material", mat.name)}
                                    disabled={isSubmitting}
                                >
                                    {mat.name}
                                </button>
                            ))}
                            <button
                                className={`px-2 py-1 text-xs rounded-full ${formData.material.includes('Other') ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'transition-colors'}`}
                                onClick={() => !isSubmitting && handleTagSelect("material", 'Other')}
                                disabled={isSubmitting}
                            >
                                Other
                            </button>
                        </div>
                        {formData.material.includes('Other') && (
                            <div className={formErrors.otherMaterial ? "border-red-100 bg-red-50 rounded-lg" : ""}>
                                <StyledInput 
                                    name="otherMaterial"
                                    value={formData.otherMaterial}
                                    placeholder="Please specify other material..."
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Color Selection */}
                <h3 className={`mt-3 text-sm font-semibold ${formErrors.color ? "text-red-500" : ""}`}>Select Main Color</h3>
                {isLoadingTags ? (
                    <div className="flex items-center space-x-2 mt-1">
                        <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500 text-xs">Loading colors...</span>
                    </div>
                ) : colorTags.length === 0 ? (
                    <p className="text-gray-500 text-xs mt-1">No colors available. Please check back later.</p>
                ) : (
                    <div className={`flex flex-col gap-2 mt-1 ${formErrors.color ? "p-2 border-red-100 bg-red-50 rounded-lg" : ""}`}>
                        <div className="flex flex-wrap gap-1">
                            {colorTags.map((col) => (
                                <button
                                    key={col.id}
                                    className={`px-2 py-1 text-xs rounded-full ${formData.color.includes(col.name) ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'transition-colors'}`}
                                    onClick={() => !isSubmitting && handleTagSelect("color", col.name)}
                                    disabled={isSubmitting}
                                >
                                    {col.name}
                                </button>
                            ))}
                            <button
                                className={`px-2 py-1 text-xs rounded-full ${formData.color.includes('Other') ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'transition-colors'}`}
                                onClick={() => !isSubmitting && handleTagSelect("color", 'Other')}
                                disabled={isSubmitting}
                            >
                                Other
                            </button>
                        </div>
                        {formData.color.includes('Other') && (
                            <div className={formErrors.otherColor ? "border-red-100 bg-red-50 rounded-lg" : ""}>
                                <StyledInput 
                                    name="otherColor"
                                    value={formData.otherColor}
                                    placeholder="Please specify other color..."
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Function Selection */}
                <h3 className={`mt-3 text-sm font-semibold ${formErrors.function ? "text-red-500" : ""}`}>Select Main Function</h3>
                <div className={`flex flex-col gap-2 mt-1 ${formErrors.function ? "p-2 border-red-100 bg-red-50 rounded-lg" : ""}`}>
                    <div className="flex flex-wrap gap-1">
                        {functions.map((func) => (
                            <button
                                key={func}
                                className={`px-2 py-1 text-xs rounded-full ${formData.function.includes(func) ? "bg-green-500 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'transition-colors'}`}
                                onClick={() => !isSubmitting && handleTagSelect("function", func)}
                                disabled={isSubmitting}
                            >
                                {func}
                            </button>
                        ))}
                        <button
                            className={`px-2 py-1 text-xs rounded-full ${formData.function.includes('Other') ? "bg-green-500 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'transition-colors'}`}
                            onClick={() => !isSubmitting && handleTagSelect("function", 'Other')}
                            disabled={isSubmitting}
                        >
                            Other
                        </button>
                    </div>
                    {formData.function.includes('Other') && (
                        <div className={formErrors.otherFunction ? "border-red-100 bg-red-50 rounded-lg" : ""}>
                            <StyledInput 
                                name="otherFunction"
                                value={formData.otherFunction}
                                placeholder="Please specify other function..."
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                            />
                        </div>
                    )}
                </div>

                {/* File Upload */}
                <h3 className={`mt-4 text-sm font-semibold ${formErrors.pdf ? "text-red-500" : ""}`}>Upload Your Design Project PDF</h3>
                <div className={formErrors.pdf ? "border-red-100 bg-red-50 rounded-lg" : ""}>
                    <FileUploadButton 
                      label="Click to upload a PDF"
                      accept="application/pdf"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => !isSubmitting && handleFileChange(e, "pdf")}
                      disabled={isSubmitting}
                      fileName={formData.pdf ? formData.pdf.name : null}
                      icon="file"
                    />
                </div>

                <h3 className={`mt-4 text-sm font-semibold ${formErrors.images ? "text-red-500" : ""}`}>Upload Design Project Photos (At least 3, Max 6)</h3>
                <div className={`mt-1 p-4 rounded-lg bg-gray-100 border-2 border-transparent hover:border-blue-300 hover:bg-white hover:ring-2 hover:ring-blue-100 transition ${formErrors.images ? "border-red-200 bg-red-50" : ""}`}>
                    <div className="flex flex-wrap gap-2 justify-start">
                        {formData.images.map((img, index) => (
                            <div
                                key={index}
                                className={`relative w-[calc(16.66%-8px)] h-24 cursor-pointer group ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => !isSubmitting && setFormData((prev) => ({
                                    ...prev,
                                    images: prev.images.filter((_, i) => i !== index)
                                }))}
                            >
                                <img
                                    src={URL.createObjectURL(img)}
                                    alt={`Uploaded ${index + 1}`}
                                    className="w-full h-full object-cover rounded-lg shadow-sm transition duration-200 hover:opacity-75"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <span className="text-red-500 font-bold text-xl bg-white bg-opacity-60 rounded-full w-6 h-6 flex items-center justify-center">✕</span>
                                </div>
                            </div>
                        ))}
                        {formData.images.length < 6 && !isSubmitting && (
                            <label
                                className={`flex flex-col items-center justify-center cursor-pointer w-[calc(16.66%-8px)] h-24 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => !isSubmitting && handleFileChange(e, "images")}
                                    disabled={isSubmitting}
                                />
                                <svg className="w-6 h-6 text-gray-400 mb-1" aria-hidden="true" viewBox="0 0 24 24">
                                    <g><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/></g>
                                </svg>
                                <span className="text-gray-500 text-xs">Add Photo</span>
                            </label>
                        )}
                    </div>
                </div>

                <button 
                    onClick={handleSubmitForm} 
                    className={`mt-6 bg-blue-600 text-white p-3 rounded-lg w-full cursor-pointer font-medium ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 transition'}`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Your Work'}
                </button>
            </div>
        </div>
    );
};

export default Submission;