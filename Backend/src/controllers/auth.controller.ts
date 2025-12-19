import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const registerHandler = async (req: Request, res: Response) => {
  try {
    // Data is already validated by middleware
    const { user, token } = await authService.register(req.body);

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
        const result = await authService.requestPasswordReset(identifier);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
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