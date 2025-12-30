import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../api/products.api";
import NewArrivals from "../components/common/NewArrivals";
import LocationSection from "../components/common/LocationSection";
import ServicesSection from "../components/common/ServicesSection";
import LegacySection from '../components/home/LegacySection';

const HERO_DEFAULTS = [
  {
    _id: "default_1",
    name: "Royal Red Bridal Lehenga",
    price: 15499,
    images: ["/herolehnga4.jpg"],
    stock: 10,
    isActive: true,
    link: "/products?category=Lehenga",
    // Added Dummy Fields to satisfy Product Interface
    description: "Exclusive Bridal Lehenga",
    category: { _id: "cat_1", name: "Lehenga" as const },
    fabric: "Silk",
    colors: ["Red"],
  },
  {
    _id: "default_2",
    name: "Emerald Banarasi Saree",
    price: 8999,
    images: ["/heroSaree2.jpg"],
    stock: 10,
    isActive: true,
    link: "/products?category=Saree",
    // Dummy Fields
    description: "Authentic Banarasi Saree",
    category: { _id: "cat_2", name: "Saree" as const },
    fabric: "Silk",
    colors: ["Green"],
  },
  {
    _id: "default_3",
    name: "Heavy Embroidered Suit",
    price: 22000,
    images: ["/heroSuit1_.jpg"],
    stock: 10,
    isActive: true,
    link: "/products?category=Suit",

    description: "Designer Party Wear Suit",
    category: { _id: "cat_3", name: "Suit" as const },
    fabric: "Georgette",
    colors: ["Blue"],
  },
  {
    _id: "default_4",
    name: "Magenta Party Wear",
    price: 18500,
    images: ["/heroSaree3.jpg"],
    stock: 10,
    isActive: true,
    link: "/products?category=Lehenga",
    description: "Elegant Party Wear",
    category: { _id: "cat_4", name: "Lehenga" as const },
    fabric: "Net",
    colors: ["Magenta"],
  },
];

