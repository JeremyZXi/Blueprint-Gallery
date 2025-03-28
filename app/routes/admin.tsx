import { useEffect, useState } from "react";
import PasswordComponent from "../components/PasswordComponent";
import { fetchIAsFromCloudinary } from "../utils/fetchCloudinary";
import AdminPanel from "../components/AdminPanel";


export default function AdminPage() {
    const [ias, setIAs] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState("home"); // Track current section

    useEffect(() => {
        const auth = localStorage.getItem("admin_authenticated");
        const expiration = localStorage.getItem("admin_auth_expiration");
        const currentTime = Date.now();

        if (auth === "true" && expiration && currentTime < parseInt(expiration)) {
            setIsAuthenticated(true);
        } else {
            localStorage.removeItem("admin_authenticated"); // Expired session
            localStorage.removeItem("admin_auth_expiration");
            setIsAuthenticated(false);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined" && isAuthenticated) {
            async function loadIAs() {
                const cloudinaryData = await fetchIAsFromCloudinary();
                const groupedIAs = groupByIdentifier(cloudinaryData);
                setIAs(groupedIAs);
            }
            loadIAs();
        }
    }, [isAuthenticated]);

    function groupByIdentifier(files: { secure_url: string; format: string; tags: string[] }[]) {
        const grouped: Record<string, { pdf: string | null; images: string[] }> = {};

        files.forEach((file) => {
            const identifier = file.tags[0];
            if (!grouped[identifier]) grouped[identifier] = { pdf: null, images: [] };

            if (file.format === "pdf") grouped[identifier].pdf = file.secure_url;
            else grouped[identifier].images.push(file.secure_url);
        });

        return Object.entries(grouped).map(([id, data]) => ({ id, ...data }));
    }

    return (
        <div className="flex">
            {!isAuthenticated ? (
                <PasswordComponent onAuthSuccess={setIsAuthenticated} />
            ) : (
                <AdminPanel ias={ias} />
            )}
        </div>
    );
}