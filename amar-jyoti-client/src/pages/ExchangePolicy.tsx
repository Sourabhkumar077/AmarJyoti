import { ArrowRightLeft, CheckCircle, AlertCircle, HelpCircle, Truck } from 'lucide-react';

const ExchangePolicy = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Exchange Policy</h1>
          <p className="text-gray-500">Need a different size or color? We've got you covered.</p>
        </div>

        {/* Policy Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            
            {/* General Policy */}
            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0 text-blue-600">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">7-Day Exchange Window</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We offer a <strong>7-day exchange policy</strong> for size, fit, or color issues. If the item doesn't fit perfectly, you can request an exchange within 7 days of delivery. The item must be unworn, unused, with tags attached, and in original packaging.
                  </p>
                </div>
              </div>
            </div>

            {/* How it Works (New Section) */}
            <div className="p-8 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-gray-700" /> How the Exchange Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center md:text-left">
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3 mx-auto md:mx-0">1</div>
                  <h4 className="font-semibold text-gray-900 mb-1">Request</h4>
                  <p className="text-sm text-gray-600">Contact us to book an exchange request for the new size/color.</p>
                </div>
                <div className="text-center md:text-left">
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3 mx-auto md:mx-0">2</div>
                  <h4 className="font-semibold text-gray-900 mb-1">Pickup</h4>
                  <p className="text-sm text-gray-600">Our courier partner will pick up the current item from your doorstep.</p>
                </div>
                <div className="text-center md:text-left">
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3 mx-auto md:mx-0">3</div>
                  <h4 className="font-semibold text-gray-900 mb-1">Dispatch</h4>
                  <p className="text-sm text-gray-600">Once picked up, we will dispatch the new replacement item to you.</p>
                </div>
              </div>
            </div>

            {/* Non-Exchangeable Items */}
            <div className="p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" /> Non-Exchangeable Items
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" /> Custom/Personalized orders
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" /> Items marked as "Final Sale"
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" /> Altered or washed products
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" /> Accessories (Jewelry, Scarves)
                </li>
              </ul>
            </div>

            {/* Contact / CTA */}
            <div className="p-8 bg-blue-50">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 text-blue-600 shadow-sm">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Need to Exchange?</h3>
                    <p className="text-gray-600 text-sm">
                      Send us an email with your Order ID and the new size you need.
                    </p>
                  </div>
                </div>
                <a 
                  href="mailto:support@amarjyoti.com" 
                  className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors shadow-md"
                >
                  Request Exchange
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangePolicy;