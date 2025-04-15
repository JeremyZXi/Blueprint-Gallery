import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Palette, Menu, X } from 'lucide-react';

// 处理链接跳转并滚动到锚点
const NavLink = ({ to, children, className, onClick }: { to: string; children: React.ReactNode; className: string; onClick?: () => void }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        
        // 如果有传入的onClick函数（用于关闭菜单等），执行它
        if (onClick) onClick();
        
        // 如果链接包含锚点
        if (to.includes('#')) {
            const [path, hash] = to.split('#');
            const targetPath = path || '/';
            
            // 如果我们已经在目标页面（首页），只需滚动到锚点
            if (location.pathname === '/' || location.pathname === targetPath) {
                const element = document.getElementById(hash);
                if (element) {
                    // 平滑滚动到元素
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                // 如果不在目标页面，先导航到页面，然后滚动到锚点
                navigate(`${targetPath}#${hash}`);
            }
        } else {
            // 常规链接，直接导航
            navigate(to);
        }
    };
    
    return (
        <a href={to} className={className} onClick={handleClick}>
            {children}
        </a>
    );
};

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="bg-[#141c27] shadow-md text-white w-full">
            <div className="container-fluid px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo 部分 */}
                    <div className="flex-shrink-0 flex items-center pl-0">
                        <Link to="/" className="flex items-center">
                            <Palette className="h-8 w-8 text-blue-600 flex-shrink-0" />
                            <span className="ml-2 font-heading text-xl whitespace-nowrap">Blueprint Gallery</span>
                        </Link>
                    </div>

                    {/* 桌面端导航链接 */}
                    <div className="hidden md:flex items-center space-x-8">
                        <NavLink to="/" className="font-subheading text-lg hover:text-blue-600 transition-colors">
                            Home
                        </NavLink>
                        <NavLink to="/gallery" className="font-subheading text-lg hover:text-blue-600 transition-colors">
                            Gallery
                        </NavLink>
                        <NavLink to="/about" className="font-subheading text-lg hover:text-blue-600 transition-colors">
                            About Us
                        </NavLink>
                        <NavLink to="/submit" className="font-subheading text-lg hover:text-blue-600 transition-colors">
                            Submit Your Work
                        </NavLink>
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
                    <NavLink
                        to="/"
                        className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 hover:text-blue-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/gallery"
                        className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 hover:text-blue-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Gallery
                    </NavLink>
                    <NavLink
                        to="/about"
                        className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 hover:text-blue-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        About Us
                    </NavLink>
                    <NavLink
                        to="/submit"
                        className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 hover:text-blue-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Submit Your Work
                    </NavLink>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
