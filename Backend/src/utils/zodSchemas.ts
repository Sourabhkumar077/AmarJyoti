import { z } from 'zod';

// Schema for User Registration
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

// Schema for User Login
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

// Schema for Google Auth (for later use)
export const googleAuthSchema = z.object({
  body: z.object({
    credential: z.string(),
  }),
});

// Schema for Creating/Updating a Product
export const productSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Product name is too short"),
    description: z.string().min(10, "Description must be detailed"),
    category: z.string().length(24, "Invalid Category ID"), // MongoDB ObjectId length
    price: z.number().positive("Price must be positive"),
    stock: z.number().int().nonnegative("Stock cannot be negative"),
    fabric: z.string().min(2),
    colors: z.array(z.string()).min(1, "At least one color is required"),
    images: z.array(z.string().url()).min(1, "At least one image URL is required"),
  }),
});

// Schema for Adding to Cart
export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().length(24, "Invalid Product ID"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
  }),
});

// Schema for Updating Cart Item
export const updateCartSchema = z.object({
  body: z.object({
    quantity: z.number().int().nonnegative("Quantity cannot be negative"),
  }),
});

// order schema validation
export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
      street: z.string().min(5, "Street address is too short"),
      city: z.string().min(2, "City is required"),
      pincode: z.string().length(6, "Invalid Pincode"), // Assuming Indian 6-digit pincode
    }),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    signature: z.string(),
  }),
});

// Admin dashboard side validation schema
export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'Pending',
      'Placed',
      'Packed',
      'Shipped',
      'Delivered',
      'Cancelled'
    ], {
      error: "Invalid Order Status"   
    }),
  }),
});