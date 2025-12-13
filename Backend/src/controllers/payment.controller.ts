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

    // Call service to calculate total and get Razorpay ID
    const orderData = await paymentService.createOrder(userId, shippingAddress);

    res.status(200).json(orderData);
  } catch (error: any) {
    if (error.message === 'Cart is empty') {
      return res.status(400).json({ message: "Cannot place order with empty cart" });
    }
    res.status(500).json({ message: error.message });
  }
};

// 2. Verify Payment
export const verifyPaymentHandler = async (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, signature } = req.body;
    const userId = getUserId(req);

    // Verify Signature
    const order = await paymentService.verifyPayment(razorpayOrderId, razorpayPaymentId, signature);
    
    // If successful, clear the cart
    await cartService.clearCart(userId);

    res.status(200).json({ 
      message: "Payment verified and Order Placed", 
      orderId: order._id 
    });
  } catch (error: any) {
    res.status(400).json({ message: "Payment verification failed" });
  }
};