import mongoose, { Document, Schema } from 'mongoose';

// 1. Define the TypeScript Interface
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string; // Optional because Google Auth users won't have one
  googleId?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// 2. Define the Mongoose Schema
const UserSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true,
      trim: true
    },
    passwordHash: { 
      type: String, 
      select: false // Security: Never return password by default
    },
    googleId: { 
      type: String, 
      unique: true, 
      sparse: true // Allows multiple null values (for non-Google users)
    },
    role: { 
      type: String, 
      enum: ['user', 'admin'], 
      default: 'user' 
    },
  },
  { 
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

// 3. Export the Model
export default mongoose.model<IUser>('User', UserSchema);