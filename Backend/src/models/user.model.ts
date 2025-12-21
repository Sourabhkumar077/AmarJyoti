import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email?: string; 
  phone?: string; 
  password?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  addresses: {
    street: string;
    city: string;
    state: string;    
    country: string;  
    pincode: string;
    isDefault: boolean;
  }[];
  
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
  addresses: [{
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },   
    country: { type: String, default: 'India' }, 
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
  }],
  
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