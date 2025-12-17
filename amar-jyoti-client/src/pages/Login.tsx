import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const redirectTarget = searchParams.get('redirect'); // e.g., 'checkout'

    // React Query Mutation for API Call
    const loginMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post('/auth/login', data);
            return response.data;
        },
        onSuccess: (data) => {
            dispatch(setCredentials({
                user: data.user,
                token: data.token
            }));

            // Smart Redirect Logic
            if (data.user.role === 'admin') {
                navigate('/admin'); // <--- Admins go straight to Dashboard
            } else if (redirectTarget === 'checkout') {
                navigate('/checkout');
            } else {
                navigate('/');
            }
        },
        onError: (error: any) => {
            setErrorMsg(error.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        loginMutation.mutate({ email, password });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary/30 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-light p-8 md:p-10 rounded-xl shadow-(--shadow-soft)">

                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-serif font-bold text-dark">Welcome Back</h2>
                    <p className="mt-2 text-sm text-subtle-text">
                        Sign in to access your orders and wishlist
                    </p>
                </div>

                {/* Error Alert */}
                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-error px-4 py-3 rounded-md flex items-center text-sm">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {errorMsg}
                    </div>
                )}

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-dark mb-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-subtle-text/50" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-subtle-text/20 rounded-md placeholder-subtle-text/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm transition-all"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-dark mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-subtle-text/50" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-subtle-text/20 rounded-md placeholder-subtle-text/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className={`group w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all shadow-lg shadow-accent/20 ${loginMutation.isPending ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                        {!loginMutation.isPending && <ArrowRight className="ml-2 w-4 h-4" />}
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