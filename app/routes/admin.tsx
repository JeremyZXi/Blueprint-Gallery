import { useEffect, useState } from "react";
import PasswordComponent from "../components/PasswordComponent";
import AdminPanel from "../components/AdminPanel";
import type { Route } from "./+types/home";
import { fetchSubmissionsFromSupabase } from "../utils/fetchSupabase";
import type { IASubmission } from "../utils/supabaseSubmission";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Panel | Blueprint Gallery" },
    { name: "description", content: "Administrator panel for Blueprint Gallery" },
  ];
}

export default function AdminPage() {
    const [ias, setIAs] = useState<IASubmission[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

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
                try {
                    const submissions = await fetchSubmissionsFromSupabase();
                    setIAs(submissions);
                } catch (error) {
                    console.error("Error loading submissions:", error);
                }
            }
            loadIAs();
        }
    }, [isAuthenticated]);

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