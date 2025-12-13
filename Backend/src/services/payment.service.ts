import { razorpayInstance } from '../config/razorpay';
import Order from '../models/order.model';
import * as cartService from './cart.service';
import crypto from 'crypto';

// 1. Initiate Checkout (Create Pending Order)
export const createOrder = async (userId: string, address: any) => {
  // A. Fetch Cart (Trusted Source)
  const cart = await cartService.getCart(userId);
  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // B. Calculate Total (Server-side calculation)
  let totalAmount = 0;
  const orderItems = cart.items.map((item: any) => {
    const price = item.product.price;
    totalAmount += price * item.quantity;
    return {
      product: item.product._id,
      quantity: item.quantity,
      price: price
    };
  });

  // C. Create Razorpay Order
  const options = {
    amount: totalAmount * 100, // Amount in paise (e.g., 500.00 -> 50000)
    currency: "INR",
    receipt: `receipt_${Date.now()}`
  };

  const razorpayOrder = await razorpayInstance.orders.create(options);

  if (!razorpayOrder) {
    throw new Error("Razorpay order creation failed");
  }

  // D. Save Pending Order to Database
  const newOrder = await Order.create({
    user: userId,
    items: orderItems,
    totalAmount,
    shippingAddress: address,
    status: 'Pending',
    paymentInfo: {
      razorpayOrderId: razorpayOrder.id
    }
  });

  return {
    orderId: newOrder._id,
    razorpayOrderId: razorpayOrder.id,
    amount: totalAmount,
    currency: "INR",
    key: process.env.RAZORPAY_KEY_ID // Send Public Key to Frontend
  };
};

// 2. Verify Payment (Signature Check)
export const verifyPayment = async (
  razorpayOrderId: string, 
  razorpayPaymentId: string, 
  signature: string
) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || '';

  // HMAC SHA256 Signature Verification
  const generated_signature = crypto
    .createHmac('sha256', secret)
    .update(razorpayOrderId + "|" + razorpayPaymentId)
    .digest('hex');

  if (generated_signature === signature) {
    // A. Find Order
    const order = await Order.findOne({ 'paymentInfo.razorpayOrderId': razorpayOrderId });
    if (!order) throw new Error("Order not found");

    // B. Update Status
    order.status = 'Placed';
    order.paymentInfo.razorpayPaymentId = razorpayPaymentId;
    await order.save();

    // C. Clear User Cart (Since order is successful)
    // Note: We need a method in cartService for this.
    // await cartService.clearCart(order.user.toString()); 

    return order;
  } else {
    throw new Error("Payment verification failed");
  }
};