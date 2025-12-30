import mongoose, { Document, Schema } from "mongoose";

// Interface for a single item in the cart
interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  size?: string;
  color?: string;
}

// Interface for the Cart Document
export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
}

const CartSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        size: { type: String },
        color: { type: String }
      },
    ],
  },

  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model<ICart>("Cart", CartSchema);
