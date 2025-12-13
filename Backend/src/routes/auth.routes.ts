import { Router } from 'express';
import { validate } from '../middlewares/zodValidation';
import { loginSchema, registerSchema } from '../utils/zodSchemas';
import { loginHandler, registerHandler } from '../controllers/auth.controller';

const router = Router();

// Route: POST /api/v1/auth/register
router.post('/register', validate(registerSchema), registerHandler);

// Route: POST /api/v1/auth/login
router.post('/login', validate(loginSchema), loginHandler);

export default router;