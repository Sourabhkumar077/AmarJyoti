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