import { useState } from "react";

const PasswordComponent = ({ onAuthSuccess }: { onAuthSuccess: (isAuth: boolean) => void }) => {
    const [input, setInput] = useState("");
    const [error, setError] = useState("");

    const handleLogin = () => {
        const storedPassword = import.meta.env.VITE_ADMIN_PASSWORD; // Get password from env

        if (input === storedPassword) {
            const expirationTime = Date.now() + 60 * 1000; // 1 minute session
            localStorage.setItem("admin_authenticated", "true");
            localStorage.setItem("admin_auth_expiration", expirationTime.toString());
            onAuthSuccess(true);
        } else {
            setError("Incorrect password. Try again.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h2 className="text-lg font-bold mb-2">Enter Admin Password</h2>
            <input
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter password"
                className="border p-2 rounded"
            />
            <button onClick={handleLogin} className="mt-2 p-2 bg-blue-500 text-white rounded">
                Login
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
};

export default PasswordComponent;