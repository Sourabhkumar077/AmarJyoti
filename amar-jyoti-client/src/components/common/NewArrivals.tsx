import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../../api/products.api';
import ProductCard from '../product/ProductCard';
import Loader from './Loader';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewArrivals: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const isPaused = useRef(false); 
  const isDragging = useRef(false);

  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const totalDragDistance = useRef(0);

  const { data, isLoading } = useQuery({
    queryKey: ['newArrivals'],
    queryFn: () => fetchProducts({ sortBy: 'newest', limit: 8 }),
    staleTime: 1000 * 60 * 5,
  });

  const products = data?.products || [];

  const displayProducts = useMemo(() => {
    return products.length > 0 ? [...products, ...products] : [];
  }, [products]);

  const animateScroll = useCallback(() => {
    const scrollContainer = scrollRef.current;
    
    if (!scrollContainer || isPaused.current || isDragging.current) {
      animationFrameId.current = requestAnimationFrame(animateScroll);
      return; 
    }

    const scrollSpeed = 1; 

    if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
      scrollContainer.scrollLeft = 0;
    } else {
      scrollContainer.scrollLeft += scrollSpeed;
    }

    animationFrameId.current = requestAnimationFrame(animateScroll);
  }, []);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(animateScroll);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [animateScroll]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    isPaused.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
    totalDragDistance.current = 0;
    scrollRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
    totalDragDistance.current += Math.abs(x - startX.current);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  };

  const handleMouseEnter = () => {
    isPaused.current = true;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    isPaused.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  };

  const handleTouchStart = () => {
    isPaused.current = true; 
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      isPaused.current = false;
    }, 2000);
  };

  const handleProductClick = (e: React.MouseEvent) => {
    if (totalDragDistance.current > 5) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  };

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      isPaused.current = true;
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(() => { isPaused.current = false; }, 1000);
    }
  };

  if (isLoading) return <Loader />;

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-white relative group">
      <div className="container mx-auto px-4 mb-8 flex justify-between items-end">
        <div>
           <h2 className="text-3xl md:text-4xl font-serif font-bold text-dark mb-2">New Arrivals</h2>
           <p className="text-subtle-text">Discover our latest ethnic collections.</p>
        </div>
        <button 
           onClick={() => navigate('/products?sortBy=newest')} 
           className="hidden md:flex items-center gap-2 text-accent font-medium hover:text-yellow-600 transition"
        >
           View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="relative container mx-auto px-4">
        
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
            scrollBehavior: isDragging.current ? 'auto' : 'smooth',
            WebkitOverflowScrolling: 'touch' 
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
           {displayProducts.map((product, index) => (
             <div 
               key={`${product._id}-${index}`} 
               className="w-64 md:w-72 shrink-0 select-none"
               onClickCapture={handleProductClick}
             >
               <ProductCard product={product} />
             </div>
           ))}
        </div>

        <button 
          onClick={() => handleManualScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 p-3 rounded-full shadow-lg text-dark flex md:hidden active:scale-95 transition-transform"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="mt-8 text-center md:hidden">
         <button onClick={() => navigate('/products?sortBy=newest')} className="inline-flex items-center gap-2 text-accent font-medium">
            View All Collection <ArrowRight className="w-4 h-4" />
         </button>
      </div>

    </section>
  );
};

export default NewArrivals;