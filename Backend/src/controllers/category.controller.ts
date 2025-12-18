import { Request, Response } from 'express';
import Category from '../models/category.model';

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({}, 'name _id'); // Only fetch name and ID
    res.status(200).json(categories);
  } catch (error) {
    console.error("Fetch Categories Error:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};