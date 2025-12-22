import { Router } from 'express';
import { 
  createReviewHandler, 
  deleteReviewHandler, 
  getProductReviewsHandler,
  getMyReviewsHandler,
  updateReviewHandler
} from '../controllers/review.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Public: Get reviews for a product
router.get('/product/:productId', getProductReviewsHandler);

// Protected: Add Review, Get My Reviews, Delete Review
router.post('/product/:productId', protect, createReviewHandler);
router.get('/my-reviews', protect, getMyReviewsHandler);
router.delete('/:id', protect, deleteReviewHandler); // Checks ownership inside controller
router.put('/:id', protect, updateReviewHandler);

export default router;