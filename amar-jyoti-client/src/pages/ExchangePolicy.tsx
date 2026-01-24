import React from 'react';
import { RefreshCcw, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';

const ExchangePolicy: React.FC = () => {
  return (
    <div className="bg-[#FDFBF7] min-h-screen py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-dark mb-4">Exchange & Refund Policy</h1>
          <p className="text-subtle-text">Guidelines for exchanges, returns, and order modifications.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* STRICT CANCELLATION BANNER */}
          <div className="bg-red-50 p-6 border-b border-red-100 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-700 text-lg">No Cancellation Policy</h3>
              <p className="text-red-600/80 text-sm mt-1 leading-relaxed">
                Once an order is successfully placed on our website, it is immediately forwarded to our warehouse for processing. Therefore, <strong>orders cannot be cancelled</strong> under any circumstances. Please review your order carefully before payment.
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            
            {/* Exchange Section */}
            <div className="p-8 md:p-10">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <RefreshCcw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-3">Request for Exchange</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    While we do not offer cancellations, we are happy to offer an <strong>Exchange</strong> if you face issues with sizing or receive a defective product.
                  </p>
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <h4 className="font-semibold text-dark mb-2">Eligibility for Exchange:</h4>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
                      <li>Request must be raised within <strong>3 days</strong> of delivery.</li>
                      <li>Product must be unused, unwashed, and with all tags intact.</li>
                      <li>Valid reasons: Size mismatch, fabric defect, or wrong item delivered.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Refund Section */}
            <div className="p-8 md:p-10">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-3">Refund Policy</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Since we operate on an "Exchange Only" model, monetary refunds are generally not provided. 
                    <br/><br/>
                    <strong>Exceptions for Refund:</strong>
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-600 text-sm">
                    <li>If the replacement product for your exchange request is <strong>Out of Stock</strong>.</li>
                    <li>If a package is lost in transit by our courier partner.</li>
                  </ul>
                  <p className="mt-4 text-sm text-gray-500">
                    *In such cases, refunds are processed within 5-7 business days to the original payment source.
                  </p>
                </div>
              </div>
            </div>

            {/* How to Request */}
            <div className="p-8 md:p-10 bg-accent/5">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 text-accent shadow-sm">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-dark mb-1">How to Request an Exchange?</h3>
                  <p className="text-gray-600 text-sm">
                    Email us at <strong className="text-dark">support@amarjyoti.com</strong> with your Order ID and photos of the product. Our team will approve the request within 24 hours.
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

export default ExchangePolicy;