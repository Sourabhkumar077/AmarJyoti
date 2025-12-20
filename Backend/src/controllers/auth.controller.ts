import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import User from '../models/user.model';
import sendEmail from '../utils/sendEmail';
import crypto from 'crypto';

export const registerHandler = async (req: Request, res: Response) => {
  try {
    // Data is already validated by middleware
    const { user, token } = await authService.register(req.body);

    const message = `Hello ${user.name},\n\nWelcome to Amar Jyoti! Your account has been successfully created.\nWe are excited to have you on board.\n\nHappy Shopping!`;
    if (user.email) {
      try {
          await sendEmail({
              email: user.email, // TypeScript now knows this is a string
              subject: 'Welcome to Amar Jyoti - Registration Successful',
              message: message
          });
      } catch (err) {
          console.log("Email sending failed:", err);
      }
    }
    // Send response
    res.status(201).json({
      message: "User registered successfully",
      token, // JWT Token for the frontend to save
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    // Handle specific business errors (like duplicate email)
    if (error.message === 'Email already registered') {
        return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { user, token } = await authService.login(req.body);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    if (error.message === 'Invalid email or password') {
        return res.status(401).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { identifier } = req.body; 
        const user = await User.findOne({ email: identifier });

       if (!user || !user.email) {
            return res.status(404).json({ message: "User not found with this email" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to DB (Valid for 10 mins)
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 Minutes
        await user.save();

        // 📧 Send OTP Email
        const message = `You requested a password reset.\n\nYour OTP is: ${otp}\n\nThis OTP is valid for 10 minutes only.\nIf you did not request this, please ignore this email.`;

        await sendEmail({
            email: user.email,
            subject: 'Password Reset OTP - Amar Jyoti',
            message: message
        });

        res.status(200).json({ message: `OTP sent to ${user.email}` });

    } catch (error: any) {
        // user.resetPasswordOTP = undefined; await user.save();
        res.status(500).json({ message: "Email could not be sent", error: error.message });
    }
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
    try {
        const { identifier, otp, newPassword } = req.body;
        const result = await authService.resetPassword(identifier, otp, newPassword);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateProfileHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { name, phone, address } = req.body; 

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. Update Basic Info
    if (name) user.name = name;
    if (phone) user.phone = phone; // Phone update logic

    // 2. Add New Address (Structured)
    if (address) {
       // Validate required fields
       if(!address.street || !address.city || !address.state || !address.pincode) {
           return res.status(400).json({ message: "Street, City, State and Pincode are required" });
       }

       // Agar default set kar rahe ho, to purane default hata do
       if (address.isDefault) {
         user.addresses.forEach((a: any) => a.isDefault = false);
       }

       user.addresses.push({
         street: address.street,
         city: address.city,
         state: address.state,       // New
         country: address.country || 'India', // New (Default India)
         pincode: address.pincode,
         isDefault: address.isDefault || false
       });
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses
      }
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};