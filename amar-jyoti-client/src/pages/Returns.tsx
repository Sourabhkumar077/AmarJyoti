
import { RefreshCcw, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

const Returns = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-dark mb-4">Returns & Exchange</h1>
          <p className="text-subtle-text">Hassle-free returns within 7 days of delivery.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            
            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <RefreshCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">Return Policy</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We have a <strong>7-day return policy</strong>, which means you have 7 days after receiving your item to request a return. To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50/50">
              <h3 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" /> Non-Returnable Items
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span> Custom made products</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span> Products bought on sale</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span> Used or washed items</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span> Items without original tags</li>
              </ul>
            </div>

            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">Damages and Issues</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">How to Initiate a Return?</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    To start a return, you can contact us at <a href="mailto:support@amarjyoti.com" className="text-accent hover:underline">amarjyoti@gmail.com</a>. If your return is accepted, we’ll send you a return shipping label, as well as instructions on how and where to send your package.
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

export default Returns;