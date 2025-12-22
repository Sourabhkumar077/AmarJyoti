import { Request, Response } from 'express';
import Order from '../models/order.model';
import User from '../models/user.model';
import Product from '../models/product.model';

// 1. Get All Orders (With Filters & Full Details)
export const getAllOrdersHandler = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const query: any = {};
    if (status) query.status = status;

    // 👇 POPULATE UPDATE: Items & User details 
    const orders = await Order.find(query)
      .populate('user', 'name email phone') 
      .populate({
        path: 'items.product',
        select: 'name images price' // Product ki photo aur naam frontend ko chahiye
      })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Update Order Status (Same as before)
export const updateOrderStatusHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true } 
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Optional: Email logic here for status update (Skipped for now)

    res.status(200).json({ message: "Order status updated", order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Dashboard Stats (Same as before)
export const getDashboardStatsHandler = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();
    
    const revenueStats = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total : 0;

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