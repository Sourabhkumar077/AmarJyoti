import { Router } from 'express';
import { 
  addToCartHandler, 
  getCartHandler, 
  removeCartItemHandler, 
  updateCartItemHandler 
} from '../controllers/cart.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/zodValidation';
import { addToCartSchema, updateCartSchema } from '../utils/zodSchemas';

const router = Router();

// All Cart routes require Authentication
router.use(protect);

router.get('/', getCartHandler); // GET /api/v1/cart

router.post(
  '/add', 
  validate(addToCartSchema), 
  addToCartHandler
); // POST /api/v1/cart/add

router.put(
  '/update/:itemId', 
  validate(updateCartSchema), 
  updateCartItemHandler
); // PUT /api/v1/cart/update/:itemId

router.delete(
  '/remove/:itemId', 
  removeCartItemHandler
); // DELETE /api/v1/cart/remove/:itemId

export default router;