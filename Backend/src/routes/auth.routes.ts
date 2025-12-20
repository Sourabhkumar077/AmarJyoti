import { Router } from 'express';
import { validate } from '../middlewares/zodValidation';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../utils/zodSchemas';
import { loginHandler, registerHandler,resetPasswordHandler, forgotPassword,updateProfileHandler } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Route: POST /api/v1/auth/register
router.post('/register', validate(registerSchema), registerHandler);

// Route: POST /api/v1/auth/login
router.post('/login', validate(loginSchema), loginHandler);

// Route : 
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPasswordHandler);

// Route : Update the profile details

router.put('/profile', protect, updateProfileHandler);

export default router;