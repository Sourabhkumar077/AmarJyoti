import { Router } from 'express';
import { getMyOrders } from '../controllers/order.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Route: /api/v1/orders/my-orders

router.get('/my-orders', protect, getMyOrders);

export default router;