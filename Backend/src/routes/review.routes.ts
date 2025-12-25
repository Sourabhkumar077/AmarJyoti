import { Router } from 'express';
import { validate } from '../middlewares/zodValidation';
import { reviewSchema } from '../utils/zodSchemas';
import { 
  addReview, 
  deleteReview, 
  getProductReviews,
  getMyReviews,
  updateReview,
  getAllReviews
} from '../controllers/review.controller';
import { protect, adminOnly } from '../middlewares/auth.middleware';

const router = Router();

// Public: Get reviews for a product
router.get('/product/:productId', getProductReviews);

// Protected Routes
// NOTE: We use 'addReview' instead of 'createReviewHandler' to match controller
router.post('/product/:productId', protect, validate(reviewSchema), addReview);
router.get('/my-reviews', protect, getMyReviews);

// Update & Delete (Uses :id to match the controller's logic)
router.delete('/:id', protect, deleteReview); 
router.put('/:id', protect, validate(reviewSchema), updateReview);

// Admin only 
router.get('/admin/all', protect, adminOnly, getAllReviews);

export default router;