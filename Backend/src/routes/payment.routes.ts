import { Router } from 'express';
import { createOrderHandler, verifyPaymentHandler } from '../controllers/payment.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/zodValidation';
import { createOrderSchema, verifyPaymentSchema } from '../utils/zodSchemas';

const router = Router();

router.use(protect); // All routes require login

// Step 1: Frontend sends address -> Backend creates Razorpay Order ID
router.post(
  '/order', 
  validate(createOrderSchema), 
  createOrderHandler
);

// Step 2: Frontend pays -> Backend verifies signature
router.post(
  '/verify', 
  validate(verifyPaymentSchema), 
  verifyPaymentHandler
);

export default router;