import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Navigation */}
      <header className="bg-blue-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center">
          {/* Logo / Title */}
          <Link to="/" className="font-bold text-2xl mb-2 sm:mb-0">
            Blueprint Gallery
          </Link>
          
          {/* Navigation Links */}
          <nav className="flex gap-6">
            <Link 
              to="/" 
              className={`hover:text-blue-200 transition-colors ${isActive('/') ? 'font-bold' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/gallery" 
              className={`hover:text-blue-200 transition-colors ${isActive('/gallery') ? 'font-bold' : ''}`}
            >
              Gallery
            </Link>
            <Link 
              to="/submit" 
              className={`hover:text-blue-200 transition-colors ${isActive('/submit') ? 'font-bold' : ''}`}
            >
              Submit IA
            </Link>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600">© {new Date().getFullYear()} Blueprint Gallery. All rights reserved.</p>
            </div>
            <div className="flex gap-4">
              <Link to="/admin" className="text-gray-500 hover:text-gray-700">
                Admin
              </Link>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 