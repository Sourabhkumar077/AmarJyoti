import { Request, Response } from 'express';
import * as paymentService from '../services/payment.service';
import * as cartService from '../services/cart.service';

// Helper to get User ID
const getUserId = (req: Request) => {
  if (!req.user || !req.user._id) throw new Error('User not authenticated');
  return req.user._id.toString();
};

// 1. Create Order
export const createOrderHandler = async (req: Request, res: Response) => {
  try {
    const { shippingAddress } = req.body;
    const userId = getUserId(req);

    // Get Redirect URL
    const result = await paymentService.createOrder(userId, shippingAddress);
    res.status(200).json(result); // { url: "..." }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// 2. Verify Payment
export const verifyPaymentHandler = async (req: Request, res: Response) => {
  try {
    const { merchantTransactionId } = req.body;
    
    // Check Status with PhonePe
    const order = await paymentService.verifyPayment(merchantTransactionId);
    
    res.status(200).json({ 
      message: "Payment Verified", 
      orderId: order._id 
    });
  } catch (error: any) {
    res.status(400).json({ message: "Payment verification failed" });
  }
};