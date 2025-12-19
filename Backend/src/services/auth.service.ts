import * as userRepository from '../repositories/user.repository';
import { signToken } from '../utils/jwt';
import * as notificationService from './notification.service'; // Ensure ye file bani ho

// 1. Register User
export const register = async (data: any) => {
  const { name, email, phone, password } = data;

  // Check uniqueness
  if (email) {
    const existingEmail = await userRepository.findUserByEmail(email);
    if (existingEmail) throw new Error('Email is already registered');
  }
  if (phone) {
    const existingPhone = await userRepository.findUserByPhone(phone);
    if (existingPhone) throw new Error('Phone number is already registered');
  }

  // Create user (Password hashing Model ke pre-save hook me hoga)
  const newUser = await userRepository.createUser({
    name,
    email,
    phone,
    password, 
    role: 'user',
  });

  // Generate Token
  const token = signToken(newUser._id.toString(), newUser.role);
  
  // Send SMS (Dummy)
  if (phone) await notificationService.sendWelcomeSMS(phone, name);

  return { user: newUser, token };
};

// 2. Login User
export const login = async (data: any) => {
  const { identifier, password } = data; 

  const user = await userRepository.findUserByIdentifier(identifier);
  
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid credentials');
  }

  const token = signToken(user._id.toString(), user.role);
  return { user, token };
};

// 3. Forgot Password Request (NEW)
export const requestPasswordReset = async (identifier: string) => {
    const user = await userRepository.findUserByIdentifier(identifier);
    if (!user) throw new Error('User not found');

    // Rate Limiting Logic
    if (user.lockUntil && user.lockUntil > new Date()) {
        const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / (1000 * 60));
        throw new Error(`Too many attempts. Try again after ${remainingMinutes} minutes.`);
    }

    if (user.resetPasswordAttempts >= 3) {
        user.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 Hours Lock
        user.resetPasswordAttempts = 0;
        await user.save();
        throw new Error('Maximum attempts reached. Account locked for 2 hours.');
    }

    user.resetPasswordAttempts += 1;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    // Send OTP
    const type = identifier.includes('@') ? 'email' : 'phone';
    await notificationService.sendResetOTP(identifier, otp, type);

    return { message: `OTP sent to your ${type}` };
};

// 4. Reset Password (NEW)
export const resetPassword = async (identifier: string, otp: string, newPassword: string) => {
    const user = await userRepository.findUserByIdentifier(identifier);
    if (!user) throw new Error('User not found');

    if (
        user.resetPasswordOTP !== otp || 
        !user.resetPasswordExpires || 
        user.resetPasswordExpires < new Date()
    ) {
        throw new Error('Invalid or expired OTP');
    }

    user.password = newPassword; // Model will hash this automatically
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordAttempts = 0;
    user.lockUntil = undefined;
    
    await user.save();

    return { message: "Password reset successful" };
};