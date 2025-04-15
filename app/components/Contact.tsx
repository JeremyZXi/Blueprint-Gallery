import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                Have questions or want to learn more? Get in touch with us.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <Mail className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Email</h3>
                    <p className="text-gray-600">contact@example.com</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <Phone className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Phone</h3>
                    <p className="text-gray-600">+1 (123) 456-7890</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Address</h3>
                    <p className="text-gray-600">123 School Street, City, Country</p>
                </div>
            </div>
        </div>
    );
};

export default Contact; 