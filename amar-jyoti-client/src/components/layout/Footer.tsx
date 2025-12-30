import { Facebook, Instagram, Twitter } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white pt-20 pb-10">
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

        {/* Brand */}
        <div>
          <h2 className="text-3xl font-serif text-accent mb-6">Amar Jyoti</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Celebrating the timeless elegance of Indian ethnic wear. We bring you handpicked Sarees, Suits, and Lehengas directly from the weavers.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors"><Twitter className="w-5 h-5" /></a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h3 className="text-lg font-serif mb-6">Shop Collection</h3>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li><Link to="/products?category=Saree" className="hover:text-accent transition-colors">Banarasi Sarees</Link></li>
            <li><Link to="/products?category=Suit" className="hover:text-accent transition-colors">Designer Suits</Link></li>
            <li><Link to="/products?category=Lehenga" className="hover:text-accent transition-colors">Bridal Lehengas</Link></li>
            <li><Link to="/products?sort=newest" className="hover:text-accent transition-colors">New Arrivals</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-serif mb-6">Customer Care</h3>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li><Link to="/account" className="hover:text-accent transition-colors">Track Order</Link></li>
            <li><Link to="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-accent transition-colors">Shipping Policy</Link></li>
            <li><Link to="/returns" className="hover:text-accent transition-colors">Exchange orders</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-serif mb-6">Stay Updated</h3>
          <p className="text-gray-400 text-sm mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
          <form className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-white/5 border border-white/10 px-4 py-2 rounded-l-md w-full focus:outline-none focus:border-accent text-sm"
            />
            <button className="bg-accent px-4 py-2 rounded-r-md text-white font-medium hover:bg-yellow-600 transition-colors">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="container border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
        <p>&copy; 2025 Amar Jyoti. All rights reserved. | Designed with ❤️ for Ethnic Fashion</p>
      </div>
    </footer>
  );
};

export default Footer;