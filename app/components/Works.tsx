import React from 'react';
import { Link } from 'react-router-dom';

const Works = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* MYP Projects */}
            <Link
                to="/MYP-gallery"
                className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden hover:bg-white/95 transition-all duration-300 hover:scale-105"
            >
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">MYP Projects</h3>
                    <p className="text-gray-600">
                        Explore our Middle Years Programme projects, showcasing creativity and innovation.
                    </p>
                </div>
            </Link>

            {/* DP Projects */}
            <Link
                to="/DP-gallery"
                className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden hover:bg-white/95 transition-all duration-300 hover:scale-105"
            >
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">DP Projects</h3>
                    <p className="text-gray-600">
                        Discover our Diploma Programme projects, demonstrating advanced skills and knowledge.
                    </p>
                </div>
            </Link>

            {/* IA Projects */}
            <Link
                to="/IA-gallery"
                className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden hover:bg-white/95 transition-all duration-300 hover:scale-105"
            >
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">IA Projects</h3>
                    <p className="text-gray-600">
                        Browse our Internal Assessment projects, highlighting research and analysis skills.
                    </p>
                </div>
            </Link>
        </div>
    );
};

export default Works; 