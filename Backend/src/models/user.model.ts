import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email?: string; // Optional
  phone?: string; // Optional
  password?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  
  // Reset Password & Locking mechanism
  resetPasswordOTP?: string;
  resetPasswordExpires?: Date;
  resetPasswordAttempts: number;
  lockUntil?: Date;
  
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    unique: true, 
    sparse: true, 
    lowercase: true 
  },
  phone: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // Rate Limiting & Reset Logic
  resetPasswordOTP: { type: String },
  resetPasswordExpires: { type: Date },
  resetPasswordAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
}, {
  timestamps: true,
});

// FIXED: Remove 'next' parameter (async handles it) and type 'this' explicitly
UserSchema.pre('save', async function (this: IUser) {
  if (!this.isModified('password')) return;
  
  // Agar password hai to hi hash karein
  if(this.password){
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if(!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);