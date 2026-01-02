import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  LogOut, 
  ShoppingBag, 
  Star, 
  Menu, 
  X 
} from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();

  const isActive = (path: string) => location.pathname === path
    ? "bg-accent text-white shadow-md translate-x-1"
    : "text-subtle-text hover:bg-gray-50 hover:text-dark hover:translate-x-1";

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: Package },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      
      {/* --- Mobile Overlay (Click to Close) --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- Sidebar --- */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-xl 
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:flex md:flex-col
        `}
      >
        {/* Header / Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white">
          <span className="text-xl font-serif font-bold text-accent">Amar Jyoti Admin</span>
          {/* Close Button for Mobile */}
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="md:hidden text-gray-500 hover:text-red-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                onClick={() => setSidebarOpen(false)} // Close menu on mobile click
                className={`flex items-center px-4 py-3 rounded-md transition-all duration-200 font-medium ${isActive(item.path)}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Fixed Logout Button */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center px-4 py-3 text-red-500 hover:bg-red-50 rounded-md w-full transition-colors font-medium"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:hidden shrink-0 z-30">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-dark hover:bg-gray-100 rounded-md mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-serif font-bold text-accent text-lg">Admin Panel</span>
        </header>

        {/* Page Content (Scrollable) */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;