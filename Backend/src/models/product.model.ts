import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  category: mongoose.Types.ObjectId; // Reference to Category
  price: number;
  stock: number;
  fabric: string;
  colors: string[];
  images: string[]; // Array of ImageKit URLs 
  isActive: boolean;
  sizes: string[]; // Available sizes ['S', 'M', 'L']
  sizeDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Category', 
      required: true 
    },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    fabric: { type: String, required: true },
    sizes: [{ type: String }], 
    sizeDescription: { type: String, default: '' },
    colors: [{ type: String }], // Array of color names/codes
    images: [{ type: String, required: true }], // URLs from ImageKit
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// CRITICAL INDEX: Optimizes "Filter by Category + Sort by Price" 
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ fabric: 1 });
ProductSchema.index({ colors: 1 });
ProductSchema.index({ createdAt: -1 });

export default mongoose.model<IProduct>('Product', ProductSchema);