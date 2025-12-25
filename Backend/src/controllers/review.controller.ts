import { Request, Response } from 'express';
import  {asyncHandler}  from '../utils/asyncHandler';
import  ApiError  from '../utils/ApiError';
import  {ApiResponse} from "../utils/ApiResponse"
import Review from '../models/review.model';
import Product from '../models/product.model';
import mongoose from 'mongoose';

// --- Helper: Recalculate Average Rating ---
const updateProductRating = async (productId: string) => {
  const reviews = await Review.find({ product: productId });
  const numOfReviews = reviews.length;
  
  const ratings = numOfReviews === 0 
    ? 0 
    : reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews;

  await Product.findByIdAndUpdate(productId, {
    ratings,
    numOfReviews
  });
};

// 1. Get Reviews for a Product
export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid Product ID");
  }

  const reviews = await Review.find({ product: productId })
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, reviews, "Reviews fetched successfully")
  );
});

// 2. Add Review
export const addReview = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user?._id;

  if (!userId) throw new ApiError(401, "Unauthorized");
  if (!mongoose.Types.ObjectId.isValid(productId)) throw new ApiError(400, "Invalid Product ID");

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const existingReview = await Review.findOne({ product: productId, user: userId });
  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this product");
  }

  const review = await Review.create({
    product: productId,
    user: userId,
    rating: Number(rating),
    comment
  });

  await updateProductRating(productId);

  return res.status(201).json(
    new ApiResponse(201, review, "Review added successfully")
  );
});

// 3. Delete Review
export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  // Route is /:id, so we look for req.params.id
  const { id } = req.params; 
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid Review ID");

  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, "Review not found");

  // Authorization Check
  if (review.user.toString() !== userId?.toString() && req.user?.role !== 'admin') {
    throw new ApiError(403, "Not authorized to delete this review");
  }

  const productId = review.product.toString();
  await Review.findByIdAndDelete(id);

  await updateProductRating(productId);

  return res.status(200).json(
    new ApiResponse(200, null, "Review deleted successfully")
  );
});

// 4. Update Review
export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid Review ID");

  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, "Review not found");

  if (review.user.toString() !== userId?.toString()) {
    throw new ApiError(403, "Not authorized to update this review");
  }

  review.rating = Number(rating);
  review.comment = comment;
  await review.save();

  await updateProductRating(review.product.toString());

  return res.status(200).json(
    new ApiResponse(200, review, "Review updated successfully")
  );
});

// 5. Get My Reviews (New)
export const getMyReviews = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const reviews = await Review.find({ user: userId }).populate('product', 'name images');
  
  return res.status(200).json(
    new ApiResponse(200, reviews, "User reviews fetched")
  );
});

// 6. Get All Reviews (Admin - New)
export const getAllReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await Review.find()
    .populate('user', 'name email')
    .populate('product', 'name');
    
  return res.status(200).json(
    new ApiResponse(200, reviews, "All reviews fetched")
  );
});