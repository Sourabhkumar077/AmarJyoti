import React from 'react';
import { motion } from 'framer-motion';
import { Award, Gem, History, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const LegacySection: React.FC = () => {
  return (
    <section className="py-24 bg-[#FFFBF2] relative overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT: Creative Image Grid */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Main Large Image */}
            <div className="relative z-10 rounded-tl-[4rem] rounded-br-[4rem] overflow-hidden shadow-2xl border-4 border-white h-112 md:h-136">
              <img 
                src="https://images.unsplash.com/photo-1583391733958-e029f69f7cc2?q=80&w=1974&auto=format&fit=crop" 
                alt="Amar Jyoti Store" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Overlapping Small Image (Badge Style) */}
            <div className="absolute -bottom-8 -right-4 md:right-8 bg-white p-4 rounded-xl shadow-xl z-20 max-w-50 hidden md:block animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
               <div className="border border-yellow-600/30 p-4 rounded-lg text-center bg-[#FFFBF2]">
                  <span className="block text-3xl font-bold text-accent font-serif">58+</span>
                  <span className="text-xs uppercase tracking-widest text-dark font-medium">Years of Trust</span>
               </div>
            </div>

            {/* Abstract Shape */}
            <div className="absolute -top-4 -left-4 w-full h-full border-2 border-accent/20 rounded-tl-[4rem] rounded-br-[4rem] -z-10 translate-x-4 translate-y-4" />
          </motion.div>

          {/* RIGHT: Content */}
          <motion.div 
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="space-y-8"
          >
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-wider">
              <History className="w-3 h-3" /> Est. 1965
            </div>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-serif text-dark leading-tight">
              Honoring Tradition, <br />
              <span className="text-accent italic">Embracing Elegance.</span>
            </h2>

            {/* Main Text Content (From Tushar) */}
            <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
              <p>
                <strong className="text-dark">Amar Jyoti</strong>, founded in 1965, is a trusted ethnic wear store offering an extensive collection of sarees, salwar suits, lehenga chunnis, and more.
              </p>
              <p>
                Known for customer trust and quality, we bring together a large variety of stylish, beautifully designed outfits that combine tradition with modern fashion. Serving generations with elegance and reliability.
              </p>
            </div>

            {/* Icons / Features */}
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white shadow-sm rounded-lg text-accent">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-dark text-sm">Premium Quality</h4>
                  <p className="text-xs text-gray-500 mt-1">Authentic handloom fabrics</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white shadow-sm rounded-lg text-accent">
                  <Gem className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-dark text-sm">Exclusive Designs</h4>
                  <p className="text-xs text-gray-500 mt-1">Curated for modern fashion</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Link 
              to="/products"
              className="inline-flex items-center gap-2 text-dark font-bold border-b-2 border-accent hover:text-accent transition-colors pb-1 group"
            >
              Explore Our Collection 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LegacySection;