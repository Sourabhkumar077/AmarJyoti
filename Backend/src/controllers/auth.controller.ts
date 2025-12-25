import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import User from "../models/user.model";
import sendEmail from "../utils/sendEmail";
import crypto from "crypto";
import { Otp } from "../models/otp.model";

// 1. SEND OTP (For Verification Button)
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Please enter email" });

    const [existingUser, _deleted] = await Promise.all([
      User.findOne({ email }).select("_id"), 
      Otp.deleteMany({ email }) 
    ]);

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save DB and Send Email Logic...
    await Otp.create({ email, otp });

    // With Pooling enabled, this will be fast now
    await sendEmail({
        email,
        subject: "Account Verification OTP",
        message: `Your OTP is: ${otp}`
    });

    res.status(200).json({ success: true, message: `OTP sent to ${email}` });

  } catch (error: any) {
    console.error("Send OTP Error:", error); 
    res
      .status(500)
      .json({ message: "Failed to send OTP", error: error.message });
  }
};

// --- 2. REGISTER HANDLER (With OTP Check) ---
export const registerHandler = async (req: Request, res: Response) => {
  try {
    // 1. Validate OTP First
    const { email, otp } = req.body;

    if (!otp) {
      return res
        .status(400)
        .json({ message: "Please provide the OTP sent to your email" });
    }

    // Check OTP in Database
    const validOtp = await Otp.findOne({ email, otp });

    if (!validOtp) {
      return res
        .status(400)
        .json({ message: "Invalid or Expired OTP. Please try again." });
    }

    // 2. Register User (Existing Service Logic)
    // Pass req.body to service (it contains name, password, etc.)
    const { user, token } = await authService.register(req.body);

    // 3. Delete the used OTP (Cleanup)
    await Otp.deleteOne({ _id: validOtp._id });

    // 4. Send Welcome Email (Optional)
    const message = `Hello ${user.name},\n\nWelcome to Amar Jyoti! Your account has been successfully created.\nWe are excited to have you on board.\n\nHappy Shopping!`;
    if (user.email) {
      try {
        await sendEmail({
          email: user.email,
          subject: "Welcome to Amar Jyoti - Registration Successful",
          message: message,
        });
      } catch (err) {
        console.log("Welcome Email sending failed:", err);
      }
    }

    // 5. Send Success Response
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Register Error:", error); // Logger

    // Handle duplicate email error explicitly if not handled by service
    if (error.message === "Email already registered" || error.code === 11000) {
      return res.status(409).json({ message: "Email is already registered" });
    }
    return res
      .status(500)
      .json({ message: error.message || "Registration failed" });
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
        role: user.role,
      },
    });
  } catch (error: any) {
    if (error.message === "Invalid email or password") {
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
      return res
        .status(404)
        .json({ message: "User not found with this email" });
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
      subject: "Password Reset OTP - Amar Jyoti",
      message: message,
    });

    res.status(200).json({ message: `OTP sent to ${user.email}` });
  } catch (error: any) {
    // user.resetPasswordOTP = undefined; await user.save();
    res
      .status(500)
      .json({ message: "Email could not be sent", error: error.message });
  }
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    const result = await authService.resetPassword(
      identifier,
      otp,
      newPassword
    );
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
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Update Basic Info
    if (name) user.name = name;
    if (phone) user.phone = phone; // Phone update logic

    // 2. Add New Address (Structured)
    if (address) {
      // Validate required fields
      if (
        !address.street ||
        !address.city ||
        !address.state ||
        !address.pincode
      ) {
        return res
          .status(400)
          .json({ message: "Street, City, State and Pincode are required" });
      }

      // Agar default set kar rahe ho, to purane default hata do
      if (address.isDefault) {
        user.addresses.forEach((a: any) => (a.isDefault = false));
      }

      user.addresses.push({
        street: address.street,
        city: address.city,
        state: address.state, // New
        country: address.country || "India", // New (Default India)
        pincode: address.pincode,
        isDefault: address.isDefault || false,
      });
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
