import React, { useEffect, useRef,  useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../../api/products.api';
import ProductCard from '../product/ProductCard';
import Loader from './Loader';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewArrivals: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // ⏸ Interaction State
  // We use a Ref for pausing to avoid re-triggering the animation loop constantly
  const isPaused = useRef(false); 
  const isDragging = useRef(false);

  //  Drag & Scroll Physics Refs
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const totalDragDistance = useRef(0);

  //  Fetch Products
  const { data: products, isLoading } = useQuery({
    queryKey: ['newArrivals'],
    queryFn: () => fetchProducts({ sortBy: 'newest' }),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes for efficiency
  });

  //  Memoize product list to prevent recalc on every render
  const displayProducts = useMemo(() => {
    return products ? [...products.slice(0, 8), ...products.slice(0, 8)] : [];
  }, [products]);

  //  Optimized Animation Loop
  const animateScroll = useCallback(() => {
    const scrollContainer = scrollRef.current;
    
    // Stop if: Component unmounted OR Paused (Hover/Touch) OR User Dragging
    if (!scrollContainer || isPaused.current || isDragging.current) {
      // Keep requesting frames to check when we can resume, 
      // but don't perform heavy DOM updates.
      animationFrameId.current = requestAnimationFrame(animateScroll);
      return; 
    }

    const scrollSpeed = window.innerWidth < 768 ? 1 : 1; 

    // Infinite Loop Logic
    if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
      scrollContainer.scrollLeft = 0; // Reset instantly without user noticing
    } else {
      scrollContainer.scrollLeft += scrollSpeed;
    }

    animationFrameId.current = requestAnimationFrame(animateScroll);
  }, []);

  //  Start/Cleanup Animation
  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(animateScroll);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [animateScroll]);

  // DESKTOP: Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    isPaused.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
    totalDragDistance.current = 0;
    
    // Change cursor style immediately
    scrollRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // *2 for faster drag
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
    totalDragDistance.current += Math.abs(x - startX.current);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
    // isPaused remains true until MouseLeave or manual timeout
  };

  const handleMouseEnter = () => {
    isPaused.current = true;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    isPaused.current = false; // Resume auto-scroll
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  };

  // 📱 MOBILE: Touch Handlers
  const handleTouchStart = () => {
    isPaused.current = true; 
  };

  const handleTouchEnd = () => {
    
    setTimeout(() => {
      isPaused.current = false;
    }, 2000);
  };

  // 🛡️ Prevent Click on Drag
  const handleProductClick = (e: React.MouseEvent) => {
    // If dragged more than 5px, it's a drag, not a click
    if (totalDragDistance.current > 5) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Optional: Explicit navigate if ProductCard doesn't handle it
    // navigate(`/product/${productId}`);
  };

  // ⬅️➡️ Button Handlers
  const handleManualScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      isPaused.current = true;
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      
      // Resume after animation
      setTimeout(() => { isPaused.current = false; }, 1000);
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
          onClick={() => handleManualScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 p-3 rounded-full shadow-lg text-dark flex md:hidden active:scale-95 transition-transform"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

       
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing"
          style={{ 
            // 'auto' during drag for instant response, 'smooth' for buttons
            scrollBehavior: isDragging.current ? 'auto' : 'smooth',
            // 🍎 Enable smooth momentum scrolling on iOS
            WebkitOverflowScrolling: 'touch' 
          }}
          // Desktop Events
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          // Mobile Events
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
           {displayProducts.map((product, index) => (
             <div 
                key={`${product._id}-${index}`} 
                className="w-64 md:w-72 shrink-0 select-none"
                onClickCapture={(e) => handleProductClick(e, )}
             >
               <ProductCard product={product} />
             </div>
           ))}
        </div>

        {/* Right Button */}
        <button 
          onClick={() => handleManualScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 p-3 rounded-full shadow-lg text-dark flex md:hidden active:scale-95 transition-transform"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="mt-8 text-center md:hidden">
         <button onClick={() => navigate('/products')} className="inline-flex items-center gap-2 text-accent font-medium">
            View All Collection <ArrowRight className="w-4 h-4" />
         </button>
      </div>

    </section>
  );
};

export default NewArrivals;