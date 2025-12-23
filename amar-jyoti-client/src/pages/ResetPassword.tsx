import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Lock, Key, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';

const ResetPassword: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Pichle page se identifier (email/phone) grab kar rahe hain
    const [identifier, setIdentifier] = useState(location.state?.identifier || '');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        // Agar identifier nahi hai (direct link khola), to wapas bhej do
        if (!identifier) {
            navigate('/forgot-password');
        }
    }, [identifier, navigate]);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post('/auth/reset-password', data);
            return response.data;
        },
        onSuccess: () => {
            setSuccessMsg("Password reset successfully! Redirecting to login...");
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        },
        onError: (error: any) => {
            setErrorMsg(error.response?.data?.message || 'Failed to reset password.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setErrorMsg("Password must be at least 6 characters");
            return;
        }
        mutation.mutate({ identifier, otp, newPassword });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary/30 py-12 px-4">
            <div className="max-w-md w-full space-y-8 bg-light p-8 md:p-10 rounded-xl shadow-lg">
                
                <div className="text-center">
                    <h2 className="mt-2 text-2xl font-serif font-bold text-dark">Reset Password</h2>
                    <p className="mt-2 text-sm text-subtle-text">
                        Enter the OTP sent to <strong>{identifier}</strong>
                    </p>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-error px-4 py-3 rounded-md flex items-center text-sm">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {errorMsg}
                    </div>
                )}
                
                {successMsg && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {successMsg}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    
                    {/* OTP Input */}
                    <div>
                        <label className="block text-sm font-medium text-dark mb-1">OTP</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Key className="h-5 w-5 text-subtle-text/50" />
                            </div>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-subtle-text/20 rounded-md placeholder-subtle-text/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm tracking-widest"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* New Password Input */}
                    <div>
                        <label className="block text-sm font-medium text-dark mb-1">New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-subtle-text/50" />
                            </div>
                            <input
                                type="password"
                                required
                                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-subtle-text/20 rounded-md placeholder-subtle-text/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={mutation.isPending || !!successMsg}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-yellow-600 transition-all shadow-md ${mutation.isPending ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {mutation.isPending ? 'Resetting...' : 'Set New Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;