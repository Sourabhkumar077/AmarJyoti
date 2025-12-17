import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, LogOut, ShoppingBag } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();

  const isActive = (path: string) => location.pathname === path
    ? "bg-accent text-white"
    : "text-subtle-text hover:bg-secondary/20";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-serif font-bold text-accent">Amar Jyoti Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className={`flex items-center px-4 py-3 rounded-md transition-colors ${isActive('/admin')}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link to="/admin/orders" className={`flex items-center px-4 py-3 rounded-md transition-colors ${isActive('/admin/orders')}`}>
            <Package className="w-5 h-5 mr-3" />
            Orders
          </Link>
          <Link to="/admin/products" className={`flex items-center px-4 py-3 rounded-md transition-colors ${isActive('/admin/products')}`}>
            <ShoppingBag className="w-5 h-5 mr-3" /> {/* Use ShoppingBag icon */}
            Products
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center px-4 py-3 text-red-500 hover:bg-red-50 rounded-md w-full transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 md:hidden">
          <span className="font-serif font-bold text-accent">Admin Panel</span>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;