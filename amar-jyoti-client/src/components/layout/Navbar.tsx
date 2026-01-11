import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../../store/hooks';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false); 
  const [isScrolled, setIsScrolled] = useState(false); 
  const location = useLocation();

  const { items } = useAppSelector((state: any) => state.cart);
  const { user } = useAppSelector((state: any) => state.auth);

  const cartList = Array.isArray(items) ? items : [];
  const cartCount = cartList.reduce((total: number, item: any) => total + (item.quantity || 0), 0);

  useEffect(() => {
    const handleScroll = () => {  
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cart Animation
  useEffect(() => {
    if (cartCount === 0) return;
    setCartBump(true);
    const timer = setTimeout(() => setCartBump(false), 300);
    return () => clearTimeout(timer);
  }, [cartCount]);

  // Check if we are on the Home page 
  const isHomePage = location.pathname === '/';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Sarees', path: '/products?category=Saree' },
    { name: 'Suits', path: '/products?category=Suit' },
    { name: 'Lehengas', path: '/products?category=Lehenga' },
  ];

  return (
    <nav 
      className={`${
        isHomePage ? 'fixed' : 'sticky' 
      } top-0 left-0 w-full z-100 transition-all duration-300 ease-in-out ${
        isScrolled || !isHomePage
          ? 'bg-white/80 backdrop-blur-md shadow-sm py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-6 h-14 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="shrink-0 group">
         <img 
            className={`transition-all duration-300 object-contain ${
                isScrolled ? 'h-10 w-auto' : 'h-12 w-auto'
            }`} 
            src="/logo.png" 
            alt="AmarJyoti" 
         />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`font-medium text-xs uppercase tracking-[0.15em] transition-colors hover:text-accent relative group ${
                !isScrolled && isHomePage ? 'text-dark/90' : 'text-dark'
              }`}
            >
              {link.name}
              {/* Hover Underline Animation */}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-6">
          
          <Link to="/cart" className="relative group p-1">
            <ShoppingBag 
              className={`w-5 h-5 transition-all duration-300 ${
                cartBump ? 'text-accent scale-110' : 'text-dark hover:text-accent'
              }`} 
            />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 flex items-center justify-center">
                {cartBump && (
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                )}
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent text-white text-[9px] items-center justify-center font-bold">
                  {cartCount}
                </span>
              </span>
            )}
          </Link>
          
          <Link to={user ? "/account" : "/login"} className="hidden md:block hover:text-accent transition-colors">
            {user ? (
               <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold border border-accent/20 text-xs">
                  {user.name?.charAt(0).toUpperCase()}
               </div>
            ) : (
               <User className="w-5 h-5 text-dark" />
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
            className="md:hidden bg-white border-b border-accent/20 overflow-hidden shadow-xl"
          >
            <div className="flex flex-col p-6 space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className="text-dark font-serif text-lg border-b border-gray-100 pb-2 hover:text-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link 
                to={user ? "/account" : "/login"}
                className="flex items-center space-x-2 text-subtle-text font-medium pt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-5 h-5" />
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