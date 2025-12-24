import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/category.model'; 
import Product from './models/product.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/amar_jyoti';

// 👇 ImageKit Optimizer Helper
// Ye function automatic width=400, quality=70, aur webp format set karega
const optimizeImageKit = (url: string) => {
  if (!url) return "";
  // Check agar already params hain to append kare, nahi to naye banaye
  return url.includes('?') 
    ? `${url}&tr=w-400,q-70,f-webp` 
    : `${url}?tr=w-400,q-70,f-webp`;
};


// 1. SAREE IMAGES (Comma separated strings)
const sareeImagesRaw = [
  "https://ik.imagekit.io/SourabhKumar077/products/Saree/81yg-mfLaAL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566154653",
  "https://ik.imagekit.io/SourabhKumar077/products/Saree/816Ir2nykdL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566154492",
  "https://ik.imagekit.io/SourabhKumar077/products/Saree/816QjbBxvGL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566154495",
  "https://ik.imagekit.io/SourabhKumar077/products/Saree/81hTfXanfML._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566108741",
  "https://ik.imagekit.io/SourabhKumar077/products/Saree/81G+QgfrLiL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566108729",
  "https://ik.imagekit.io/SourabhKumar077/products/Saree/81GwUG27YNL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566108707",
  "https://ik.imagekit.io/SourabhKumar077/products/Saree/81ISyY+XeIL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566108613",
  "https://ik.imagekit.io/SourabhKumar077/products/Saree/81EUk2gvZdL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566108252",
  "https://ik.imagekit.io/SourabhKumar077/products/Saree/71oAJL6WPuL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566108130",
  "https://ik.imagekit.io/SourabhKumar077/products/Saree/71oAJL6WPuL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566108130",
  "https://ik.imagekit.io/SourabhKumar077/products/Saree/71oAJL6WPuL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566108130",
  "https://ik.imagekit.io/SourabhKumar077/products/Saree/71oAJL6WPuL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566108130",
  "https://ik.imagekit.io/SourabhKumar077/products/Saree/71A33HaaUgL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566039427",
  "https://ik.imagekit.io/SourabhKumar077/products/Saree/61CBEnYVWaL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566039383",
  "https://ik.imagekit.io/SourabhKumar077/products/Saree/71L7l+xbkmL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566039304",
  "https://ik.imagekit.io/SourabhKumar077/products/Saree/51hhLJl8ApL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566039229",
  "https://ik.imagekit.io/SourabhKumar077/products/Saree/61CoUzAoYpL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566039168"
];

// 2. SUIT IMAGES
const suitImagesRaw = [
  "https://ik.imagekit.io/SourabhKumar077/products/Suits/71PMOKOuf5L._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566322549",
  "https://ik.imagekit.io/SourabhKumar077/products/Suits/71RyKT6pkDL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566322163",
  "https://ik.imagekit.io/SourabhKumar077/products/Suits/71mp9GNvFGL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566322073",
  "https://ik.imagekit.io/SourabhKumar077/products/Suits/71ilknjwNJL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566321883",
  "https://ik.imagekit.io/SourabhKumar077/products/Suits/71I53evweVL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566261300",
  "https://ik.imagekit.io/SourabhKumar077/products/Suits/71ge2Ny3gPL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566261180",
  "https://ik.imagekit.io/SourabhKumar077/products/Suits/71d8nMfMZ6L._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566261078",
  "https://ik.imagekit.io/SourabhKumar077/products/Suits/61tDLuNGn1L._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566238429",
  "https://ik.imagekit.io/SourabhKumar077/products/Suits/61tDLuNGn1L._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566238429",
  "https://ik.imagekit.io/SourabhKumar077/products/Suits/61IhrjrcrLL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566238149",
  "https://ik.imagekit.io/SourabhKumar077/products/Suits/61tDOR1xGtL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566238141",
  "https://ik.imagekit.io/SourabhKumar077/products/Suits/61nIgXWHisL._AC_UL480_FMwebp_QL65_.webp?updatedAt=1766566238157"
];

// 3. LEHENGA IMAGES
const lehengaImagesRaw = [
  "https://ik.imagekit.io/SourabhKumar077/products/lehnga/81-qfFAz0YL._AC_UL480_FMwebp_QL65_.webp", 
  "https://ik.imagekit.io/SourabhKumar077/products/lehnga/81R623KmQYL._AC_UL480_FMwebp_QL65_.webp",
  "https://ik.imagekit.io/SourabhKumar077/products/lehnga/81up4kTSj1L._AC_UL480_FMwebp_QL65_.webp",
  "https://ik.imagekit.io/SourabhKumar077/products/lehnga/819SwiSFdAL._AC_UL480_FMwebp_QL65_.webp",
  "https://ik.imagekit.io/SourabhKumar077/products/lehnga/81RzPanz26L._AC_UL480_FMwebp_QL65_.webp",
  "https://ik.imagekit.io/SourabhKumar077/products/lehnga/81rZgurB8JL._AC_UL480_FMwebp_QL65_.webp",
  "https://ik.imagekit.io/SourabhKumar077/products/lehnga/716M97DWReL._AC_UL480_FMwebp_QL65_.webp",
  "https://ik.imagekit.io/SourabhKumar077/products/lehnga/91LjdIio2wL._AC_UL480_FMwebp_QL65_.webp",
  "https://ik.imagekit.io/SourabhKumar077/products/lehnga/91LBz6HpHBL._AC_UL480_FMwebp_QL65_.webp",
  "https://ik.imagekit.io/SourabhKumar077/products/lehnga/71i69YQcuPL._AC_UL480_FMwebp_QL65_.webp",
  "https://ik.imagekit.io/SourabhKumar077/products/lehnga/81DfaXR6brL._AC_UL480_FMwebp_QL65_.webp",
  "https://ik.imagekit.io/SourabhKumar077/products/lehnga/71sRh0GBSyL._AC_UL480_FMwebp_QL65_.webp"
];

