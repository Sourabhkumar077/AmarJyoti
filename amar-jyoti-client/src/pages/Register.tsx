import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Mail, Lock, User, Phone, CheckCircle, Loader2 } from 'lucide-react'; // ✅ Icons updated
import apiClient from '../api/client';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ---STATE FOR OTP ---
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  // --- 1. REGISTER MUTATION ---
  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      // Backend expects { email, otp, name... } 
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      dispatch(setCredentials({
        user: data.user,
        token: data.token
      }));
      toast.success("Account created successfully! 🎉");
      
      if (redirectTarget === 'checkout') {
        navigate('/checkout');
      } else {
        navigate('/');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  });

  // --- 2. SEND OTP HANDLER ---
  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }
    // Basic email validation
    if (!email.includes('@')) {
      toast.error("Invalid email address");
      return;
    }

    setOtpLoading(true);
    try {
      await apiClient.post('/auth/send-otp', { email });
      setIsOtpSent(true);
      toast.success("OTP sent to your email!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // --- 3. SUBMIT FORM ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!isOtpSent) {
      toast.error("Please verify your email first");
      return;
    }
    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP sent to your email");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (phone.length < 10) {
       toast.error("Please enter a valid phone number");
      return;
    }

    // Payload (Includes OTP)
    const payload = {
      name,
      phone,
      password,
      email,
      otp 
    };

    registerMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/30 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-light p-8 md:p-10 rounded-xl shadow-(--shadow-soft)">
        
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-serif font-bold text-dark">Join Amar Jyoti</h2>
          <p className="mt-2 text-sm text-subtle-text">
            Create an account to enjoy exclusive benefits
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Full Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-subtle-text/50" />
                </div>
                <input
                  type="text"
                  required
                  className="input-field appearance-none relative block w-full pl-10 pr-3 py-3 border border-subtle-text/20 rounded-md focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email Field with Verify Button */}
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Email Address *</label>
              <div className="flex gap-2">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-subtle-text/50" />
                  </div>
                  <input
                    type="email"
                    required
                    disabled={isOtpSent} // Lock email after OTP sent
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border border-subtle-text/20 rounded-md focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm ${isOtpSent ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {/* Green Check if Sent */}
                  {isOtpSent && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                       <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>

                {/* Verify Button */}
                {!isOtpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || !email}
                    className="bg-dark text-white px-4 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                  >
                    {otpLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Verify"}
                  </button>
                )}
              </div>
            </div>

            {/* OTP Input (Only shows after Verify clicked) */}
            {isOtpSent && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-medium text-dark mb-1">One Time Password (OTP) *</label>
                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        className="block w-full px-3 py-3 border-2 border-green-100 bg-green-50/50 rounded-md text-center tracking-[0.5em] font-bold text-gray-700 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        required
                    />
                    <p className="text-xs text-green-600 mt-1 text-center">
                        Verification code sent to {email}
                    </p>
                </div>
            )}

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Phone Number *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-subtle-text/50" />
                </div>
                <input
                  type="tel"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-subtle-text/20 rounded-md focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Password *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-subtle-text/50" />
                </div>
                <input
                  type="password"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-subtle-text/20 rounded-md focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-subtle-text">Must be at least 6 characters</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending || !isOtpSent}
            className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-yellow-600 shadow-lg shadow-accent/20 transition-all ${registerMutation.isPending || !isOtpSent ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-subtle-text">
            Already have an account?{' '}
            <Link to={`/login${redirectTarget ? `?redirect=${redirectTarget}` : ''}`} className="font-medium text-accent hover:text-dark transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;