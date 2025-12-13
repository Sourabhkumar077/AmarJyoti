import { Request, Response } from 'express';
import Order from '../models/order.model';
import User from '../models/user.model';
import Product from '../models/product.model';

// 1. Get All Orders (With Filters)
export const getAllOrdersHandler = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const query: any = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('user', 'name email') // Show who bought it
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Update Order Status
export const updateOrderStatusHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true } // Return the updated document
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order status updated", order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Dashboard Stats
export const getDashboardStatsHandler = async (req: Request, res: Response) => {
  try {
    // A. Count basic metrics
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();
    
    // B. Calculate Total Revenue (Only for non-cancelled orders)
    const revenueStats = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total : 0;

    // C. Find Low Stock Products (Less than 5 items left)
    const lowStockProducts = await Product.find({ stock: { $lt: 5 } })
      .select('name stock price')
      .limit(5);

    res.status(200).json({
      totalUsers,
      totalOrders,
      totalRevenue,
      lowStockProducts
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};