import React, { useState } from 'react';
import { Mail, Phone, Send, Loader2 } from 'lucide-react';
import LocationSection from '../components/common/LocationSection'; // Reusing your awesome map section!
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate API call
    setTimeout(() => {
      setSending(false);
      setFormData({ name: '', email: '', message: '' });
      toast.success("Message sent! We'll get back to you shortly.");
    }, 1500);
  };

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <div className="bg-dark text-white py-20 text-center">
        <h1 className="text-4xl font-serif font-bold mb-4">Contact Us</h1>
        <p className="text-gray-400 max-w-xl mx-auto px-4">
          Have a question about an order, or just want to say hello? We'd love to hear from you.
        </p>
      </div>

      <div className="container mx-auto px-4 -mt-10 mb-20 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto flex flex-col md:flex-row">
          
          {/* Left: Info */}
          <div className="bg-accent p-10 text-white md:w-2/5 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-serif font-bold mb-6">Get in Touch</h3>
              <p className="mb-8 text-white/90">
                Fill out the form and our team will get back to you within 24 hours.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5" />
                  <span>+91 70007 99383</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" />
                  <span>amarjyoti@gmail.com</span>
                </div>
              </div>
            </div>
            
            <div className="mt-10">
              <div className="w-16 h-1 bg-white/30 rounded mb-4"></div>
              <p className="text-sm text-white/80">
                "Customer service shouldn't just be a department, it should be the entire company."
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="p-10 md:w-3/5">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:border-accent outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:border-accent outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:border-accent outline-none transition-colors"
                  placeholder="How can we help you?"
                />
              </div>
              <button 
                type="submit" 
                disabled={sending}
                className="w-full bg-dark text-white py-3 rounded-lg hover:bg-black transition flex items-center justify-center gap-2 font-medium shadow-lg"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send Message</>}
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Map Section Included */}
      <LocationSection />
    </div>
  );
};

export default Contact;