import mongoose, { Document, Schema } from "mongoose";

// Interface for a single item in the cart
interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  size?: string;
  color?: string;
  priceAtAdd?: number;
}

// Interface for the Cart Document
export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  guestId?: string; 
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Partial index defined manually below to handle null values correctly
    },
    guestId: {
      type: String,
      // Partial index defined manually below to handle null values correctly
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
        },
        size: { type: String },
        color: { type: String },
        priceAtAdd: { type: Number }
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// --- Index Definitions ---

// Compound index for efficient item lookups within a specific cart
CartSchema.index({ _id: 1, "items.product": 1 });

// Partial Unique Index: User
// Enforces uniqueness only for carts associated with a registered user (ignoring nulls)
CartSchema.index(
  { user: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { user: { $exists: true, $type: "objectId" } } 
  }
);

// Partial Unique Index: Guest ID
// Enforces uniqueness only for guest carts (ignoring nulls)
CartSchema.index(
  { guestId: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { guestId: { $exists: true, $type: "string" } } 
  }
);

// TTL Index: Automatic Cleanup
// Automatically deletes abandoned guest carts (where user is null) after 14 days of inactivity
CartSchema.index(
  { updatedAt: 1 }, 
  { expireAfterSeconds: 60 * 60 * 24 * 14, partialFilterExpression: { user: null } }
);

export default mongoose.model<ICart>("Cart", CartSchema);