import { Router } from 'express';
import { validate } from '../middlewares/zodValidation';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../utils/zodSchemas';
import { loginHandler, registerHandler,resetPasswordHandler, forgotPassword } from '../controllers/auth.controller';

const router = Router();

// Route: POST /api/v1/auth/register
router.post('/register', validate(registerSchema), registerHandler);

// Route: POST /api/v1/auth/login
router.post('/login', validate(loginSchema), loginHandler);

// Route : 
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPasswordHandler);

export default router;