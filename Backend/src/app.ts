import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import uploadRoutes from './routes/upload.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import reviewRoutes from './routes/review.routes';
import compression from 'compression';
import ApiError from './utils/ApiError';

const app: Application = express();

// Middleware [cite: 66]
app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use(helmet()); // Security headers 
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5174",
    credentials: true
}));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/orders', orderRoutes);

// Health Check
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: "Amar Jyoti API is running", status: "OK" });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode = (error as any).statusCode || 500;
        const message = error.message || 'Internal Server Error';
        error = new ApiError(statusCode, message, false, err.stack);
    }

    const {
        statusCode,
        message
    } = error as ApiError;

    res.status(statusCode).json({
        status: 'error',
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

export default app;