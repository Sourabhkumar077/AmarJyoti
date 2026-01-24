import React from 'react';
import { RefreshCcw, XCircle, CreditCard, Clock } from 'lucide-react';

const RefundPolicy: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-dark mb-4">Refund & Cancellation</h1>
          <p className="text-subtle-text">Transparent policies for your peace of mind.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            
            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">Cancellation Policy</h3>
                  <p className="text-gray-600 leading-relaxed">
                    You can cancel your order within <strong>24 hours</strong> of placing it, provided it has not already been shipped. To cancel, please contact our support team immediately. Once shipped, an order cannot be cancelled but can be returned.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <RefreshCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">Refund Eligibility</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Refunds are applicable only if:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>The product received is damaged or defective.</li>
                    <li>The wrong product was delivered.</li>
                    <li>The product is returned in its original condition with tags intact.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">Processing Timeline</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Once we receive your return, we will inspect the item. If approved, the refund will be initiated within <strong>5-7 business days</strong>. The amount will be credited back to your original method of payment.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">Payment Failures</h3>
                  <p className="text-gray-600 leading-relaxed">
                    If your payment was debited but the order was not confirmed, the amount will be automatically refunded to your account within 5-7 business days by your bank.
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

export default RefundPolicy;