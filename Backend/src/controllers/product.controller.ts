import { Request, Response } from "express";
import { logger } from "../utils/logger";
import * as productService from "../services/product.service";
import Product from "../models/product.model";
import Category from "../models/category.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
// import { uploadToImageKit } from "../services/image.service"; // Uncomment when ready

// 1. Create Product
export const createProductHandler = async (req: Request, res: Response) => {
  try {
    const { 
      name, description, category, price, stock, fabric, 
      colors, sizes, sizeDescription, discount, subcategory
    } = req.body;

    const numPrice = Number(price);
    const numStock = Number(stock);
    const numDiscount = Number(discount) || 0;
    
    // Calculate Sale Price accurately
    let finalSalePrice = numPrice;
    if (numDiscount > 0) {
      finalSalePrice = Math.round(numPrice - (numPrice * numDiscount / 100));
    }

    // Image Handling Logic
    let imageUrls: string[] = [];
    // Priority 1: URLs from Frontend
    if (req.body.images && Array.isArray(req.body.images)) {
        imageUrls = req.body.images;
    }
    
    // Priority 2: Files (if uploaded directly via Postman/Multer)
    if (req.files) {
        const files = req.files as Express.Multer.File[];
        for (const file of files) {
            console.log("File received:", file.originalname);
            // const url = await uploadToImageKit(file); 
            // imageUrls.push(url);
        }
    }

    const parsedColors = Array.isArray(colors) ? colors : (colors ? colors.split(',') : []);
    const parsedSizes = Array.isArray(sizes) ? sizes : (sizes ? sizes.split(',') : []);

    const product = await Product.create({
      name,
      description,
      category,
      price: numPrice,
      stock: numStock,
      fabric,
      colors: parsedColors,
      sizes: parsedSizes,
      sizeDescription,
      images: imageUrls, 
      isActive: true,
      discount: numDiscount,
      salePrice: finalSalePrice, // Storing correct sale price
      subcategory: subcategory || ""
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// 2. Get All Products (Stable Sorting Fixed)
export const getProductsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { category, sortBy, search, subcategory } = req.query;
    
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    let query: any = { isActive: true };

    if (category) {
      const categoryDoc = await Category.findOne({
        name: { $regex: new RegExp(String(category), "i") }, 
      });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        return res.status(200).json(new ApiResponse(200, {
            products: [],
            pagination: { totalProducts: 0, totalPages: 0, currentPage: 1, itemsPerPage: limit }
        }, "Category not found"));
      }
    }

    if (subcategory) {
        query.subcategory = { $regex: new RegExp(String(subcategory).trim(), "i") };
    }

    if (search) {
       query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
       ];
    }

    const totalProducts = await Product.countDocuments(query);

    // Initial Query
    let productQuery = Product.find(query).populate("category", "name");

    //  ROBUST STABLE SORTING (Applied BEFORE Skip/Limit)
    let sortOptions: any = { createdAt: -1 }; 

    if (sortBy === "newest") {
        sortOptions = { createdAt: -1 };
    } else if (sortBy === "price_low" || sortBy === "price_asc") {
        sortOptions = { salePrice: 1, price: 1, _id: -1 }; // Secondary keys added
    } else if (sortBy === "price_high" || sortBy === "price_desc") {
        sortOptions = { salePrice: -1, price: -1, _id: -1 };
    }

    // Apply Sort -> Skip -> Limit (Strict Order)
    productQuery = productQuery.sort(sortOptions).skip(skip).limit(limit);

    const products = await productQuery;
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json(new ApiResponse(200, {
        products,
        pagination: {
            totalProducts,
            totalPages,
            currentPage: page,
            itemsPerPage: limit
        }
    }, "Fetched Successfully"));
  }
);

// 3. Get Single Product
export const getProductByIdHandler = async (req: Request, res: Response) => {
  try {
    const product = await productService.getProduct(req.params.id);
    res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
  } catch (error: any) {
    if (error.message === "Product not found") {
      return res.status(404).json(new ApiResponse(404, null, "Product not found"));
    }
    logger.error(error, "Error fetching product");
    res.status(500).json(new ApiResponse(500, null, "Server Error"));
  }
};

// 4. Delete Product
export const deleteProductHandler = async (req: Request, res: Response) => {
  try {
    await productService.removeProduct(req.params.id);
    res.status(200).json(new ApiResponse(200, null, "Product deleted successfully"));
  } catch (error: any) {
    if (error.message === "Product not found") {
      return res.status(404).json(new ApiResponse(404, null, "Product not found"));
    }
    logger.error(error, "Error deleting product");
    res.status(500).json(new ApiResponse(500, null, "Server Error"));
  }
};

// 5. Update Product (With Correct Price Logic)
export const updateProductHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { price, discount, stock, subcategory, ...otherData } = req.body;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
    }

    const updatePayload: any = { ...otherData };

    if (stock !== undefined) updatePayload.stock = Number(stock);
    if (subcategory !== undefined) updatePayload.subcategory = subcategory;

    // Use new values if provided, otherwise keep existing
    const newPrice = price !== undefined ? Number(price) : existingProduct.price;
    const newDiscount = discount !== undefined ? Number(discount) : existingProduct.discount;

    if (price !== undefined) updatePayload.price = newPrice;
    if (discount !== undefined) updatePayload.discount = newDiscount;

    // Always recalculate Sale Price
    if (newDiscount > 0) {
        updatePayload.salePrice = Math.round(newPrice - (newPrice * newDiscount / 100));
    } else {
        updatePayload.salePrice = newPrice;
    }

    if (req.body.images && Array.isArray(req.body.images)) {
        updatePayload.images = req.body.images;
    }

    if (req.files) {
        const files = req.files as Express.Multer.File[];
        const newImageUrls: string[] = [];
        for (const file of files) {
             console.log("File received for update:", file.originalname);
             // const url = await uploadToImageKit(file);
             // newImageUrls.push(url);
        }
        if (newImageUrls.length > 0) {
            if (!updatePayload.$push) updatePayload.$push = {};
            updatePayload.$push.images = { $each: newImageUrls };
        }
    }

    const product = await Product.findByIdAndUpdate(id, updatePayload, { new: true });

    res.status(200).json(product);
  } catch (error: any) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// 6. REPAIR DATA TOOL
export const repairProductPricesHandler = async (req: Request, res: Response) => {
    try {
        const products = await Product.find({});
        let count = 0;
        
        for (const p of products) {
            const price = p.price || 0;
            const discount = p.discount || 0;
            
            let correctSalePrice = price;
            if (discount > 0) {
                correctSalePrice = Math.round(price - (price * discount / 100));
            }

            if (p.salePrice !== correctSalePrice) {
                p.salePrice = correctSalePrice;
                await p.save();
                count++;
            }
        }
        res.status(200).json({ message: `Successfully repaired prices for ${count} products.` });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};