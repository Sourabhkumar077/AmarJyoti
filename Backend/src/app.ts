import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';

const app: Application = express();

// Middleware [cite: 66]
app.use(express.json());
app.use(cookieParser());
app.use(helmet()); // Security headers 
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);

// Health Check
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: "Amar Jyoti API is running", status: "OK" });
});

// Global Error Handler Stub [cite: 26]
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

export default app;