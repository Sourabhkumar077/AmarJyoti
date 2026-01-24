import React from 'react';
import { Lock, Eye, Database, Cookie } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-dark mb-4">Privacy Policy</h1>
          <p className="text-subtle-text">How we collect, use, and protect your data.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            
            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">Information We Collect</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We collect information you provide directly to us, such as your name, billing address, shipping address, email address, and phone number when you make a purchase or register for an account.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">How We Use Your Information</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We use the information we collect to process your orders, communicate with you about your account, and send you updates about our products and services. We do not sell your personal data to third parties.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">Data Security</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent">
                  <Cookie className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark mb-2">Cookies</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our website uses cookies to distinguish you from other users. This helps us provide you with a good experience when you browse our website and allows us to improve our site.
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

export default PrivacyPolicy;