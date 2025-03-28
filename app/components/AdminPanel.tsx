import { useState } from "react";

const AdminPanel = ({ ias }) => {
    const [activeTab, setActiveTab] = useState("home"); // Track current section

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
            <div className="flex-1 p-6">
                {activeTab === "home" && (
                    <div>
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <p>Welcome to the admin panel.</p>
                    </div>
                )}
                {activeTab === "pending" && (
                    <div>
                        <h1 className="text-2xl font-bold">Pending IA Approvals</h1>
                        <p>Here you can approve or reject pending IAs.</p>
                    </div>
                )}
                {activeTab === "classification" && (
                    <div>
                        <h1 className="text-2xl font-bold">Classification Panel</h1>
                        <p>Modify IA classifications here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;