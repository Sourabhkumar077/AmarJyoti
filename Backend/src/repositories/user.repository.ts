import User, { IUser } from '../models/user.model';

export const createUser = async (userData: Partial<IUser>): Promise<IUser> => {
  const user = await User.create(userData);
  return user;
};

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  // We explicitly select the password because we need it for login verification
  // By default, our model excludes it for security.
  return await User.findOne({ email }).select('+passwordHash');
};

export const findUserById = async (id: string): Promise<IUser | null> => {
  return await User.findById(id);
};