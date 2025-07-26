import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
interface LayoutProps {
  children: React.ReactNode;
}
export const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isDashboardPage = location.pathname === '/dashboard';
  return <div className={`flex flex-col min-h-screen ${isDashboardPage ? 'bg-gray-50' : 'bg-white'}`}>
      {!isDashboardPage && <Navbar />}
      <main className="flex-grow">{children}</main>
    </div>;
};