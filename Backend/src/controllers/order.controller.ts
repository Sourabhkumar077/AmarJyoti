import { Request, Response } from 'express';
import Order from '../models/order.model';

// Get My Orders
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    // Auth middleware (protect) req.user s
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: "Not authorized" });
    }

    
    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name images price') 
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};