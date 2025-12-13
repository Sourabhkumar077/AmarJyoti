import { Router } from 'express';
import { 
  getAllOrdersHandler, 
  getDashboardStatsHandler, 
  updateOrderStatusHandler 
} from '../controllers/admin.controller';
import { protect, adminOnly } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/zodValidation';
import { updateOrderStatusSchema } from '../utils/zodSchemas';

const router = Router();

// Apply Security Globally to this router
router.use(protect, adminOnly);

// 1. Dashboard Metrics
router.get('/stats', getDashboardStatsHandler); // GET /api/v1/admin/stats

// 2. Order Management
router.get('/orders', getAllOrdersHandler); // GET /api/v1/admin/orders
router.put(
  '/orders/:id/status', 
  validate(updateOrderStatusSchema), 
  updateOrderStatusHandler
); // PUT /api/v1/admin/orders/:id/status

export default router;