// Apply Optimization
const sareeImages = sareeImagesRaw.map(optimizeImageKit);
const suitImages = suitImagesRaw.map(optimizeImageKit);
const lehengaImages = lehengaImagesRaw.map(optimizeImageKit);


// =========================================================
// PRODUCT NAMES & DATA
// =========================================================

const sareeNames = [
  "Royal Banarasi Silk Saree", "Kanjivaram Gold Weave", "Soft Pastel Chiffon", "Midnight Blue Georgette", 
  "Traditional Red Bandhani", "Peach Organza Floral", "Emerald Green Silk", "Pink Mysore Silk", 
  "Golden Tissue Saree", "White Kerala Kasavu", "Teal Paithani", "Lavender Linen Breeze", 
  "Mustard Tussar Silk", "Burgundy Velvet Border", "Sky Blue Net Saree", "Rust Orange Cotton", 
  "Silver Grey Satin", "Magenta Art Silk", "Beige Handloom", "Charcoal Chanderi"
];

const suitNames = [
  "Peach Anarkali Set", "Teal Sharara Suit", "White Chikankari Kurta", "Navy Blue Palazzo Set",
  "Yellow Haldi Special Suit", "Maroon Velvet Salwar", "Pastel Green Straight Suit", "Dusty Pink Georgette",
  "Royal Blue Patiala", "Grey Embroidered Set", "Mint Green Angrakha", "Coral Silk Blend Suit",
  "Black Mirror Work Kurta", "Lavender Punjabi Suit", "Golden Festive Set", "Beige Cotton Daily Wear",
  "Olive Green Jacket Style", "Rust Orange A-Line", "Cream & Gold Party Wear", "Indigo Block Print"
];

const lehengaNames = [
  "Bridal Red Velvet Lehenga", "Pastel Pink Floral Lehenga", "Gold Sequined Party Wear", "Emerald Green Velvet",
  "Royal Blue Silk Lehenga", "Peach Net Ruffled Lehenga", "Maroon Zari Work", "Yellow Mirror Work (Haldi)",
  "White Pearl Embroidered", "Lavender Crop Top Skirt", "Mustard Yellow Silk", "Dusty Rose Georgette",
  "Silver Grey Reception Lehenga", "Teal Blue Art Silk", "Wine Color Heavy Work", "Orange Ombre Lehenga",
  "Beige Banarasi Lehenga", "Sky Blue Thread Work", "Black & Gold Modern", "Coral Pink Bridal"
];

const fabrics = ["Silk", "Georgette", "Cotton", "Velvet", "Chiffon", "Organza", "Net", "Crepe"];
const colors = ["Red", "Blue", "Green", "Pink", "Gold", "White", "Black", "Yellow", "Peach", "Lavender"];

const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomPrice = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 Connected to MongoDB...');

    // Clear Old Data
    await Product.deleteMany({});
    console.log('🧹 Cleared existing products.');

    const categories = ['Saree', 'Suit', 'Lehenga'];
    const catIds: Record<string, string> = {};

    for (const catName of categories) {
      let cat = await Category.findOne({ name: catName });
      if (!cat) {
        cat = await Category.create({ name: catName, description: `Exclusive collection of ${catName}s` });
      }
      catIds[catName] = cat._id.toString();
    }

    const allProducts = [];

    // Generate Sarees
    for (const name of sareeNames) {
      allProducts.push({
        name,
        description: `A beautiful ${name} crafted with precision. Perfect for weddings and festive occasions.`,
        category: catIds['Saree'],
        price: getRandomPrice(500, 15000),
        stock: getRandomPrice(0, 20),
        fabric: getRandomItem(fabrics),
        colors: [getRandomItem(colors), getRandomItem(colors)],
        images: [getRandomItem(sareeImages), getRandomItem(sareeImages)], 
        isActive: true
      });
    }

    // Generate Suits
    for (const name of suitNames) {
      allProducts.push({
        name,
        description: `Elegant ${name} designed for comfort and style. Includes top, bottom, and dupatta.`,
        category: catIds['Suit'],
        price: getRandomPrice(1000, 8000),
        stock: getRandomPrice(2, 25),
        fabric: getRandomItem(fabrics),
        colors: [getRandomItem(colors)],
        images: [getRandomItem(suitImages), getRandomItem(suitImages)], 
        isActive: true
      });
    }

    // Generate Lehengas
    for (const name of lehengaNames) {
      allProducts.push({
        name,
        description: `Stunning ${name} with intricate embroidery. The perfect choice for the modern bride.`,
        category: catIds['Lehenga'],
        price: getRandomPrice(500, 10000),
        stock: getRandomPrice(1, 10),
        fabric: getRandomItem(fabrics),
        colors: [getRandomItem(colors), getRandomItem(colors)],
        images: [getRandomItem(lehengaImages), getRandomItem(lehengaImages)], 
        isActive: true
      });
    }

    await Product.insertMany(allProducts);
    console.log(`🚀 Successfully inserted ${allProducts.length} products using ImageKit URLs!`);

    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();