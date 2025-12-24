import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../../api/products.api';
import ProductCard from '../product/ProductCard';
import Loader from './Loader';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewArrivals: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch Products
  const { data: products, isLoading } = useQuery({
    queryKey: ['newArrivals'],
    queryFn: () => fetchProducts({ sortBy: 'newest' }),
  });

  // Duplicate products for infinite loop effect
  const displayProducts = products ? [...products.slice(0, 8), ...products.slice(0, 8)] : [];

  // Auto Scroll Logic
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollSpeed = 1; // Default Desktop Speed

    // 📱 Phone me speed badhane ke liye
    if (window.innerWidth < 768) {
      scrollSpeed = 2; // Faster on Mobile
    }

    const scroll = () => {
      // Agar user mouse upar rakha hai, to auto-scroll rok do
      if (isHovered) return;

      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        // Reset to start instantly for infinite effect
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += scrollSpeed;
      }
    };

    const intervalId = setInterval(scroll, 20); // Run every 20ms

    return () => clearInterval(intervalId);
  }, [isHovered, products]);

  // Button Handlers
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (isLoading) return <Loader />;

  return (
    <section className="py-16 bg-white relative group">
      <div className="container mx-auto px-4 mb-8 flex justify-between items-end">
        <div>
           <h2 className="text-3xl md:text-4xl font-serif font-bold text-dark mb-2">New Arrivals</h2>
           <p className="text-subtle-text">Discover our latest ethnic collections.</p>
        </div>
        <button 
           onClick={() => navigate('/products')} 
           className="hidden md:flex items-center gap-2 text-accent font-medium hover:text-yellow-600 transition"
        >
           View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="relative container mx-auto px-4">
        
        {/* Left Button */}
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-3 rounded-full shadow-md hover:bg-white text-dark hidden group-hover:block transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable Container */}
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto hide-scrollbar scroll-smooth"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
           {displayProducts.map((product, index) => (
             <div key={`${product._id}-${index}`} className="w-64 md:w-72 shrink-0">
               <ProductCard product={product} />
             </div>
           ))}
        </div>

        {/* Right Button */}
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-3 rounded-full shadow-md hover:bg-white text-dark hidden group-hover:block transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

      </div>

      <div className="mt-8 text-center md:hidden">
         <button onClick={() => navigate('/category/all')} className="inline-flex items-center gap-2 text-accent font-medium">
            View All Collection <ArrowRight className="w-4 h-4" />
         </button>
      </div>

    </section>
  );
};

export default NewArrivals;