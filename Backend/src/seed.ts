// src/seed.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/category.model'; 
import Product from './models/product.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/amar_jyoti';

// --- 1. SAREE DATA ---
const sareeNames = [
  "Royal Banarasi Silk Saree", "Kanjivaram Gold Weave", "Soft Pastel Chiffon", "Midnight Blue Georgette", 
  "Traditional Red Bandhani", "Peach Organza Floral", "Emerald Green Silk", "Pink Mysore Silk", 
  "Golden Tissue Saree", "White Kerala Kasavu", "Teal Paithani", "Lavender Linen Breeze", 
  "Mustard Tussar Silk", "Burgundy Velvet Border", "Sky Blue Net Saree", "Rust Orange Cotton", 
  "Silver Grey Satin", "Magenta Art Silk", "Beige Handloom", "Charcoal Chanderi"
];

// Specific Images for Sarees
const sareeImages = [
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80",
  "https://images.unsplash.com/photo-1583391733975-675880987b1f?w=600&q=80",
  "https://images.unsplash.com/photo-1609357912429-4ae5a6e70908?w=600&q=80",
  "https://images.unsplash.com/photo-1618221631720-9430156d956e?w=600&q=80",
  "https://images.unsplash.com/photo-1621532029532-628d052a5c53?w=600&q=80",
  "https://images.unsplash.com/photo-1610189012906-4447f54d7e2e?w=600&q=80",
  "https://images.unsplash.com/photo-1596765798099-c8529cb68b9a?w=600&q=80",
  "https://images.unsplash.com/photo-1627932644265-d0a920210082?w=600&q=80",
  "https://images.unsplash.com/photo-1612444605051-409b69b5585b?w=600&q=80",
  "https://images.unsplash.com/photo-1596639537604-0c58e80554c6?w=600&q=80",
  "https://images.unsplash.com/photo-1630327318719-72f10b377f0a?w=600&q=80",
  "https://images.unsplash.com/photo-1616688176378-04f141449769?w=600&q=80",
  "https://images.unsplash.com/photo-1610030469668-9656059525b4?w=600&q=80",
  "https://images.unsplash.com/photo-1620917669788-dc8c3c75e5ad?w=600&q=80",
  "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=600&q=80",
  "https://images.unsplash.com/photo-1600180758960-2e4e6c3e0c41?w=600&q=80",
  "https://images.unsplash.com/photo-1629385701021-3e95e2da233c?w=600&q=80",
  "https://images.unsplash.com/photo-1595303526913-c7037797acd7?w=600&q=80",
  "https://images.unsplash.com/photo-1620917669799-8d3b4b6b9b41?w=600&q=80"
];


// --- 2. SUIT DATA ---
const suitNames = [
  "Peach Anarkali Set", "Teal Sharara Suit", "White Chikankari Kurta", "Navy Blue Palazzo Set",
  "Yellow Haldi Special Suit", "Maroon Velvet Salwar", "Pastel Green Straight Suit", "Dusty Pink Georgette",
  "Royal Blue Patiala", "Grey Embroidered Set", "Mint Green Angrakha", "Coral Silk Blend Suit",
  "Black Mirror Work Kurta", "Lavender Punjabi Suit", "Golden Festive Set", "Beige Cotton Daily Wear",
  "Olive Green Jacket Style", "Rust Orange A-Line", "Cream & Gold Party Wear", "Indigo Block Print"
];

// Specific Images for Suits
const suitImages = [
  "https://images.unsplash.com/photo-1583391733958-e0295c29272e?w=600&q=80",
  "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&q=80",
  "https://images.unsplash.com/photo-1597983073493-88cd357a8169?w=600&q=80",
  "https://images.unsplash.com/photo-1585994356402-9a59247385f0?w=600&q=80",
  "https://images.unsplash.com/photo-1550614000-4b9519e0906f?w=600&q=80",
  "https://images.unsplash.com/photo-1631248055158-b4b2c02787b1?w=600&q=80",
  "https://images.unsplash.com/photo-1623945958564-9b578c75d40a?w=600&q=80",
  "https://images.unsplash.com/photo-1589810635657-232948472d98?w=600&q=80",
  "https://images.unsplash.com/photo-1615886567151-b84299b66219?w=600&q=80",
  "https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?w=600&q=80",
  "https://images.unsplash.com/photo-1632128532452-f63da081b7e4?w=600&q=80",
  "https://images.unsplash.com/photo-1597354395276-88c227163c45?w=600&q=80",
  "https://images.unsplash.com/photo-1619623668832-6c382103f56f?w=600&q=80",
  "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600&q=80",
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3cc3?w=600&q=80",
  "https://images.unsplash.com/photo-1602810318237-40d7c6d1b8d0?w=600&q=80",
  "https://images.unsplash.com/photo-1622482187848-9a9f0e3530d3?w=600&q=80",
  "https://images.unsplash.com/photo-1602810318071-9c0a0d2cdbb1?w=600&q=80",
  "https://images.unsplash.com/photo-1598514982205-fb5c99c5dfc4?w=600&q=80",
  "https://images.unsplash.com/photo-1598515214215-2f5a6c8bdb98?w=600&q=80"
];


