import React from 'react';
import Works from '~/components/Works';
import Hero from '~/components/Hero';
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';

export default function GalleryPage() {
    return (
        <div className="flex flex-col bg-[#44505D]">
            <Navbar />
            {/* Hero Section with Works */}
            <div className="h-screen relative">
                <Hero 
                    title="Gallery"
                    backgroundImage="/assets/hero1.png"
                />
                <div className="absolute bottom-1/3 left-0 right-0 z-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Works />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
} 