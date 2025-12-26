import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, Smartphone, ArrowLeft, Loader2 } from 'lucide-react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
    const [identifier, setIdentifier] = useState('');
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: async (data: { identifier: string }) => {
            const response = await apiClient.post('/auth/forgot-password', data);
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "OTP sent to your email! 📧");
            // Pass identifier to next page so user doesn't have to type it again
            navigate('/reset-password', { state: { identifier } });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to send OTP");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier) {
            toast.error("Please enter email or phone");
            return;
        }
        mutation.mutate({ identifier });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary/30 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-light p-8 md:p-10 rounded-xl shadow-(--shadow-soft)">
                
                <div className="text-center">
                    <h2 className="mt-2 text-2xl font-serif font-bold text-dark">Forgot Password?</h2>
                    <p className="mt-2 text-sm text-subtle-text">
                        Enter your registered email and we'll send you an OTP.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="identifier" className="block text-sm font-medium text-dark mb-1">Email or Phone</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Smartphone className="h-5 w-5 text-subtle-text/50" />
                            </div>
                            <input
                                id="identifier"
                                type="text"
                                autoFocus // ⚡ Auto Focus on Load
                                required
                                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-subtle-text/20 rounded-md placeholder-subtle-text/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm transition-all"
                                placeholder="Enter email address"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className={`group w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-yellow-600 focus:outline-none transition-all shadow-lg shadow-accent/20 ${mutation.isPending ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {mutation.isPending ? 'Sending OTP...' : 'Send OTP'}
                        {mutation.isPending ? <Loader2 className="ml-2 w-4 h-4 animate-spin" /> : <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link to="/login" className="flex items-center justify-center text-sm font-medium text-subtle-text hover:text-dark transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;  