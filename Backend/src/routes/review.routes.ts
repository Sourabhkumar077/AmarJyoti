import { Router } from 'express';
import { 
  createReviewHandler, 
  deleteReviewHandler, 
  getProductReviewsHandler,
  getMyReviewsHandler,
  updateReviewHandler,
  getAllReviewsHandler
} from '../controllers/review.controller';
import { protect, adminOnly } from '../middlewares/auth.middleware';

const router = Router();

// Public: Get reviews for a product
router.get('/product/:productId', getProductReviewsHandler);

// Protected: Add Review, Get My Reviews, Delete Review
router.post('/product/:productId', protect, createReviewHandler);
router.get('/my-reviews', protect, getMyReviewsHandler);
router.delete('/:id', protect, deleteReviewHandler); // Checks ownership inside controller
router.put('/:id', protect, updateReviewHandler);

// Admin only 
router.get('/admin/all', protect, adminOnly, getAllReviewsHandler);

export default router;