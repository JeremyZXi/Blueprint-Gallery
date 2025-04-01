import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Palette, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="bg-[#141c27] shadow-md text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo 部分 */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <Palette className="h-8 w-8 text-blue-600" />
                            <h1 className="font-heading text-xl">Blueprint Gallery</h1>
                        </Link>
                    </div>

                    {/* 桌面端导航链接 */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="font-subheading text-lg hover:text-blue-600 transition-colors">
                            Home
                        </Link>
                        <Link to="/gallery" className="font-subheading text-lg hover:text-blue-600 transition-colors">
                            Gallery
                        </Link>
                        <Link to="/about" className="font-subheading text-lg hover:text-blue-600 transition-colors">
                            About Us
                        </Link>
                        <Link to="/submit" className="font-subheading text-lg hover:text-blue-600 transition-colors">
                            Submit Your Work
                        </Link>
                    </div>

                    {/* 移动端菜单按钮 */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-blue-600 focus:outline-none"
                            aria-expanded="false"
                        >
                            <span className="sr-only">打开主菜单</span>
                            {isMenuOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* 移动端菜单 */}
            <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <Link
                        to="/"
                        className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 hover:text-blue-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        to="/gallery"
                        className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 hover:text-blue-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Gallery
                    </Link>
                    <Link
                        to="/about"
                        className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 hover:text-blue-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        About Us
                    </Link>
                    <Link
                        to="/submit"
                        className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 hover:text-blue-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Submit Your Work
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
