import React from 'react';
import { MapPin, Phone, Clock, Navigation, ArrowRight } from 'lucide-react';

const LocationSection: React.FC = () => {
  return (
    <section className="relative py-20 bg-gray-50 overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        <div className="flex flex-col lg:flex-row shadow-2xl rounded-3xl overflow-hidden bg-white">
          
          {/* LEFT: Stylish Contact Info */}
          <div className="lg:w-2/5 p-10 md:p-14 bg-white relative">
            {/* Gold Border Line */}
            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-accent to-yellow-200"></div>
            
            <div className="space-y-8">
              <div>
                <h4 className="text-accent font-bold tracking-widest uppercase text-sm mb-2">Visit Our Store</h4>
                <h2 className="text-4xl font-serif font-bold text-dark leading-tight">
                  Experience <br/> <span className="text-transparent bg-clip-text bg-linear-to-r from-accent to-yellow-600">Royal Elegance</span>
                </h2>
                <p className="text-gray-500 mt-4 leading-relaxed">
                  Step into our world of tradition. Feel the fabric, try the fits, and let our stylists help you find your perfect ethnic attire.
                </p>
              </div>

              <div className="space-y-6">
                
                {/* Address Item */}
                <div className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="w-12 h-12 bg-accent text-white rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-accent/30 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-dark text-lg mb-1">Our Location</h5>
                    <p className="text-subtle-text text-sm">Itwara Bazar, Jagdish Pura, Narmadapuram, Madhya Pradesh 461001</p>
                  </div>
                </div>

                {/* Contact Item */}
                <div className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="w-12 h-12 bg-white border-2 border-accent text-accent rounded-lg flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-dark text-lg mb-1">Get in Touch</h5>
                    <p className="text-subtle-text text-sm">+91 70007 99383</p>
                    <p className="text-subtle-text text-sm">amarjyoti@gmail.com</p>
                  </div>
                </div>

                {/* Timings Item */}
                <div className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="w-12 h-12 bg-dark text-white rounded-lg flex items-center justify-center shrink-0 group-hover:bg-gray-800 transition-colors">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-dark text-lg mb-1">Working Hours</h5>
                    <p className="text-subtle-text text-sm">Everyday: 10:00 AM - 10:00 PM</p>
                    {/* <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-wide">ThursdayClosed</p> */}
                  </div>
                </div>

              </div>

              <a 
                href="https://maps.app.goo.gl/ecyXwUtzZpcNb8LZ9" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full gap-2 bg-dark text-white py-4 rounded-xl hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 font-medium"
              >
                <Navigation className="w-5 h-5" /> Navigate to Store <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>

          {/* RIGHT: Full Height Map */}
          <div className="lg:w-3/5 h-125 lg:h-auto relative bg-gray-200">
            {/* Map Overlay Gradient (Optional aesthetics) */}
            <div className="absolute inset-0 bg-linear-to-r from-white/20 to-transparent pointer-events-none z-10 lg:block hidden"></div>
            
            <iframe 
              title="Amar Jyoti Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.7218407962364!2d77.7137275750959!3d22.758567779359623!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397dcfb388a08f2f%3A0x7db8558ef09a6fb2!2sAmar%20Jyoti%20-%20Fancy%20Cloth%20Store!5e1!3m2!1sen!2sin!4v1766473893218!5m2!1sen!2sin" 
              className="absolute inset-0 w-full h-full border-0 grayscale-20 hover:grayscale-0 transition-all duration-700"
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            
            {/* Floating Badge on Map */}
            {/* <div className="absolute bottom-6 right-6 z-20 bg-white p-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
               <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
               <span className="text-xs font-bold text-dark">Open Now</span>
            </div> */}
          </div>

        </div>
      </div>
    </section>
  );
};

export default LocationSection;