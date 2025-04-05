// app/routes/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from "../components/Layout";
const NotFound = () => {
    return (
        <div className="bg-[url(/assets/hero2.png)]">
        <Layout>

        <div className="flex flex-col items-center justify-center min-h-screen ">
            <h1 className="text-6xl font-bold text-white mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-white mb-6">Page Not Found</h2>
            <p className="text-white mb-8 text-center">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/"
                className="px-6 py-4 bg-[#475569] text-white rounded-md hover:bg-blue-700 transition-colors"
            >
                Return Home
            </Link>
        </div>
        </Layout>
            </div>
    );
};

export default NotFound;
