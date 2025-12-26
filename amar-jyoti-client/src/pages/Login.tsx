import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Lock, ArrowRight, Smartphone, Eye, EyeOff, Loader2 } from 'lucide-react'; // Added Eye icons
import apiClient from '../api/client';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { mergeGuestCart, fetchCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

// Custom Shake Animation Style
const shakeKeyframes = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  .animate-shake {
    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
  }
`;

const Login: React.FC = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    
    // --- 1. NEW UX STATES ---
    const [showPassword, setShowPassword] = useState(false);
    const [isShaking, setIsShaking] = useState(false);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const redirectTarget = searchParams.get('redirect');

    // Reset shake animation after it plays
    useEffect(() => {
        if (isShaking) {
            const timer = setTimeout(() => setIsShaking(false), 400);
            return () => clearTimeout(timer);
        }
    }, [isShaking]);

    const loginMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post('/auth/login', data);
            return response.data;
        },
        onSuccess: async (data) => {
            dispatch(setCredentials({
                user: data.user,
                token: data.token
            }));
            toast.success(`Welcome back, ${data.user.name}! 👋`);

            const localCart = localStorage.getItem('guest_cart');
            if (localCart) {
                // @ts-ignore
                await dispatch(mergeGuestCart());
            }
            // @ts-ignore
            dispatch(fetchCart());

            if (data.user.role === 'admin') {
                navigate('/admin');
            } else if (redirectTarget === 'checkout') {
                navigate('/checkout');
            } else {
                navigate('/');
            }
        },
        onError: (error: any) => {
            // --- 2. TRIGGER SHAKE ON ERROR ---
            setIsShaking(true); 
            setPassword(''); // Optional: Clear password on failure
            toast.error(error.response?.data?.message || "Invalid credentials");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier || !password) {
            toast.error("Please fill in all fields");
            setIsShaking(true);
            return;
        }
        loginMutation.mutate({ identifier, password });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary/30 py-12 px-4 sm:px-6 lg:px-8">
            <style>{shakeKeyframes}</style> {/* Inject Animation */}
            
            <div className={`max-w-md w-full space-y-8 bg-light p-8 md:p-10 rounded-xl shadow-(--shadow-soft) transition-transform ${isShaking ? 'animate-shake border-red-400 border' : ''}`}>

                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-serif font-bold text-dark">Welcome Back</h2>
                    <p className="mt-2 text-sm text-subtle-text">
                        Sign in with your Email or Phone
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">

                        {/* Identifier Input */}
                        <div>
                            <label htmlFor="identifier" className="block text-sm font-medium text-dark mb-1">Email or Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Smartphone className="h-5 w-5 text-subtle-text/50" />
                                </div>
                                <input
                                    id="identifier"
                                    name="identifier"
                                    type="text"
                                    autoFocus // --- 3. AUTO FOCUS ---
                                    required
                                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-subtle-text/20 rounded-md placeholder-subtle-text/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm transition-all"
                                    placeholder="Enter email or phone"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Input (Optimized) */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label htmlFor="password" className="block text-sm font-medium text-dark">Password</label>
                                <Link to="/forgot-password" className="text-xs text-accent hover:text-yellow-600 font-medium">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-subtle-text/50" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    // --- 4. TOGGLE TYPE ---
                                    type={showPassword ? "text" : "password"} 
                                    required
                                    className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-subtle-text/20 rounded-md placeholder-subtle-text/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                
                                {/* --- 5. EYE ICON BUTTON --- */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-subtle-text/50 hover:text-accent transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className={`group w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all shadow-lg shadow-accent/20 ${loginMutation.isPending ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                        {loginMutation.isPending ? <Loader2 className="ml-2 w-4 h-4 animate-spin" /> : <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                {/* Footer Links */}
                <div className="text-center mt-6">
                    <p className="text-sm text-subtle-text">
                        Don't have an account?{' '}
                        <Link to={`/register${redirectTarget ? `?redirect=${redirectTarget}` : ''}`} className="font-medium text-accent hover:text-dark transition-colors">
                            Create one now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;