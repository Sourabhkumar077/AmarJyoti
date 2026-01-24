import React from 'react';
import { FileText, ShieldCheck, AlertCircle, Gavel } from 'lucide-react';

const TermsCondition: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-dark mb-4">Terms & Conditions</h1>
          <p className="text-subtle-text">Please read these terms carefully before using our services.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            
            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">1. Introduction</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Welcome to Amar Jyoti. By accessing our website and placing an order, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, please do not use our website.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">2. Use of Account</h3>
                  <p className="text-gray-600 leading-relaxed">
                    You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. We reserve the right to refuse service, terminate accounts, or cancel orders at our sole discretion.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">3. Product Accuracy</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We try to be as accurate as possible. However, due to the handcrafted nature of our products (Sarees, Lehengas), slight variations in color, texture, or weave may occur. These are not defects but the signature of authentic handloom work.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <Gavel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">4. Governing Law</h3>
                  <p className="text-gray-600 leading-relaxed">
                    These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising in relation to these terms shall be subject to the exclusive jurisdiction of the courts in India.
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

export default TermsCondition;