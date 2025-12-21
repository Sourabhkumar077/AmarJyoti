import { razorpayInstance } from '../config/razorpay';
import Order from '../models/order.model';
import Product from '../models/product.model'; // Stock update ke liye
import * as cartService from './cart.service';
import sendEmail from '../utils/sendEmail'; // Email ke liye
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

  // Shipping Logic
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

// 2. Verify Payment (Updated: Stock Update + Email)
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
    // 1. find order and populate the user
    const order = await Order.findOne({ 'paymentInfo.razorpayOrderId': razorpayOrderId }).populate('user');
    if (!order) throw new Error("Order not found");

    // 2. Status Update
    order.status = 'Placed';
    order.paymentInfo.razorpayPaymentId = razorpayPaymentId;
    await order.save();

    // 3. Stock Update (Inventory Management)
  
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity } 
      });
    }

    // 4. Send Confirmation Email
    
    const userEmail = (order.user as any)?.email;
    const userName = (order.user as any)?.name || "Customer";
    
    if (userEmail) {
      const message = `Namaste ${userName},\n\nYour order #${order._id} has been successfully placed!\nTotal Amount: ₹${order.totalAmount}\n\nWe will notify you once it ships.\n\nThanks,\nAmar Jyoti Team`;
      
      try {
        await sendEmail({
          email: userEmail,
          subject: "Order Confirmation - Amar Jyoti",
          message: message
        });
      } catch (err) {
        console.error("Email sending failed but order placed:", err);
      }
    }

    // 5. Cart Clear karo
    await cartService.clearCart((order.user as any)._id.toString()); 

    return order;
  } else {
    throw new Error("Payment verification failed");
  }
};