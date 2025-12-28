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

  // 🖱️ Dragging ke liye Refs (Desktop Slide feature)
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  // Fetch Products
  const { data: products, isLoading } = useQuery({
    queryKey: ['newArrivals'],
    queryFn: () => fetchProducts({ sortBy: 'newest' }),
  });

  // Duplicate products for infinite loop effect
  const displayProducts = products ? [...products.slice(0, 8), ...products.slice(0, 8)] : [];

  // 🔄 Auto Scroll Logic
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollSpeed = 1; // Desktop Speed

    
    if (window.innerWidth < 768) {
      scrollSpeed = 2; 
    }

    const scroll = () => {
      
      if (isHovered || isDragging.current) return;

      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += scrollSpeed;
      }
    };

    const intervalId = setInterval(scroll, 20); 

    return () => clearInterval(intervalId);
  }, [isHovered, products]);

  // ⬅️➡️ Button Handlers (Mobile Only)
  const scrollLeft = () => {
    if (scrollRef.current) {
     
      setIsHovered(true);
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
      
      setTimeout(() => setIsHovered(false), 1000);
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      setIsHovered(true);
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
      setTimeout(() => setIsHovered(false), 1000);
    }
  };

  // 🖱️ Mouse Drag Handlers (For Desktop Slide)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    setIsHovered(true); 
    if (scrollRef.current) {
      startX.current = e.pageX - scrollRef.current.offsetLeft;
      scrollLeftStart.current = scrollRef.current.scrollLeft;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Speed of drag
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    setIsHovered(false);
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
        
        {/* Left Button  */}
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 p-3 rounded-full shadow-lg text-dark flex md:hidden active:scale-95 transition-transform"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable Container */}
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto hide-scrollbar scroll-smooth cursor-grab active:cursor-grabbing"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
           {displayProducts.map((product, index) => (
             <div key={`${product._id}-${index}`} className="w-64 md:w-72 shrink-0 select-none">
               <ProductCard product={product} />
             </div>
           ))}
        </div>

        {/* Right Button -  */}
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 p-3 rounded-full shadow-lg text-dark flex md:hidden active:scale-95 transition-transform"
          aria-label="Scroll Right"
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