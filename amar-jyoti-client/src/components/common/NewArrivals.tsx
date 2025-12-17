import React from 'react';
import { Link } from 'react-router-dom';

// Dummy data or fetch via API with sort=createdAt
const arrivals = [
  { id: 1, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80", name: "Banarasi Red" },
  { id: 2, img: "https://images.unsplash.com/photo-1583391733958-e0295c29272e?w=400&q=80", name: "Royal Blue Silk" },
  { id: 3, img: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=80", name: "Golden Zari" },
  { id: 4, img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80", name: "Pink Lehenga" },
  { id: 5, img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&q=80", name: "Cotton Suit" },
];

const NewArrivals: React.FC = () => {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mb-10 flex justify-between items-end">
        <div>
           <span className="text-accent text-sm font-bold tracking-widest uppercase">Just In</span>
           <h2 className="text-3xl font-serif text-dark mt-2">New Arrivals</h2>
        </div>
        <Link to="/products?sort=newest" className="hidden md:block text-subtle-text hover:text-accent transition-colors">View All &rarr;</Link>
      </div>

      {/* Infinite Scroll Container */}
      <div className="relative w-full">
        <div className="flex gap-6 animate-scroll whitespace-nowrap px-4 hover:pause">
           {/* Duplicate array for seamless loop */}
           {[...arrivals, ...arrivals].map((item, index) => (
             <Link to="/products" key={`${item.id}-${index}`} className="min-w-62.5 md:min-w-75 group">
                <div className="aspect-3/4 overflow-hidden rounded-lg mb-4 bg-gray-100">
                  <img 
                    src={item.img} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-serif text-lg text-dark">{item.name}</h3>
                <span className="text-sm text-subtle-text">Shop Now</span>
             </Link>
           ))}
        </div>
      </div>
      
      <style>{`
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .hover\\:pause:hover {
          animation-play-state: paused;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};

export default NewArrivals;