
import { Truck, Clock, Globe, MapPin } from 'lucide-react';

const ShippingPolicy = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-dark mb-4">Shipping Policy</h1>
          <p className="text-subtle-text">Everything you need to know about our delivery process.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Policy Sections */}
          <div className="divide-y divide-gray-100">
            
            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">Order Processing Time</h3>
                  <p className="text-gray-600 leading-relaxed">
                    All orders are processed within <strong>1-2 business days</strong>. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">Shipping Rates & Delivery Estimates</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Shipping charges for your order will be calculated and displayed at checkout.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li><strong>Standard Shipping:</strong> Free for orders above ₹1999.</li>
                    <li><strong>Expedited Shipping:</strong> Flat rate of ₹150 (Delivery in 2-3 days).</li>
                    <li><strong>Estimated Delivery:</strong> 5-7 business days for standard shipping across India.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">Shipment Confirmation & Order Tracking</h3>
                  <p className="text-gray-600 leading-relaxed">
                    You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">International Shipping</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We currently do not ship outside India. However, we are working on it and will update our policy soon.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;