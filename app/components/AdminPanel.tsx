import { useState, useEffect } from "react";
import { fetchIAsFromCloudinary } from "../utils/fetchCloudinary";

interface CloudinaryResource {
    secure_url: string;
    format: string;
    resource_type: string;
    tags: string[];
}

interface IASubmission {
    id: string;
    pdf: string | null;
    images: string[];
    tags?: string[];
}

interface AdminPanelProps {
    ias: IASubmission[];
}

const AdminPanel = ({ ias }: AdminPanelProps) => {
    const [activeTab, setActiveTab] = useState("home");
    const [pendingIAs, setPendingIAs] = useState<IASubmission[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Filter IAs that have the "pending" tag
        const fetchPendingIAs = async () => {
            setLoading(true);
            try {
                const cloudinaryData = await fetchIAsFromCloudinary();
                
                // Group the resources by their identifier
                const grouped = groupItemsByIdentifier(cloudinaryData);
                
                // Filter only those with "pending" tag
                const pendingOnly = grouped.filter((item: IASubmission) => 
                    item.tags && item.tags.includes("pending")
                );
                
                setPendingIAs(pendingOnly);
            } catch (error) {
                console.error("Error fetching pending IAs:", error);
            } finally {
                setLoading(false);
            }
        };
        
        if (activeTab === "pending") {
            fetchPendingIAs();
        }
    }, [activeTab]);

    function groupItemsByIdentifier(resources: CloudinaryResource[]): IASubmission[] {
        const grouped: Record<string, IASubmission> = {};
        
        resources.forEach((resource: CloudinaryResource) => {
            // Find ID tag
            const idTag = resource.tags.find((tag: string) => tag.startsWith("id_"));
            if (!idTag) return;
            
            if (!grouped[idTag]) {
                grouped[idTag] = {
                    id: idTag,
                    pdf: null,
                    images: [],
                    tags: resource.tags
                };
            }
            
            if (resource.resource_type === "raw" && resource.format === "pdf") {
                grouped[idTag].pdf = resource.secure_url;
            } else if (resource.resource_type === "image") {
                grouped[idTag].images.push(resource.secure_url);
            }
        });
        
        return Object.values(grouped);
    }

    const handleApproveIA = async (id: string) => {
        // Call API to approve the IA (remove pending tag)
        if (confirm("Are you sure you want to approve this submission?")) {
            try {
                console.log(`Approving IA with ID: ${id}`);
                // Call backend API to update Cloudinary tags
                const response = await fetch("/api/approveIA", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id })
                });
                
                if (response.ok) {
                    // Remove from pending list
                    setPendingIAs(prev => prev.filter(ia => ia.id !== id));
                    alert("IA approved successfully!");
                } else {
                    alert("Failed to approve IA. Please try again.");
                }
            } catch (error) {
                console.error("Error approving IA:", error);
                alert("Error approving IA. Please try again.");
            }
        }
    };

    const handleRejectIA = async (id: string) => {
        // Call API to reject the IA (remove from Cloudinary)
        if (confirm("Are you sure you want to reject this submission? This will delete it.")) {
            try {
                console.log(`Rejecting IA with ID: ${id}`);
                // Call backend API to remove from Cloudinary
                const response = await fetch("/api/rejectIA", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id })
                });
                
                if (response.ok) {
                    // Remove from pending list
                    setPendingIAs(prev => prev.filter(ia => ia.id !== id));
                    alert("IA rejected and removed successfully!");
                } else {
                    alert("Failed to reject IA. Please try again.");
                }
            } catch (error) {
                console.error("Error rejecting IA:", error);
                alert("Error rejecting IA. Please try again.");
            }
        }
    };

    return (
        <div className="flex">
            {/* Left Sidebar Navigation */}
            <nav className="w-20 h-screen bg-gray-200 flex flex-col items-center py-4">
                <button onClick={() => setActiveTab("home")} className="mb-4 cursor-pointer">🏠</button>
                <button onClick={() => setActiveTab("pending")} className="mb-4 cursor-pointer">⏳</button>
                <button onClick={() => setActiveTab("classification")} className="mb-4 cursor-pointer">📂</button>
                <button
                    className="mt-4 p-2 bg-red-500 text-white rounded cursor-pointer"
                    onClick={() => {
                        localStorage.removeItem("admin_authenticated");
                        localStorage.removeItem("admin_auth_expiration");
                        window.location.href = "/"; // Redirect to homepage
                    }}
                >
                    Logout
                </button>
            </nav>

            {/* Main Content - Render based on activeTab */}
            <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === "home" && (
                    <div>
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <p className="mb-4">Welcome to the admin panel.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div className="bg-blue-100 p-4 rounded shadow">
                                <h2 className="font-bold">Total IAs</h2>
                                <p className="text-2xl">{ias.length}</p>
                            </div>
                            <div className="bg-yellow-100 p-4 rounded shadow">
                                <h2 className="font-bold">Pending Approvals</h2>
                                <p className="text-2xl">{pendingIAs.length}</p>
                            </div>
                            <div className="bg-green-100 p-4 rounded shadow">
                                <h2 className="font-bold">Approved IAs</h2>
                                <p className="text-2xl">{ias.length - pendingIAs.length}</p>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === "pending" && (
                    <div>
                        <h1 className="text-2xl font-bold">Pending IA Approvals</h1>
                        <p className="mb-4">Review and approve/reject submitted IAs.</p>
                        
                        {loading ? (
                            <div className="flex justify-center my-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : pendingIAs.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded mt-4">
                                <p className="text-gray-500">No pending IAs to approve at this time.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 mt-4">
                                {pendingIAs.map((ia) => (
                                    <div key={ia.id} className="border rounded-lg overflow-hidden shadow-md bg-white">
                                        <div className="p-4 border-b flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold">Submission ID: {ia.id.replace("id_", "")}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {ia.tags?.filter(tag => tag.startsWith("name_")).map(tag => 
                                                        tag.replace("name_", "").replace("_", " ")
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleApproveIA(ia.id)}
                                                    className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleRejectIA(ia.id)}
                                                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2">
                                            {/* PDF Preview */}
                                            <div className="mb-4">
                                                <h4 className="font-semibold mb-2">PDF Document</h4>
                                                {ia.pdf ? (
                                                    <div className="border rounded p-2">
                                                        <a 
                                                            href={ia.pdf} 
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 underline flex items-center"
                                                        >
                                                            <span>View PDF</span>
                                                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-100 p-4 rounded text-gray-500">
                                                        No PDF available
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Images Preview */}
                                            <div>
                                                <h4 className="font-semibold mb-2">Uploaded Images</h4>
                                                {ia.images.length > 0 ? (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {ia.images.map((img, idx) => (
                                                            <a 
                                                                key={idx}
                                                                href={img}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block h-20 bg-gray-100 border rounded overflow-hidden"
                                                            >
                                                                <img 
                                                                    src={img} 
                                                                    alt={`Preview ${idx + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </a>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-100 p-4 rounded text-gray-500">
                                                        No images available
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === "classification" && (
                    <div>
                        <h1 className="text-2xl font-bold">Classification Panel</h1>
                        <p className="mb-4">Modify IA classifications here.</p>
                        
                        {/* Classification UI will be implemented here */}
                        <div className="bg-gray-50 p-6 rounded">
                            <p className="text-center text-gray-500">Classification features coming soon.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;