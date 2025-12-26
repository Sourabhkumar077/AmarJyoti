import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Lock, Key, Eye, EyeOff, Loader2 } from 'lucide-react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

// Shake Animation (Same as Login)
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

const ResetPassword: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [identifier] = useState(location.state?.identifier || '');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    // UX States
    const [showPassword, setShowPassword] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    
    // Ref for Auto Focus
    const otpInputRef = useRef<HTMLInputElement>(null);

    // 1. Redirect if no identifier found
    useEffect(() => {
        if (!identifier) {
            toast.error("Invalid session. Please try again.");
            navigate('/forgot-password');
        } else {
            // ⚡ Auto Focus OTP input on load
            setTimeout(() => otpInputRef.current?.focus(), 100);
        }
    }, [identifier, navigate]);

    // 2. Reset Shake Effect
    useEffect(() => {
        if (isShaking) {
            const timer = setTimeout(() => setIsShaking(false), 400);
            return () => clearTimeout(timer);
        }
    }, [isShaking]);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post('/auth/reset-password', data);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Password reset successfully! 🔒");
            toast("Redirecting to login...", { icon: '⏳' });
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        },
        onError: (error: any) => {
            setIsShaking(true);
            toast.error(error.response?.data?.message || 'Failed to reset password.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (otp.length !== 6) {
            toast.error("OTP must be 6 digits");
            setIsShaking(true);
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            setIsShaking(true);
            return;
        }
        
        mutation.mutate({ identifier, otp, newPassword });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary/30 py-12 px-4">
            <style>{shakeKeyframes}</style>
            
            <div className={`max-w-md w-full space-y-8 bg-light p-8 md:p-10 rounded-xl shadow-lg transition-transform ${isShaking ? 'animate-shake border-red-400 border' : ''}`}>
                
                <div className="text-center">
                    <h2 className="mt-2 text-2xl font-serif font-bold text-dark">Reset Password</h2>
                    <p className="mt-2 text-sm text-subtle-text">
                        Enter the OTP sent to <span className="font-semibold text-dark">{identifier}</span>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    
                    {/* OTP Input (Optimized) */}
                    <div>
                        <label className="block text-sm font-medium text-dark mb-1">OTP</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Key className="h-5 w-5 text-subtle-text/50" />
                            </div>
                            <input
                                ref={otpInputRef} // ⚡ Auto Focus Ref
                                type="text"
                                inputMode="numeric" // 📱 Numeric Keyboard on Mobile
                                pattern="[0-9]*"
                                required
                                maxLength={6}
                                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-subtle-text/20 rounded-md placeholder-subtle-text/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm tracking-[0.5em] font-bold text-center"
                                placeholder="______"
                                value={otp}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, ''); // Numbers only
                                    setOtp(val);
                                }}
                            />
                        </div>
                    </div>

                    {/* New Password Input (With Eye Icon) */}
                    <div>
                        <label className="block text-sm font-medium text-dark mb-1">New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-subtle-text/50" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-subtle-text/20 rounded-md placeholder-subtle-text/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            {/* Toggle Eye Icon */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-subtle-text/50 hover:text-accent transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-subtle-text">Must be at least 6 characters</p>
                    </div>

                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-yellow-600 transition-all shadow-md ${mutation.isPending ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {mutation.isPending ? 'Resetting...' : 'Set New Password'}
                        {mutation.isPending && <Loader2 className="ml-2 w-4 h-4 animate-spin" />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;