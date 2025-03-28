import { useState } from "react";

const materials = ["Alloy", "Wood", "Plastic", "Glass", "Fabric", "Composite"];
const colors = ["Red", "Blue", "Green", "Black", "White", "Yellow"];
const functions = [
    "Organization & Storage",
    "Life Improvement & Decor",
    "Health & Wellness",
    "Innovative Gadgets & Tools",
    "Accessibility & Mobility Solutions"
];

const Submission = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        gradeLevel: "",
        email: "",
        title: "",
        material: [],
        color: [],
        function: [],
        pdf: null,
        images: []
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTagSelect = (category, tag) => {
        setFormData((prev) => ({
            ...prev,
            [category]: prev[category].includes(tag)
                ? prev[category].filter((t) => t !== tag)
                : [...prev[category], tag]
        }));
    };

    const handleFileChange = (e, type) => {
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

    const handleSubmit = async () => {
        if (!isValidForm()) {
            alert("Please fill out all required fields.");
            return;
        }

        try {
            // Step 1: Upload PDF to Cloudinary
            const uploadId = Date.now().toString(); // Unique ID for grouping PDF & images

            const pdfFormData = new FormData();
            pdfFormData.append("file", formData.pdf);
            pdfFormData.append("upload_preset", "your_cloudinary_preset");
            pdfFormData.append("folder", "blueprint_gallery_uploads"); // Upload to Cloudinary folder

// Add metadata as Cloudinary tags
            const pdfTags = [
                `id_${uploadId}`, // Unique ID to link PDF & images
                `name_${formData.firstName}_${formData.lastName}`,
                `email_${formData.email}`,
                ...formData.material.map((m) => `material_${m}`),
                ...formData.color.map((c) => `color_${c}`),
                ...formData.function.map((f) => `function_${f}`),
            ].join(",");

            pdfFormData.append("tags", pdfTags); // Attach tags to PDF
            console.log("Uploading PDF to Cloudinary with tags:", pdfTags);

            const pdfResponse = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/upload", {
                method: "POST",
                body: pdfFormData,
            });

            const pdfResult = await pdfResponse.json();
            if (!pdfResponse.ok) throw new Error("PDF upload failed");
            console.log("PDF Uploaded:", pdfResult.secure_url);

            // Step 2: Upload images to Cloudinary
            const imageUrls = [];
            for (const image of formData.images) {
                const imgFormData = new FormData();
                imgFormData.append("file", image);
                imgFormData.append("upload_preset", "your_cloudinary_preset");
                imgFormData.append("folder", "blueprint_gallery_uploads"); // Upload to folder

                // Use the same unique ID for linking images with PDF
                const imgTags = [`id_${uploadId}`];

                imgFormData.append("tags", imgTags.join(","));
                console.log("Uploading image to Cloudinary with tags:", imgTags);

                const imgResponse = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/upload", {
                    method: "POST",
                    body: imgFormData,
                });

                const imgResult = await imgResponse.json();
                if (!imgResponse.ok) throw new Error("Image upload failed");

                imageUrls.push(imgResult.secure_url);
            }
            console.log("All images uploaded:", imageUrls);

            // Step 3: Send IA details to backend
            const finalData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                gradeLevel: formData.gradeLevel,
                email: formData.email,
                title: formData.title,
                material: formData.material,
                color: formData.color,
                function: formData.function,
                pdfUrl: pdfResult.secure_url,
                images: imageUrls,
            };

            console.log("Sending final submission data to backend...");
            const response = await fetch("/api/submitIA", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalData),
            });

            if (!response.ok) throw new Error("Submission to backend failed");
            const result = await response.json();
            alert("Submission successful!");
            console.log("Final Response:", result);

            // Reset form after successful submission
            setFormData({
                firstName: "",
                lastName: "",
                gradeLevel: "",
                email: "",
                title: "",
                material: [],
                color: [],
                function: [],
                pdf: null,
                images: [],
            });

        } catch (error) {
            console.error("Error during submission:", error);
            alert("Submission failed, please try again.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Submit Your IA</h2>
            <div className="grid grid-cols-2 gap-4">
                <input type="text" name="firstName" placeholder="First Name" className="border p-2 rounded"
                       onChange={handleInputChange}/>
                <input type="text" name="lastName" placeholder="Last Name" className="border p-2 rounded"
                       onChange={handleInputChange}/>
                <input type="text" name="gradeLevel" placeholder="Grade Level" className="border p-2 rounded"
                       onChange={handleInputChange}/>
                <input type="email" name="email" placeholder="Email Address" className="border p-2 rounded"
                       onChange={handleInputChange}/>
                <input type="text" name="title" placeholder="IA Title" className="border p-2 rounded col-span-2"
                       onChange={handleInputChange}/>
            </div>

            {/* Material Selection */}
            <h3 className="mt-4">Select Main Material</h3>
            <div className="flex flex-wrap gap-2">
                {materials.map((mat) => (
                    <button
                        key={mat}
                        className={`p-2 border rounded ${formData.material.includes(mat) ? "bg-blue-500 text-white cursor-pointer" : "bg-gray-100 cursor-pointer"}`}
                        onClick={() => handleTagSelect("material", mat)}
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
                        className={`p-2 border rounded ${formData.color.includes(col) ? "bg-blue-500 text-white cursor-pointer" : "bg-gray-100 cursor-pointer"}`}
                        onClick={() => handleTagSelect("color", col)}
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
                        className={`p-2 border rounded ${formData.function.includes(func) ? "bg-blue-500 text-white cursor-pointer" : "bg-gray-100 cursor-pointer"}`}
                        onClick={() => handleTagSelect("function", func)}
                    >
                        {func}
                    </button>
                ))}
            </div>

            {/* File Upload */}
            <h3 className="mt-4">Upload Your IA PDF</h3>
            <label className="border p-2 rounded block cursor-pointer">
                <input type="file" accept="application/pdf" className="hidden"
                       onChange={(e) => handleFileChange(e, "pdf")}/>
                {formData.pdf ? formData.pdf.name : "Click to upload a PDF"}
            </label>

            <h3 className="mt-4">Upload IA Photos (At least 3, Max 6)</h3>
            <div className="border p-4 rounded flex gap-2 overflow-x-auto">
                {formData.images.map((img, index) => (
                    <div
                        key={index}
                        className="relative w-20 h-20 cursor-pointer group"
                        onClick={() => setFormData((prev) => ({
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
                {formData.images.length < 6 && (
                    <label
                        className="border p-2 rounded flex items-center justify-center cursor-pointer w-20 h-20 bg-gray-100">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "images")}
                        />
                        <span className="text-gray-500 text-sm">+ Add More</span>
                    </label>
                )}
            </div>

            <button onClick={handleSubmit} className="mt-4 bg-green-500 text-white p-2 rounded w-full cursor-pointer">
                Submit
            </button>
        </div>
    );
};

export default Submission;