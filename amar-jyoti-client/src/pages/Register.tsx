import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Mail, Lock, User, AlertCircle, Phone } from 'lucide-react'; // Phone icon added
import apiClient from '../api/client';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); // New State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      dispatch(setCredentials({
        user: data.user,
        token: data.token
      }));
      
      if (redirectTarget === 'checkout') {
        navigate('/checkout');
      } else {
        navigate('/');
      }
    },
    onError: (error: any) => {
      setErrorMsg(error.response?.data?.message || 'Registration failed.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }
    // Phone Validation (Simple check)
    if (phone.length < 10) {
      setErrorMsg("Please enter a valid phone number");
      return;
    }
    const payload = {
      name,
      phone,
      password,
      ...(email.trim() !== '' && { email: email.trim() }) // Sirf tab add karo jab email me kuch likha ho
    };

    // Payload to send 
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

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-error px-4 py-3 rounded-md flex items-center text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {errorMsg}
          </div>
        )}

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
                  className="input-field appearance-none relative block w-full pl-10 pr-3 py-3 border border-subtle-text/20 rounded-md placeholder-subtle-text/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Phone Field (Required) */}
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Phone Number *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-subtle-text/50" />
                </div>
                <input
                  type="tel"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-subtle-text/20 rounded-md placeholder-subtle-text/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Email Field (Optional) */}
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Email Address (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-subtle-text/50" />
                </div>
                <input
                  type="email"
                  // required <-- Removed required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-subtle-text/20 rounded-md placeholder-subtle-text/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-subtle-text/20 rounded-md placeholder-subtle-text/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm"
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
            disabled={registerMutation.isPending}
            className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-yellow-600 shadow-lg shadow-accent/20 transition-all ${registerMutation.isPending ? 'opacity-70 cursor-wait' : ''}`}
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