import React from 'react';
import { Truck, Clock, MapPin, Info } from 'lucide-react';

const ShippingPolicy: React.FC = () => {
  return (
    <div className="bg-[#FDFBF7] min-h-screen py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-dark mb-4">Shipping Policy</h1>
          <p className="text-subtle-text">Transparent shipping rates and delivery timelines.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            
            {/* Rate Section */}
            <div className="p-8 md:p-10">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-3">Shipping Rates</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Shipping costs are calculated based on the delivery zone from our warehouse in Gujarat.
                  </p>
                  
                  {/* Zone Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600 border border-gray-200 rounded-lg">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 border-b">Zone</th>
                          <th className="px-6 py-3 border-b">Region</th>
                          <th className="px-6 py-3 border-b">Shipping Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white border-b">
                          <td className="px-6 py-4 font-medium">Zone A</td>
                          <td className="px-6 py-4">Gujarat (Local)</td>
                          <td className="px-6 py-4 font-bold text-dark">₹60</td>
                        </tr>
                        <tr className="bg-white border-b">
                          <td className="px-6 py-4 font-medium">Zone B</td>
                          <td className="px-6 py-4">Metro Cities (Mumbai, Delhi, Blr, etc.)</td>
                          <td className="px-6 py-4 font-bold text-dark">₹100</td>
                        </tr>
                        <tr className="bg-white border-b">
                          <td className="px-6 py-4 font-medium">Zone C</td>
                          <td className="px-6 py-4">Rest of India</td>
                          <td className="px-6 py-4 font-bold text-dark">₹150</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="px-6 py-4 font-medium">Zone D</td>
                          <td className="px-6 py-4">J&K, North East & Remote Areas</td>
                          <td className="px-6 py-4 font-bold text-dark">₹250</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 italic">
                    * Free shipping on all orders above ₹4999.
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="p-8 md:p-10">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-3">Estimated Delivery Timelines</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <li className="flex items-center gap-3 bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="block font-bold text-dark text-sm">Zone A (Gujarat)</span>
                        <span className="text-xs text-gray-500">2 - 3 Business Days</span>
                      </div>
                    </li>
                    <li className="flex items-center gap-3 bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="block font-bold text-dark text-sm">Metros & Cities</span>
                        <span className="text-xs text-gray-500">4 - 6 Business Days</span>
                      </div>
                    </li>
                    <li className="flex items-center gap-3 bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="block font-bold text-dark text-sm">Rest of India</span>
                        <span className="text-xs text-gray-500">7 - 9 Business Days</span>
                      </div>
                    </li>
                    <li className="flex items-center gap-3 bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="block font-bold text-dark text-sm">Remote / NE / J&K</span>
                        <span className="text-xs text-gray-500">10+ Business Days</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Processing Section */}
            <div className="p-8 md:p-10">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-3">Important Information</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
                    <li>Orders are processed within 24-48 hours.</li>
                    <li>We do not ship on Sundays or National Holidays.</li>
                    <li>Shipping charges are non-refundable in case of returns (unless product is defective).</li>
                  </ul>
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