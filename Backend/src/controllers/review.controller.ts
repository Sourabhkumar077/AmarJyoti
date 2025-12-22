import { Request, Response } from 'express';
import mongoose from 'mongoose'; // 👈 Import Mongoose
import Review from '../models/review.model';
import Product from '../models/product.model';

// Helper: Calculate Average Rating
const updateProductRating = async (productId: string) => {
  const stats = await Review.aggregate([
    { 
      $match: { 
        product: new mongoose.Types.ObjectId(productId) // ✅ FIXED: Correct way to match ID
      } 
    },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratings: stats[0].avgRating,
      numOfReviews: stats[0].numReviews
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratings: 0,
      numOfReviews: 0
    });
  }
};

// 1. Create Review
export const createReviewHandler = async (req: Request, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    const userId = req.user?._id;

    // Check if review exists
    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product. Please edit your existing review." });
    }

    await Review.create({ user: userId, product: productId, rating, comment });
    await updateProductRating(productId);

    res.status(201).json({ message: "Review added successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get Product Reviews
export const getProductReviewsHandler = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Delete Review
export const deleteReviewHandler = async (req: Request, res: Response) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Allow Admin OR Review Owner to delete
    if (review.user.toString() !== userId?.toString() && userRole !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    const productId = review.product.toString();
    await review.deleteOne();
    await updateProductRating(productId);

    res.status(200).json({ message: "Review deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Get My Reviews
export const getMyReviewsHandler = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ user: req.user?._id }).populate('product', 'name images');
    res.status(200).json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Update Review (NEW FEATURE) ✏️
export const updateReviewHandler = async (req: Request, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const reviewId = req.params.id;
    const userId = req.user?._id;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Only Owner can edit
    if (review.user.toString() !== userId?.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this review" });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    await updateProductRating(review.product.toString());

    res.status(200).json({ message: "Review updated successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};