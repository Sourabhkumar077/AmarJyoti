import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useAppDispatch } from '../store/hooks';
import { clearCartLocal } from '../store/slices/cartSlice';
import Loader from '../components/common/Loader';
import { CheckCircle, XCircle } from 'lucide-react';

const PaymentVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const transactionId = searchParams.get('id');

  const verifyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post('/payment/verify', { merchantTransactionId: id });
      return res.data;
    },
    onSuccess: () => {
      dispatch(clearCartLocal());
      setTimeout(() => navigate('/order-success'), 2000);
    },
  });

  useEffect(() => {
    if (transactionId) {
      verifyMutation.mutate(transactionId);
    } else {
      navigate('/');
    }
  }, [transactionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/20">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-md w-full">
        
        {verifyMutation.isPending && (
          <div className="flex flex-col items-center">
            <Loader />
            <p className="mt-4 text-dark font-medium">Verifying Payment...</p>
            <p className="text-sm text-subtle-text">Please do not close this window.</p>
          </div>
        )}

        {verifyMutation.isSuccess && (
          <div className="animate-fade-in-up">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-dark">Payment Successful!</h2>
            <p className="text-gray-500 mt-2">Redirecting to order confirmation...</p>
          </div>
        )}

        {verifyMutation.isError && (
          <div className="animate-fade-in-up">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-dark">Payment Failed</h2>
            <p className="text-gray-500 mt-2 mb-6">We couldn't verify your payment.</p>
            <button 
              onClick={() => navigate('/checkout')}
              className="bg-accent text-white px-6 py-2 rounded-md hover:bg-yellow-600 transition"
            >
              Try Again
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default PaymentVerify;