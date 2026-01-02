import axios from 'axios';
import crypto from 'crypto';
import Order from '../models/order.model';
import Product from '../models/product.model';
import * as cartService from './cart.service';
import sendEmail from '../utils/sendEmail';

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT";
const SALT_KEY = process.env.PHONEPE_SALT_KEY || "";
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || 1;
const PHONEPE_HOST_URL = process.env.PHONEPE_HOST_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const API_URL = process.env.API_URL || "http://localhost:8080/api/v1"; 

export const createOrder = async (userId: string, address: any) => {
  const cart = await cartService.getCart(userId);
  if (!cart || cart.items.length === 0) throw new Error('Cart is empty');

  let subtotal = 0;
  const orderItems = cart.items.map((item: any) => {
    const price = item.product.price; 
    subtotal += price * item.quantity;
    return { product: item.product._id, quantity: item.quantity, price };
  });

  const shipping = subtotal < 1999 ? 100 : 0;
  const totalAmount = subtotal + shipping;

  const merchantTransactionId = "MT" + Date.now() + Math.floor(Math.random() * 1000);

  const data = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: userId,
    amount: totalAmount * 100,
    redirectUrl: `${CLIENT_URL}/payment/verify?id=${merchantTransactionId}`,
    redirectMode: "REDIRECT",
    callbackUrl: `${API_URL}/payment/webhook`,
    paymentInstrument: {
      type: "PAY_PAGE"
    }
  };

  const payload = Buffer.from(JSON.stringify(data)).toString('base64');
  const stringToSign = payload + "/pg/v1/pay" + SALT_KEY;
  const sha256 = crypto.createHash('sha256').update(stringToSign).digest('hex');
  const checksum = sha256 + "###" + SALT_INDEX;

  try {
    const response = await axios.post(
      `${PHONEPE_HOST_URL}/pg/v1/pay`,
      { request: payload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum
        }
      }
    );

    if (response.data.success) {
      await Order.create({
        user: userId,
        items: orderItems,
        totalAmount,
        shippingAddress: address,
        status: 'Pending',
        paymentInfo: {
          transactionId: merchantTransactionId
        }
      });

      return { 
        url: response.data.data.instrumentResponse.redirectInfo.url 
      };
    } else {
      throw new Error("PhonePe Init Failed");
    }
  } catch (error: any) {
    console.error("PHONEPE ERROR:", JSON.stringify(error.response?.data || error.message, null, 2));
    throw new Error(error.response?.data?.message || "Payment initiation failed");
  }
};

export const verifyPayment = async (merchantTransactionId: string) => {
  const stringToSign = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY;
  const sha256 = crypto.createHash('sha256').update(stringToSign).digest('hex');
  const checksum = sha256 + "###" + SALT_INDEX;

  try {
    const response = await axios.get(
      `${PHONEPE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': MERCHANT_ID
        }
      }
    );

    if (response.data.success && response.data.code === 'PAYMENT_SUCCESS') {
      const order = await Order.findOne({ 'paymentInfo.transactionId': merchantTransactionId }).populate('user');
      if (!order) throw new Error("Order not found");

      if (order.status !== 'Placed') {
        order.status = 'Placed';
        order.paymentInfo.paymentId = response.data.data.paymentInstrument?.pgTransactionId;
        await order.save();

        for (const item of order.items) {
          await Product.findOneAndUpdate(
            { _id: item.product, stock: { $gte: item.quantity } }, 
            { $inc: { stock: -item.quantity } }
          );
        }

        await cartService.clearCart((order.user as any)._id.toString());

        const userEmail = (order.user as any)?.email;
        if (userEmail) {
           await sendEmail({
             email: userEmail,
             subject: "Order Placed Successfully",
             message: `Order #${order._id} confirmed. Amount: ₹${order.totalAmount}`
           });
        }
      }
      return order;
    } else {
      throw new Error("Payment failed or pending");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Verification failed");
  }
};