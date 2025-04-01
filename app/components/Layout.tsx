import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
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
      <Navbar/>
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default Layout; 