import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/category.model';

dotenv.config();

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ Connected to DB");

    const categories = [
      { name: 'Saree', description: 'Traditional Indian Sarees' },
      { name: 'Suit', description: 'Salwar Kameez and Dress Materials' },
      { name: 'Lehenga', description: 'Bridal and Party Wear Lehengas' }
    ];

    for (const cat of categories) {
      // Upsert: Update if exists, Insert if not
      await Category.findOneAndUpdate({ name: cat.name }, cat, { upsert: true });
    }

    console.log("✅ Categories Seeded Successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed", error);
    process.exit(1);
  }
};

seedCategories();