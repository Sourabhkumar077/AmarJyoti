import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../../store/hooks';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false); 
  
  // Get cart items to calculate count dynamically
  const { items } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);

  // Calculate total quantity
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  //  Trigger Animation when cartCount changes
  useEffect(() => {
    if (cartCount === 0) return;

    setCartBump(true);
    const timer = setTimeout(() => {
      setCartBump(false);
    }, 300); // 300ms animation duration

    return () => clearTimeout(timer);
  }, [cartCount]);

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
         <img className='w-45 h-12 bg-transparent object-contain' src="/logo.png" alt="AmarJyoti" />
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
            <ShoppingBag 
              className={`w-6 h-6 transition-all duration-300 ${
                cartBump ? 'text-accent scale-125' : 'text-dark group-hover:text-accent'
              }`} 
            />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center">
                {/* Blinking Ping Effect */}
                {cartBump && (
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                )}
                {/* Actual Badge */}
                <span className="relative inline-flex rounded-full h-4 w-4 bg-accent text-white text-[10px] items-center justify-center font-bold">
                  {cartCount}
                </span>
              </span>
            )}
          </Link>
          
          <Link to={user ? "/account" : "/login"} className="hidden md:block hover:text-accent transition-colors">
            {user ? (
               <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold border border-accent/20">
                  {user.name?.charAt(0).toUpperCase()}
               </div>
            ) : (
               <User className="w-6 h-6 text-dark" />
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6 text-dark" /> : <Menu className="w-6 h-6 text-dark" />}
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
            className="md:hidden bg-white border-b border-accent/20 overflow-hidden shadow-lg"
          >
            <div className="flex flex-col p-4 space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className="text-dark font-medium py-2 border-b border-accent/5 hover:text-accent pl-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link 
                to={user ? "/account" : "/login"}
                className="flex items-center space-x-2 text-dark font-medium py-2 pl-2 hover:text-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>{user ? `My Account` : 'Login / Register'}</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;