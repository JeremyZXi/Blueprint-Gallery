import React from 'react';

const About = () => {
    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About Us</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                We are dedicated to showcasing the innovative and creative projects of our students.
                Our gallery features works from various programs, highlighting the talent and dedication
                of our student community.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Mission</h3>
                    <p className="text-gray-600">
                        To inspire and showcase student creativity through innovative projects and designs.
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Vision</h3>
                    <p className="text-gray-600">
                        To create a platform where student work can be celebrated and shared with the community.
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Values</h3>
                    <p className="text-gray-600">
                        We value creativity, innovation, and the pursuit of excellence in all student projects.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About; 