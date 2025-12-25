import { Router } from 'express';
import { validate } from '../middlewares/zodValidation';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../utils/zodSchemas';
import { loginHandler, registerHandler,resetPasswordHandler, forgotPassword,updateProfileHandler ,sendOtp} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import rateLimit from 'express-rate-limit';

// Allow max 3 OTP requests per 15 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 3, 
  message: { message: "Too many OTP requests, please try again after 15 minutes" }
});

const router = Router();
// New Route for sending OTP
router.post('/send-otp',otpLimiter, sendOtp);

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