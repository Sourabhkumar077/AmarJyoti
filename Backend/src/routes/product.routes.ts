import { Router } from 'express';
import { createProductHandler, getProductsHandler, getProductByIdHandler ,deleteProductHandler,updateProductHandler} from '../controllers/product.controller';
import { protect, adminOnly } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/zodValidation';
import { productSchema } from '../utils/zodSchemas';

const router = Router();

// Public Routes
router.get('/', getProductsHandler);       // GET /api/v1/products
router.get('/:id', getProductByIdHandler); // GET /api/v1/products/:id

// Protected Admin Routes
// Uses: Auth Check -> Admin Check -> Zod Validation -> Controller
router.post(
  '/', 
  protect, 
  adminOnly, 
  validate(productSchema), 
  createProductHandler
);

router.delete(
  '/:id', 
  protect, 
  adminOnly, 
  deleteProductHandler
);

router.put(
  '/:id', 
  protect, 
  adminOnly, 
  // validate(productSchema), if validation is strict then we can remove it or use it
  updateProductHandler
);
export default router;