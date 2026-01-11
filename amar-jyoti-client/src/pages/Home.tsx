import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../api/products.api";
import NewArrivals from "../components/common/NewArrivals";
import LocationSection from "../components/common/LocationSection";
import ServicesSection from "../components/common/ServicesSection";
import LegacySection from '../components/home/LegacySection';

const HERO_DEFAULTS = [
  { _id: "def1", name: "Royal Bridal Lehenga", images: ["/herolehnga4.jpg"], category: { name: "Lehenga" } },
  { _id: "def2", name: "Banarasi Silk Saree", images: ["/heroSaree2.jpg"], category: { name: "Saree" } },
  { _id: "def3", name: "Designer Party Suit", images: ["/heroSuit1_.jpg"], category: { name: "Suit" } },
];

const CATEGORIES = [
  { id: "saree", name: "Royal Sarees", sub: "Banarasi & Silk", image: "/sareeCategory (2).png", path: "/products?category=Saree" },
  { id: "suit", name: "Elegant Suits", sub: "Salwar Kameez", image: "/suitCategory.png", path: "/products?category=Suit" },
  { id: "lehenga", name: "Bridal Lehengas", sub: "Wedding Edition", image: "/OIP (3).jpg", path: "/products?category=Lehenga" },
];

const MARQUEE_TEXT = "HANDCRAFTED LUXURY • AUTHENTIC WEAVES • PAN-INDIA SHIPPING • CUSTOM TAILORING • ";

const Marquee = () => (
  <div className="bg-accent text-white py-3 overflow-hidden border-y border-white/10 relative z-20">
    <motion.div className="flex whitespace-nowrap" animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, duration: 30, ease: "linear" }}>
      {[...Array(4)].map((_, i) => (
        <span key={i} className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase mx-4 flex items-center gap-4">
          {MARQUEE_TEXT} <Sparkles className="w-3 h-3 inline-block" />
        </span>
      ))}
    </motion.div>
  </div>
);

const Home: React.FC = () => {
  const { data } = useQuery({
    queryKey: ["hero-products"],
    queryFn: () => fetchProducts({ sortBy: "newest", limit: 3 }),
    staleTime: 1000 * 60 * 5,
  });

  const heroProducts = useMemo(() => {
    let items = data?.products?.length ? data.products.filter((p: any) => p.isActive !== false) : HERO_DEFAULTS;
    while (items.length < 3 && items.length > 0) items = [...items, ...items];
    return items.slice(0, 3);
  }, [data]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] overflow-x-hidden">
      
      <section className="relative pt-32 pb-16 md:pt-24 md:pb-8 h-auto min-h-[50vh] md:h-[90vh] flex items-center overflow-hidden">
        <div className="absolute top-0 left-0 w-[60vw] h-[60vw] bg-orange-100/60 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="container mx-auto px-6 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center h-full">
                
                <div className="lg:col-span-5 flex flex-col justify-center items-center lg:items-start text-center lg:text-left space-y-6 z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-dark/10 bg-white/50 backdrop-blur text-xs font-bold uppercase tracking-widest text-accent mb-6">
                           <Star className="w-3 h-3 fill-current" /> Festive Collection
                        </span>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-dark leading-[1.1] tracking-tight">
                            Weaving <br />
                            <span className="italic text-accent font-light">Heritage</span>
                        </h1>
                        <p className="text-subtle-text text-base md:text-lg mt-6 max-w-md mx-auto lg:mx-0 leading-relaxed font-light">
                            Experience the finest handloom Sarees and bespoke bridal wear. 
                            Authentic craftsmanship, directly from weavers to your wardrobe.
                        </p>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                        className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4"
                    >
                        <Link to="/products" className="group px-8 py-3.5 bg-dark text-white rounded-full flex items-center gap-2 transition-all hover:bg-accent hover:shadow-xl text-sm font-medium tracking-wide">
                            Shop Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/products?category=Lehenga" className="px-8 py-3.5 border border-dark/20 rounded-full text-dark hover:bg-white hover:border-transparent hover:shadow-md transition-all text-sm font-medium tracking-wide">
                            Bridal Edit
                        </Link>
                    </motion.div>
                </div>

                <div className="hidden lg:block lg:col-span-7 h-137.5 w-full relative z-0">
                    <div className="w-full h-full flex gap-3 overflow-hidden rounded-l-[2.5rem] shadow-2xl shadow-orange-100 bg-white p-2">
                        {heroProducts.map((product: any, idx: number) => (
                            <motion.div 
                                key={product._id}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative flex-1 h-full rounded-xl overflow-hidden cursor-pointer group transition-[flex] duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:flex-[2.5] border border-gray-100"
                            >
                                <Link to={`/product/${product._id}`} className="block w-full h-full relative">
                                    <img 
                                        src={product.images?.[0] || '/placeholder.jpg'} 
                                        alt={product.name} 
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 filter brightness-[0.95] group-hover:brightness-100"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-30 group-hover:opacity-70 transition-opacity duration-500" />
                                    <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                        <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border-l-4 border-accent">
                                            <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">Authentic Weave</p>
                                            <div className="flex justify-between items-center gap-2">
                                                <h3 className="text-lg font-serif text-dark leading-none truncate">{product.name}</h3>
                                                <ArrowRight className="w-4 h-4 text-dark" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </section>

      <Marquee />

      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 px-2">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-dark mb-2">Curated Collections</h2>
              <p className="text-subtle-text font-light text-sm md:text-base">Essentials for every special occasion.</p>
            </div>
            <Link to="/products" className="text-accent text-sm font-medium border-b border-accent/50 pb-0.5 hover:text-dark hover:border-dark transition-all">
                View All Categories
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-100">
            {CATEGORIES.map((cat) => (
              <Link key={cat.id} to={cat.path} className="group relative rounded-2xl overflow-hidden h-75 md:h-full shadow-sm hover:shadow-xl transition-all duration-500">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                
                <div className="absolute bottom-0 left-0 w-full p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-1 opacity-0 group-hover:opacity-100 transition-opacity">Explore</p>
                    <h3 className="text-2xl font-serif text-white mb-1">{cat.name}</h3>
                    <p className="text-white/70 text-sm font-light">{cat.sub}</p>
                </div>
                
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/10 rounded-full p-2.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500">
                    <ArrowRight className="text-white w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
       <LegacySection />
      <NewArrivals />
      <div className="py-12 bg-[#F9F4EF]"><ServicesSection /></div>
      <LocationSection />
    </div>
  );
};

export default Home;