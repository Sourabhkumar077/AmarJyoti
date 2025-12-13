import app from './app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";

const startServer = async () => {
    try {
        if (!MONGO_URI) {
            throw new Error("MONGO_URI is missing in env variables");
        }
        
        // Connect to MongoDB Atlas [cite: 10]
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB Atlas");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Database connection failed", error);
        process.exit(1);
    }
};

startServer();