// --- 3. LEHENGA DATA ---
const lehengaNames = [
  "Bridal Red Velvet Lehenga", "Pastel Pink Floral Lehenga", "Gold Sequined Party Wear", "Emerald Green Velvet",
  "Royal Blue Silk Lehenga", "Peach Net Ruffled Lehenga", "Maroon Zari Work", "Yellow Mirror Work (Haldi)",
  "White Pearl Embroidered", "Lavender Crop Top Skirt", "Mustard Yellow Silk", "Dusty Rose Georgette",
  "Silver Grey Reception Lehenga", "Teal Blue Art Silk", "Wine Color Heavy Work", "Orange Ombre Lehenga",
  "Beige Banarasi Lehenga", "Sky Blue Thread Work", "Black & Gold Modern", "Coral Pink Bridal"
];

// Specific Images for Lehengas
const lehengaImages = [
  "https://images.unsplash.com/photo-1512353087810-25dfcd100962?w=600&q=80",
  "https://images.unsplash.com/photo-1594591423765-96570997199c?w=600&q=80",
  "https://images.unsplash.com/photo-1601055903647-87ac96fd1492?w=600&q=80",
  "https://images.unsplash.com/photo-1582234057398-e76059d74945?w=600&q=80",
  "https://images.unsplash.com/photo-1562184552-e0a514d1d643?w=600&q=80",
  "https://images.unsplash.com/photo-1605763240004-7e93b172d754?w=600&q=80",
  "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80",
  "https://images.unsplash.com/photo-1606293926075-69a00febf280?w=600&q=80",
  "https://images.unsplash.com/photo-1627932644265-d0a920210082?w=600&q=80",
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
  "https://images.unsplash.com/photo-1622482187848-9a9f0e3530d3?w=600&q=80",
  "https://images.unsplash.com/photo-1629385701021-3e95e2da233c?w=600&q=80",
  "https://images.unsplash.com/photo-1596765798099-c8529cb68b9a?w=600&q=80",
  "https://images.unsplash.com/photo-1616688176378-04f141449769?w=600&q=80",
  "https://images.unsplash.com/photo-1610030469668-9656059525b4?w=600&q=80",
  "https://images.unsplash.com/photo-1595303526913-c7037797acd7?w=600&q=80",
  "https://images.unsplash.com/photo-1620917669788-dc8c3c75e5ad?w=600&q=80",
  "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=600&q=80",
  "https://images.unsplash.com/photo-1600180758960-2e4e6c3e0c41?w=600&q=80",
  "https://images.unsplash.com/photo-1620917669799-8d3b4b6b9b41?w=600&q=80"
];


const fabrics = ["Silk", "Georgette", "Cotton", "Velvet", "Chiffon", "Organza", "Net", "Crepe"];
const colors = ["Red", "Blue", "Green", "Pink", "Gold", "White", "Black", "Yellow", "Peach", "Lavender"];

// Helper to pick a random item from any array
const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomPrice = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 Connected to MongoDB...');

    await Product.deleteMany({});
    console.log('🧹 Cleared existing products.');

    const categories = ['Saree', 'Suit', 'Lehenga'];
    const catIds: Record<string, string> = {};

    for (const catName of categories) {
      let cat = await Category.findOne({ name: catName });
      if (!cat) {
        cat = await Category.create({ 
            name: catName, 
            description: `Exclusive collection of ${catName}s` 
        });
      }
      catIds[catName] = cat._id.toString();
    }

    const allProducts = [];

    // 3. Generate Sarees (Using Saree Images)
    for (const name of sareeNames) {
      allProducts.push({
        name,
        description: `A beautiful ${name} crafted with precision. Perfect for weddings and festive occasions.`,
        category: catIds['Saree'],
        price: getRandomPrice(500, 15000),
        stock: getRandomPrice(0, 20),
        fabric: getRandomItem(fabrics),
        colors: [getRandomItem(colors), getRandomItem(colors)],
        // Pick 2 random images from SAREE list
        images: [getRandomItem(sareeImages), getRandomItem(sareeImages)],
        isActive: true
      });
    }

    // 4. Generate Suits (Using Suit Images)
    for (const name of suitNames) {
      allProducts.push({
        name,
        description: `Elegant ${name} designed for comfort and style. Includes top, bottom, and dupatta.`,
        category: catIds['Suit'],
        price: getRandomPrice(1000, 8000),
        stock: getRandomPrice(2, 25),
        fabric: getRandomItem(fabrics),
        colors: [getRandomItem(colors)],
        // Pick 2 random images from SUIT list
        images: [getRandomItem(suitImages), getRandomItem(suitImages)],
        isActive: true
      });
    }

    // 5. Generate Lehengas (Using Lehenga Images)
    for (const name of lehengaNames) {
      allProducts.push({
        name,
        description: `Stunning ${name} with intricate embroidery. The perfect choice for the modern bride.`,
        category: catIds['Lehenga'],
        price: getRandomPrice(500, 10000),
        stock: getRandomPrice(1, 10),
        fabric: getRandomItem(fabrics),
        colors: [getRandomItem(colors), getRandomItem(colors)],
        // Pick 2 random images from LEHENGA list
        images: [getRandomItem(lehengaImages), getRandomItem(lehengaImages)],
        isActive: true
      });
    }

    await Product.insertMany(allProducts);
    console.log(`🚀 Successfully inserted ${allProducts.length} products with unique images!`);

    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();