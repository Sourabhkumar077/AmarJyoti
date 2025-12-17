import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';

const LocationSection: React.FC = () => {
  return (
    <section className="py-0 relative">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Info Box */}
        <div className="bg-secondary/20 p-12 lg:p-20 flex flex-col justify-center">
           <h2 className="text-4xl font-serif text-dark mb-8">Visit Our Shop</h2>
           <p className="text-subtle-text mb-8 max-w-md">
             Experience the elegance of our fabrics in person. Our master weavers are available for custom consultations.
           </p>
           
           <div className="space-y-6">
             <div className="flex items-start">
               <MapPin className="w-6 h-6 text-accent mr-4 mt-1" />
               <div>
                 <h4 className="font-medium text-dark">Address</h4>
                 <p className="text-subtle-text">123, Itwara Bazaar,<br/>Narmadapuram, Madhya Pradesh 462001</p>
               </div>
             </div>
             
             <div className="flex items-start">
               <Phone className="w-6 h-6 text-accent mr-4 mt-1" />
               <div>
                 <h4 className="font-medium text-dark">Phone</h4>
                 <p className="text-subtle-text">+91 98765 43210</p>
               </div>
             </div>

             <div className="flex items-start">
               <Clock className="w-6 h-6 text-accent mr-4 mt-1" />
               <div>
                 <h4 className="font-medium text-dark">Opening Hours</h4>
                 <p className="text-subtle-text">Mon - Sun: 10:00 AM - 10:00 PM<br/>Thursday: Closed</p>
               </div>
             </div>
           </div>
        </div>

        {/* Map Embed */}
        <div className="h-100 lg:h-auto w-full bg-gray-200">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117285.55627236162!2d77.33230896025215!3d23.254687985446055!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c428f8fd68fbd%3A0x2155716d572d4f8!2sBhopal%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1718200000000!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: 'grayscale(0.4) opacity(0.9)' }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Shop Location"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;