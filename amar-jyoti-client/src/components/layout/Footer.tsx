import { Facebook, Instagram, Twitter } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white pt-20 pb-10 border-t-4 border-accent">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

        {/* 1. Brand Section */}
        <div>
          <h2 className="text-3xl font-serif text-accent mb-6 tracking-wide">Amar Jyoti</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
            Celebrating the timeless elegance of Indian ethnic wear. Handpicked Sarees, Suits, and Lehengas directly from the weavers.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:text-white hover:border-accent transition-all duration-300 text-gray-400">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:text-white hover:border-accent transition-all duration-300 text-gray-400">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:text-white hover:border-accent transition-all duration-300 text-gray-400">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* 2. Shop Links */}
        <div>
          <h3 className="text-lg font-serif mb-6 text-white tracking-wide">Collections</h3>
          <ul className="space-y-3 text-gray-400 text-sm font-light">
            <li><Link to="/products?category=Saree" className="hover:text-accent hover:pl-1 transition-all">Banarasi Sarees</Link></li>
            <li><Link to="/products?category=Suit" className="hover:text-accent hover:pl-1 transition-all">Designer Suits</Link></li>
            <li><Link to="/products?category=Lehenga" className="hover:text-accent hover:pl-1 transition-all">Bridal Lehengas</Link></li>
            <li><Link to="/products?sort=newest" className="hover:text-accent hover:pl-1 transition-all">New Arrivals</Link></li>
          </ul>
        </div>

        {/* 3. Customer Care */}
        <div>
          <h3 className="text-lg font-serif mb-6 text-white tracking-wide">Support</h3>
          <ul className="space-y-3 text-gray-400 text-sm font-light">
            <li><Link to="/account" className="hover:text-accent hover:pl-1 transition-all">Track Order</Link></li>
            <li><Link to="/contact" className="hover:text-accent hover:pl-1 transition-all">Contact Us</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-accent hover:pl-1 transition-all">Shipping Policy</Link></li>
            <li><Link to="/returns" className="hover:text-accent hover:pl-1 transition-all">Exchange & Returns</Link></li>
          </ul>
        </div>

        {/* 4. Newsletter */}
        <div>
          <h3 className="text-lg font-serif mb-6 text-white tracking-wide">Stay Updated</h3>
          <p className="text-gray-400 text-sm mb-4 font-light">Subscribe to receive updates, access to exclusive deals, and more.</p>
          <form className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-white/5 border border-white/10 px-4 py-2 rounded-l-md w-full focus:outline-none focus:border-accent text-sm text-white placeholder-gray-500"
            />
            <button className="bg-accent px-4 py-2 rounded-r-md text-white font-medium hover:bg-yellow-600 transition-colors">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 border-t border-white/10 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Copyright Left */}
          <p className="text-gray-500 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Amar Jyoti. All rights reserved.
          </p>
          
          {/* Links Right */}
          <div className="flex gap-6 text-sm">
            <Link to="/terms" className="text-gray-500 hover:text-accent transition-colors">Terms & Conditions</Link>
            <Link to="/privacy" className="text-gray-500 hover:text-accent transition-colors">Privacy Policy</Link>
          </div>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;