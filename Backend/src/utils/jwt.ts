import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'f3a9c7d1e8b2a4f6c9d0e1f7a8b3c4d5e6f7a9b0c1d2e3f4a5b6c7d8e9f0a1b';
const JWT_EXPIRES_IN = '7d';

export const signToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};