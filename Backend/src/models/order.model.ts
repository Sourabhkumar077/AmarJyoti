import mongoose, { Document, Schema } from "mongoose";

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  status: "Pending" | "Placed" | "Packed" | "Shipped" | "Delivered" | "Cancelled";
  paymentInfo: {
    transactionId: string; 
    paymentId?: string;    // Changed from razorpayPaymentId (Provider Ref ID)
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: 'India' },
      pincode: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["Pending", "Placed", "Packed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    paymentInfo: {
      transactionId: { type: String, required: true },
      paymentId: { type: String },
    },
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1, status: 1 });
export default mongoose.model<IOrder>("Order", OrderSchema);