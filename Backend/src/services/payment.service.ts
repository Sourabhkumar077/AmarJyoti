import { razorpayInstance } from '../config/razorpay';
import Order from '../models/order.model';
import * as cartService from './cart.service';
import crypto from 'crypto';

// 1. Initiate Checkout (Create Pending Order)
export const createOrder = async (userId: string, address: any) => {
  // A. Fetch Cart
  const cart = await cartService.getCart(userId);
  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // B. Calculate Subtotal (Product Prices Only)
  let subtotal = 0;
  
  // 🟢 We access item.product (which is populated)
  const orderItems = cart.items.map((item: any) => {
    // Explicitly grab price from the populated product object
    const price = item.product.price; 
    subtotal += price * item.quantity;
    
    return {
      product: item.product._id, // Save just the ID in the Order
      quantity: item.quantity,
      price: price
    };
  });

  // 🟢 Shipping Logic
  const shippingCharge = subtotal < 1999 ? 100 : 0;
  const totalAmount = subtotal + shippingCharge;

  // C. Create Razorpay Order
  const options = {
    amount: totalAmount * 100, // Amount in paise
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
    key: process.env.RAZORPAY_KEY_ID 
  };
};

// 2. Verify Payment (Signature Check)
export const verifyPayment = async (
  razorpayOrderId: string, 
  razorpayPaymentId: string, 
  signature: string
) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || '';

  const generated_signature = crypto
    .createHmac('sha256', secret)
    .update(razorpayOrderId + "|" + razorpayPaymentId)
    .digest('hex');

  if (generated_signature === signature) {
    const order = await Order.findOne({ 'paymentInfo.razorpayOrderId': razorpayOrderId });
    if (!order) throw new Error("Order not found");

    order.status = 'Placed';
    order.paymentInfo.razorpayPaymentId = razorpayPaymentId;
    await order.save();

    // Clear cart after success
    await cartService.clearCart(order.user.toString()); 

    return order;
  } else {
    throw new Error("Payment verification failed");
  }
};