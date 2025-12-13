import bcrypt from 'bcryptjs';
import * as userRepository from '../repositories/user.repository';
import { signToken } from '../utils/jwt';
import { IUser } from '../models/user.model';

// Service: Register a new user
export const register = async (data: any) => {
  const { name, email, password } = data;

  // 1. Check if user already exists
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // 2. Hash the password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 3. Create user in DB via Repository
  const newUser = await userRepository.createUser({
    name,
    email,
    passwordHash,
    role: 'user', // Default role
  });

  // 4. Generate Token
  const token = signToken(newUser._id.toString(), newUser.role);

  return { user: newUser, token };
};

// Service: Login existing user
export const login = async (data: any) => {
  const { email, password } = data;

  // 1. Find user (and select password)
  const user = await userRepository.findUserByEmail(email);
  if (!user || !user.passwordHash) {
    throw new Error('Invalid email or password');
  }

  // 2. Compare passwords
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // 3. Generate Token
  const token = signToken(user._id.toString(), user.role);

  return { user, token };
};