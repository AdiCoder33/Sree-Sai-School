
import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from './ui/sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  if (!user || isHomePage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        {/* Mobile sidebar - shown as overlay */}
        <div className="md:hidden">
          <Sidebar />
        </div>
        
        <SidebarInset className="flex-1 flex flex-col w-full md:w-auto">
          <Navbar />
          <main className="flex-1 p-4 md:p-6 overflow-hidden">
            <div className="h-full overflow-auto">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
