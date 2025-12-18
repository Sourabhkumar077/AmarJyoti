import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../../store/hooks';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Get dynamic cart count from Redux
  const cartCount = useAppSelector((state) => state.cart.count);
  const user = useAppSelector((state) => state.auth.user);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Sarees', path: '/products?category=Saree' },
    { name: 'Suits', path: '/products?category=Suit' },
    { name: 'Lehengas', path: '/products?category=Lehenga' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-primary/95 backdrop-blur-md border-b border-accent/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-serif font-bold text-accent tracking-wide hover:opacity-80 transition-opacity">
         <img className='w-45 h-12 bg-transparent' src="/logo.png" alt="Logo" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className="text-dark hover:text-accent transition-colors font-medium text-sm uppercase tracking-wider"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-5">
          <Link to="/cart" className="relative group">
            <ShoppingBag className="w-6 h-6 text-dark group-hover:text-accent transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[10px] flex items-center justify-center rounded-full font-bold animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>
          
          <Link to={user ? "/account" : "/login"} className="hidden md:block hover:text-accent transition-colors">
            <User className="w-6 h-6 text-dark" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-primary border-b border-accent/20 overflow-hidden"
          >
            <div className="flex flex-col p-4 space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className="text-dark font-medium py-2 border-b border-accent/5"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link 
                to="/login"
                className="flex items-center space-x-2 text-dark font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>{user ? `Hi, ${user.name}` : 'Login / Register'}</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;