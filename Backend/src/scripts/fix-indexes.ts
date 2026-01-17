import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Cart from '../models/cart.model';

dotenv.config();

const fixIndexes = async () => {
  try {
    //  Check for MONGO_URI 
    const dbUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!dbUri) {
      throw new Error("❌ MONGO_URI is missing in .env file");
    }

    // 1. Connect to Database
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(dbUri);
    console.log(" Connected.");

    // 2. Get the Cart Collection
    const cartCollection = mongoose.connection.collection('carts');

    // 3. List existing indexes
    const indexes = await cartCollection.indexes();
    console.log("🔍 Found Indexes:", indexes.map(i => i.name));

    // 4. Drop the problematic 'user_1' index if it exists
    const userIndex = indexes.find(i => i.name === 'user_1');
    if (userIndex) {
      console.log("⚠️ Found conflicting index 'user_1'. Dropping it...");
      await cartCollection.dropIndex('user_1');
      console.log(" Dropped 'user_1' successfully.");
    } else {
      console.log("ℹ️ Index 'user_1' not found (Good).");
    }

    // 5. Drop 'guestId_1' just in case it conflicts too
    const guestIndex = indexes.find(i => i.name === 'guestId_1');
    if (guestIndex) {
      console.log("⚠️ Found potential conflicting index 'guestId_1'. Dropping it...");
      await cartCollection.dropIndex('guestId_1');
      console.log(" Dropped 'guestId_1' successfully.");
    }

    // 6. Force Mongoose to rebuild indexes immediately
    console.log("🔄 Rebuilding indexes from Schema...");
    await Cart.syncIndexes();
    console.log(" All Indexes Synced correctly!");

    console.log("🎉 Migration Complete. Your Cart system is now Production Ready.");
    process.exit(0);

  } catch (error) {
    console.error("❌ Migration Failed:", error);
    process.exit(1);
  }
};

fixIndexes();