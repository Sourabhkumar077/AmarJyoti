import React from 'react';
import { Truck, ShieldCheck, Gem,  Scissors } from 'lucide-react';

const services = [
  {
    icon: <Truck className="w-8 h-8" />,
    title: "Free Shipping",
    description: "On all orders above ₹1999"
  },
  {
    icon: <Gem className="w-8 h-8" />,
    title: "Premium Quality",
    description: "Certified authentic fabrics"
  },
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: "Secure Payments",
    description: "100% safe transaction"
  },
  {
    icon: <Scissors className="w-8 h-8" />,
    title: "Custom Fitting",
    description: "Tailored to your measurements"
  }
];

const ServicesSection: React.FC = () => {
  return (
    <section className="py-16 bg-white border-y border-gray-100 relative overflow-hidden">
      
      {/* Decorative BG Gradient */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {services.map((item, index) => (
            <div 
              key={index} 
              className="group p-6 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center"
            >
              {/* Icon Circle */}
              <div className="w-16 h-16 mb-4 rounded-full bg-white border border-gray-100 flex items-center justify-center text-accent shadow-sm group-hover:bg-accent group-hover:text-white group-hover:scale-110 transition-all duration-300">
                {item.icon}
              </div>
              
              <h3 className="text-lg font-serif font-bold text-dark mb-2 group-hover:text-accent transition-colors">
                {item.title}
              </h3>
              
              <p className="text-sm text-subtle-text leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default ServicesSection;