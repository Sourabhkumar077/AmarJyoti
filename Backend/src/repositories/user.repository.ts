import User, { IUser } from '../models/user.model';

export const createUser = async (userData: Partial<IUser>): Promise<IUser> => {
  const user = await User.create(userData);
  return user;
};

// Updated: Find by Email OR Phone
export const findUserByIdentifier = async (identifier: string): Promise<IUser | null> => {
  const isEmail = identifier.includes('@');
  const query = isEmail ? { email: identifier } : { phone: identifier };  
  return await User.findOne(query).select('+password');
};

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  return await User.findOne({ email }).select('+password');
};

export const findUserByPhone = async (phone: string): Promise<IUser | null> => {
  return await User.findOne({ phone }).select('+password');
};

export const findUserById = async (id: string): Promise<IUser | null> => {
  return await User.findById(id);
};