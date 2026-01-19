import { logger } from './utils/logger';
import app from './app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "";

const startServer = async () => {
    try {
        if (!MONGO_URI) {
            logger.error("MONGO_URI is missing in env variables");
            process.exit(1);
        }
        
        // Optimize connection pool for high concurrency
        await mongoose.connect(MONGO_URI, {
            maxPoolSize: 50, 
            serverSelectionTimeoutMS: 5000, 
            socketTimeoutMS: 45000, 
        });

        logger.info("Connected to MongoDB Atlas");

        const server = app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });

        // Graceful Shutdown handling
        const shutdown = () => {
            logger.info('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                logger.info('Process terminated');
                mongoose.connection.close(false);
                process.exit(0);
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

    } catch (error) {
        logger.error(error, "Database connection failed");
        process.exit(1);
    }
};

startServer();