const Home: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const { data: products } = useQuery({
    queryKey: ["hero-products"],
    queryFn: () => fetchProducts({ sortBy: "newest" }),
    //  Cast to 'any' to bypass strict type check for the extra 'link' property
    // while keeping the instant loading benefit.
    placeholderData: HERO_DEFAULTS as any,
    staleTime: 1000 * 60 * 5,
  });

  // --- LOGIC: Select Top 4 Products ---
  const activeHeroProducts = useMemo(() => {
    const sourceData =
      products && products.length > 0 ? products : HERO_DEFAULTS;

    // We accept 'any' here because sourceData can be mixed types (Product or Placeholder)
    return (sourceData as any[])
      .filter((p: any) => p.stock > 0 && p.isActive !== false)
      .slice(0, 4);
  }, [products]);

  const leftColProducts = activeHeroProducts.slice(0, 2);
  const rightColProducts = activeHeroProducts.slice(2, 4);

  // Categories Data
  const categories = [
    {
      id: "saree",
      name: "Royal Sarees",
      description: "Banarasi, Silk & Cotton",
      image:
        "/heroSaree2.jpg",
      path: "/products?category=Saree",
    },
    {
      id: "suit",
      name: "Elegant Suits",
      description: "Salwar Kameez & Sets",
      image:
        "/Suit1.webp",
      path: "/products?category=Suit",
    },
    {
      id: "lehenga",
      name: "Bridal Lehengas",
      description: "Wedding & Party Wear",
      image:
        "/OIP (3).jpg",
      path: "/products?category=Lehenga",
    },
  ];

  // Component: Product Card
  const HeroCard = ({ product, height }: { product: any; height: string }) => {
    if (!product) return null;

    const productLink = product.link || `/product/${product._id}`;
    const productImage =
      product.images && product.images.length > 0
        ? product.images[0]
        : "/placeholder.jpg";

    return (
      <Link
        to={productLink}
        className="block group relative overflow-hidden rounded-2xl shadow-xl cursor-pointer bg-gray-100"
      >
        <img
          src={productImage}
          alt={product.name}
          loading="eager"
          // @ts-ignore
          fetchPriority="high"
          className={`${height} w-full object-cover transition-transform duration-700 group-hover:scale-110`}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h4 className="text-white font-serif font-medium truncate text-lg">
              {product.name}
            </h4>
            <div className="flex justify-between items-center mt-1">
              {/* <span className="text-accent font-bold text-base">₹{product.price.toLocaleString('en-IN')}</span> */}
              {/* <span className="bg-white/20 p-2 rounded-full backdrop-blur-md hover:bg-white hover:text-dark transition-colors">
                <ShoppingBag className="w-4 h-4" />
              </span> */}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen"
    >
      {/* --- HERO SECTION --- */}
      <section className="relative h-auto min-h-[90vh] md:h-[85vh] flex items-center justify-center overflow-hidden bg-[#F9F4EF] py-12 md:py-0">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-orange-100/50 rounded-l-[10rem] blur-3xl z-0" />

        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-center md:text-left space-y-6 order-2 md:order-1">
            <motion.span
              variants={itemVariants}
              className="inline-block px-4 py-1 bg-white border border-yellow-200 rounded-full text-yellow-700 text-xs font-bold tracking-widest uppercase"
            >
              New Collection
            </motion.span>
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-serif text-dark leading-tight"
            >
              Elegance Woven in{" "}
              <span className="text-yellow-600 italic">Tradition</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-600 max-w-lg mx-auto md:mx-0 leading-relaxed"
            >
              Discover authentic handloom Sarees, bespoke Suits, and designer
              Lehengas crafted for the modern Indian woman.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >
              <Link
                to="/products"
                className="px-8 py-4 bg-yellow-600 text-white rounded-full font-medium hover:bg-yellow-700 transition-all shadow-lg flex items-center justify-center gap-2 group"
              >
                Shop Now{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/products?sort=newest"
                className="px-8 py-4 bg-white border border-yellow-600/30 text-dark rounded-full font-medium hover:bg-orange-50 transition-all flex items-center justify-center"
              >
                View New Arrivals
              </Link>
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            className="hidden md:grid grid-cols-2 gap-4 order-1 md:order-2"
          >
            <div className="space-y-4 translate-y-8">
              <HeroCard product={leftColProducts[0]} height="h-64" />
              <HeroCard product={leftColProducts[1]} height="h-48" />
            </div>
            <div className="space-y-4">
              <HeroCard product={rightColProducts[0]} height="h-48" />
              <HeroCard product={rightColProducts[1]} height="h-64" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- CATEGORIES SECTION --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-5xl font-serif text-dark tracking-tight">
              Shop by <span className="italic text-yellow-600">Category</span>
            </h2>
            <div className="h-1 w-24 bg-yellow-600/30 mx-auto rounded-full"></div>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">
              Explore our finest collections curated for your unique style.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-150">
            {categories.map((cat, index) => (
              <Link
                key={cat.id || index}
                to={cat.path}
                className={`group relative overflow-hidden rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer h-96 md:h-auto ${
                  index === 0
                    ? "md:col-span-2 md:row-span-2"
                    : "md:col-span-2 md:row-span-1"
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 p-8 w-full flex flex-col items-start justify-end h-full">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase mb-2 block opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                      Collection
                    </span>
                    <h3
                      className={`font-serif text-white mb-2 leading-tight ${
                        index === 0 ? "text-4xl" : "text-3xl"
                      }`}
                    >
                      {cat.name}
                    </h3>
                    <p className="text-white/80 text-sm max-w-[80%] line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {cat.description}
                    </p>
                  </div>
                  <div className="absolute bottom-8 right-8 bg-white text-dark p-3 rounded-full opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-200 shadow-lg">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <NewArrivals />
      <LegacySection/>
      <ServicesSection />
      <LocationSection />
    </motion.div>
  );
};

export default Home;
