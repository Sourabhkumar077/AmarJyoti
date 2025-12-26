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
        
        // Connect to MongoDB Atlas [cite: 10]
        await mongoose.connect(MONGO_URI);
        logger.info("✅ Connected to MongoDB Atlas");

        app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error(error, "❌ Database connection failed");
        process.exit(1);
    }
};

startServer();