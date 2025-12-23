import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight} from "lucide-react";
import NewArrivals from "../components/common/NewArrivals";
import LocationSection from "../components/common/LocationSection";
import ServicesSection from '../components/common/ServicesSection';

const Home: React.FC = () => {
  // Animation variants for staggered reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const categories = [
    {
      id: "saree",
      name: "Royal Sarees",
      description: "Banarasi, Silk & Cotton",
      image:
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800", // Placeholder
      path: "/products?category=Saree",
      color: "bg-red-50",
    },
    {
      id: "suit",
      name: "Elegant Suits",
      description: "Salwar Kameez & Sets",
      image:
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800", // Placeholder
      path: "/products?category=Suit",
      color: "bg-orange-50",
    },
    {
      id: "lehenga",
      name: "Bridal Lehengas",
      description: "Wedding & Party Wear",
      image:
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800", // Placeholder
      path: "/products?category=Lehenga",
      color: "bg-rose-50",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-[#F9F4EF]">
        {/* Background Decorative Blob */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-secondary/20 rounded-l-[10rem] blur-3xl z-0" />

        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Text Content */}
          <div className="text-center md:text-left space-y-6">
            <motion.span
              variants={itemVariants}
              className="inline-block px-4 py-1 bg-white border border-accent/20 rounded-full text-accent text-xs font-bold tracking-widest uppercase"
            >
              New Collection 2025
            </motion.span>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-serif text-dark leading-tight"
            >
              Elegance Woven in{" "}
              <span className="text-accent italic">Tradition</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-subtle-text max-w-lg mx-auto md:mx-0 leading-relaxed"
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
                className="px-8 py-4 bg-accent text-white rounded-full font-medium hover:bg-yellow-600 transition-all shadow-lg shadow-accent/25 flex items-center justify-center gap-2 group"
              >
                Shop Now{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/products?sort=newest"
                className="px-8 py-4 bg-white border border-accent/30 text-dark rounded-full font-medium hover:bg-secondary/20 transition-all flex items-center justify-center"
              >
                View New Arrivals
              </Link>
            </motion.div>
          </div>

          {/* Hero Image Collage */}
          <motion.div
            variants={itemVariants}
            className="hidden md:grid grid-cols-2 gap-4"
          >
            <div className="space-y-4 translate-y-8">
              <img
                src="/OIP (1).jpg"
                alt="Ethnic Wear 1"
                className="rounded-2xl shadow-xl object-contain h-64 w-full "
              />
              <img
                src="/OIP (2).jpg"
                alt="Ethnic Wear 2"
                className="rounded-2xl shadow-xl  object-contain  h-48 w-full"
              />
            </div>
            <div className="space-y-4">
              <img
                src="/OIP.jpg"
                alt="Ethnic Wear 3"
                className="rounded-2xl shadow-xl  object-contain  h-48 w-full"
              />
              <img
                src="/OIP (3).jpg"
                alt="Ethnic Wear 4"
                className="rounded-2xl shadow-xl  object-contain  h-64 w-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-4xl font-serif text-dark">Shop by Category</h2>
            <p className="text-subtle-text">
              Curated collections for every occasion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={cat.path}
                className="group relative h-125 overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute bottom-0 left-0 p-8 w-full text-center">
                  <h3 className="text-2xl font-serif text-white mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-white/80 text-sm mb-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    {cat.description}
                  </p>
                  <span className="inline-block px-6 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-sm font-medium hover:bg-white hover:text-dark transition-colors">
                    Explore
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <NewArrivals />
      <ServicesSection />
      <LocationSection />
    </motion.div>
  );
};

export default Home;
