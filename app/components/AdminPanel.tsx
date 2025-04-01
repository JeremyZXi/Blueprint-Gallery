import { useState, useEffect } from "react";
import { fetchPendingSubmissions, fetchApprovedSubmissions, fetchRejectedSubmissions } from "../utils/fetchSupabase";
import type { IASubmission } from "../utils/supabaseSubmission";
import { supabase } from "../utils/supabase";

interface AdminPanelProps {
    ias: IASubmission[];
}

const AdminPanel = ({ ias }: AdminPanelProps) => {
    const [activeTab, setActiveTab] = useState("home");
    const [pendingIAs, setPendingIAs] = useState<IASubmission[]>([]);
    const [approvedIAs, setApprovedIAs] = useState<IASubmission[]>([]);
    const [rejectedIAs, setRejectedIAs] = useState<IASubmission[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        // Fetch IAs for the active tab
        const fetchIAs = async () => {
            setLoading(true);
            try {
                // Always fetch counts for dashboard
                const pendingData = await fetchPendingSubmissions();
                setPendingIAs(pendingData);
                
                const approvedData = await fetchApprovedSubmissions();
                setApprovedIAs(approvedData);
                
                const rejectedData = await fetchRejectedSubmissions();
                setRejectedIAs(rejectedData);
            } catch (error) {
                console.error("Error fetching IAs:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchIAs();
    }, [activeTab]);

    const handleApproveIA = async (id: string | undefined) => {
        if (!id) {
            alert("Error: Missing submission ID");
            return;
        }
        
        if (confirm("Are you sure you want to approve this submission?")) {
            try {
                console.log(`Approving IA with ID: ${id}`);
                
                // Get the admin password from environment
                const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
                
                // Call the API endpoint
                const response = await fetch("/api/approveIA", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, password: adminPassword })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to approve submission");
                }
                
                // Remove from pending list
                setPendingIAs(prev => prev.filter(ia => ia.id !== id));
                alert("IA approved successfully!");
                
            } catch (error) {
                console.error("Error approving IA:", error);
                alert(`Error approving IA: ${error instanceof Error ? error.message : "Please try again"}`);
            }
        }
    };

    const handleRejectIA = async (id: string | undefined) => {
        if (!id) {
            alert("Error: Missing submission ID");
            return;
        }
        
        if (confirm("Are you sure you want to reject this submission? This will mark it as rejected.")) {
            try {
                console.log(`Rejecting IA with ID: ${id}`);
                
                // Get the admin password from environment
                const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
                
                // Call the API endpoint
                const response = await fetch("/api/rejectIA", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, password: adminPassword })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to reject submission");
                }
                
                // Remove from pending list
                setPendingIAs(prev => prev.filter(ia => ia.id !== id));
                alert("IA rejected successfully!");
                
            } catch (error) {
                console.error("Error rejecting IA:", error);
                alert(`Error rejecting IA: ${error instanceof Error ? error.message : "Please try again"}`);
            }
        }
    };

    const handleMoveToPending = async (id: string | undefined) => {
        if (!id) {
            alert("Error: Missing submission ID");
            return;
        }
        
        if (confirm("Are you sure you want to move this submission back to pending review?")) {
            try {
                console.log(`Moving submission to pending: ${id}`);
                
                // Get the admin password from environment
                const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
                
                // Update submission status to pending
                const { error } = await supabase
                    .from('submissions')
                    .update({ status: 'pending' })
                    .eq('id', id);
                
                if (error) {
                    throw new Error(`Failed to update submission status: ${error.message}`);
                }
                
                // Update UI by removing from rejected list
                setRejectedIAs(prev => prev.filter(ia => ia.id !== id));
                alert("Submission moved to pending successfully!");
                
            } catch (error) {
                console.error("Error moving submission to pending:", error);
                alert(`Error: ${error instanceof Error ? error.message : "Please try again"}`);
            }
        }
    };

    const handlePermanentDelete = async (id: string | undefined) => {
        if (!id) {
            alert("Error: Missing submission ID");
            return;
        }
        
        if (confirm("Are you sure you want to permanently delete this submission? This cannot be undone.")) {
            try {
                setIsDeleting(id);
                console.log(`Permanently deleting submission with ID: ${id}`);
                
                // Get the admin password from environment
                const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
                
                // 1. First, get the submission details to find file paths
                const { data: submission, error: fetchError } = await supabase
                    .from('submissions')
                    .select('pdfUrl, imageUrls')
                    .eq('id', id)
                    .single();
                
                if (fetchError) {
                    throw new Error(`Failed to fetch submission details: ${fetchError.message}`);
                }
                
                // 2. Delete files from storage if they exist
                if (submission) {
                    // Prepare an array of all file URLs
                    const filesToDelete = [
                        submission.pdfUrl,
                        ...(submission.imageUrls || [])
                    ].filter(Boolean);
                    
                    for (const fileUrl of filesToDelete) {
                        // Extract path from URL - this is a simplified approach
                        const pathMatch = fileUrl.match(/\/([^\/]+)\/([^?]+)/);
                        if (pathMatch && pathMatch.length >= 3) {
                            const path = pathMatch[2];
                            console.log(`Attempting to delete file: ${path}`);
                            
                            try {
                                await supabase.storage
                                    .from('submissions')
                                    .remove([path]);
                            } catch (storageError) {
                                console.error(`Error deleting file ${path}:`, storageError);
                                // Continue deleting other files even if one fails
                            }
                        }
                    }
                }
                
                // 3. Delete the record from the database
                const { error: deleteError } = await supabase
                    .from('submissions')
                    .delete()
                    .eq('id', id);
                
                if (deleteError) {
                    throw new Error(`Failed to delete submission: ${deleteError.message}`);
                }
                
                // 4. Update the UI
                setRejectedIAs(prev => prev.filter(ia => ia.id !== id));
                alert("Submission permanently deleted!");
                
            } catch (error) {
                console.error("Error deleting submission:", error);
                alert(`Error deleting submission: ${error instanceof Error ? error.message : "Please try again"}`);
            } finally {
                setIsDeleting(null);
            }
        }
    };

    return (
        <div className="flex">
            {/* Left Sidebar Navigation */}
            <nav className="w-20 h-screen bg-gray-200 flex flex-col items-center py-4">
                <button onClick={() => setActiveTab("home")} className="mb-4 cursor-pointer">🏠</button>
                <button onClick={() => setActiveTab("pending")} className="mb-4 cursor-pointer">⏳</button>
                <button onClick={() => setActiveTab("rejected")} className="mb-4 cursor-pointer">🗑️</button>
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-blue-100 p-4 rounded shadow">
                                <h2 className="font-bold">Total IAs</h2>
                                <p className="text-2xl">{pendingIAs.length + approvedIAs.length + rejectedIAs.length}</p>
                            </div>
                            <div className="bg-yellow-100 p-4 rounded shadow">
                                <h2 className="font-bold">Pending Approvals</h2>
                                <p className="text-2xl">{pendingIAs.length}</p>
                            </div>
                            <div className="bg-green-100 p-4 rounded shadow">
                                <h2 className="font-bold">Approved IAs</h2>
                                <p className="text-2xl">{approvedIAs.length}</p>
                            </div>
                            <div className="bg-red-100 p-4 rounded shadow">
                                <h2 className="font-bold">Rejected IAs</h2>
                                <p className="text-2xl">{rejectedIAs.length}</p>
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
                                                <h3 className="font-bold">Submission ID: {ia.id}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {ia.firstName} {ia.lastName} - {ia.title}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {ia.email} - Grade {ia.gradeLevel}
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
                                                {ia.pdfUrl ? (
                                                    <div className="border rounded p-2">
                                                        <a 
                                                            href={ia.pdfUrl} 
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
                                                {ia.imageUrls && ia.imageUrls.length > 0 ? (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {ia.imageUrls.map((img, idx) => (
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
                                        
                                        {/* Metadata */}
                                        <div className="p-4 border-t">
                                            <h4 className="font-semibold mb-2">Project Details</h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700">Materials</h5>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {ia.material ? ia.material.map((mat, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                                {mat}
                                                            </span>
                                                        )) : (
                                                            <span className="text-xs text-gray-500">No materials specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700">Colors</h5>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {ia.color ? ia.color.map((col, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                                                {col}
                                                            </span>
                                                        )) : (
                                                            <span className="text-xs text-gray-500">No colors specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700">Functions</h5>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {ia.function ? ia.function.map((func, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                                                {func}
                                                            </span>
                                                        )) : (
                                                            <span className="text-xs text-gray-500">No functions specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === "rejected" && (
                    <div>
                        <h1 className="text-2xl font-bold">Rejected Submissions</h1>
                        <p className="mb-4">View and manage rejected IA submissions.</p>
                        
                        {loading ? (
                            <div className="flex justify-center my-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : rejectedIAs.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded mt-4">
                                <p className="text-gray-500">No rejected IAs found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 mt-4">
                                {rejectedIAs.map((ia) => (
                                    <div key={ia.id} className="border rounded-lg overflow-hidden shadow-md bg-white border-red-200">
                                        <div className="p-4 border-b flex items-center justify-between bg-red-50">
                                            <div>
                                                <h3 className="font-bold">Submission ID: {ia.id}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {ia.firstName} {ia.lastName} - {ia.title}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {ia.email} - Grade {ia.gradeLevel}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleMoveToPending(ia.id)}
                                                    className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 transition-colors"
                                                >
                                                    Move to Pending
                                                </button>
                                                <button 
                                                    onClick={() => handlePermanentDelete(ia.id)}
                                                    disabled={isDeleting === ia.id}
                                                    className={`${isDeleting === ia.id 
                                                        ? 'bg-gray-500' 
                                                        : 'bg-black hover:bg-gray-800'} 
                                                        text-white px-4 py-1 rounded transition-colors`}
                                                >
                                                    {isDeleting === ia.id ? 'Deleting...' : 'Remove Completely'}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2">
                                            {/* PDF Preview */}
                                            <div className="mb-4">
                                                <h4 className="font-semibold mb-2">PDF Document</h4>
                                                {ia.pdfUrl ? (
                                                    <div className="border rounded p-2">
                                                        <a 
                                                            href={ia.pdfUrl} 
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
                                                {ia.imageUrls && ia.imageUrls.length > 0 ? (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {ia.imageUrls.map((img, idx) => (
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
                                        
                                        {/* Metadata */}
                                        <div className="p-4 border-t">
                                            <h4 className="font-semibold mb-2">Project Details</h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700">Materials</h5>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {ia.material ? ia.material.map((mat, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                                {mat}
                                                            </span>
                                                        )) : (
                                                            <span className="text-xs text-gray-500">No materials specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700">Colors</h5>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {ia.color ? ia.color.map((col, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                                                {col}
                                                            </span>
                                                        )) : (
                                                            <span className="text-xs text-gray-500">No colors specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700">Functions</h5>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {ia.function ? ia.function.map((func, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                                                {func}
                                                            </span>
                                                        )) : (
                                                            <span className="text-xs text-gray-500">No functions specified</span>
                                                        )}
                                                    </div>
                                                </div>
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