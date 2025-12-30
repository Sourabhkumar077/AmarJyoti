import { Request, Response } from "express";
import { logger } from "../utils/logger";
import * as productService from "../services/product.service";
import Product from "../models/product.model";
import Category from "../models/category.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import fs from 'fs';


// 1. Create Product (Admin Only)
export const createProductHandler = async (req: Request, res: Response) => {
  try {
    // 1. Body se data nikala
    const { 
      name, description, category, price, stock, fabric, 
      colors, sizes, sizeDescription, discount 
    } = req.body;

    // 2. ✅ Safe Number Conversion & Sale Price Calculation
    const numPrice = Number(price);
    const numStock = Number(stock);
    const numDiscount = Number(discount) || 0;
    
    let finalSalePrice = numPrice;
    
    // Agar discount hai, to Sale Price calculate karo
    if (numDiscount > 0) {
      finalSalePrice = Math.round(numPrice - (numPrice * numDiscount / 100));
    }

    // 3. Image Handling Logic
    // (Aapka purana logic yahan aayega)
    let imageUrls: string[] = [];
    
    // Scenario A: Agar Frontend se direct URL aa rahe hain
    if (req.body.images && Array.isArray(req.body.images)) {
        imageUrls = req.body.images;
    }
    
    // Scenario B: Agar Files upload ho rahi hain (Multer)
    if (req.files) {
        const files = req.files as Express.Multer.File[];
        for (const file of files) {
            // 👇 YAHAN APNA UPLOAD FUNCTION CALL KAREIN
            // const url = await uploadToImageKit(file); 
            // imageUrls.push(url);
            
            // Dummy logic taaki code na fate (Replace this with your upload logic)
            console.log("File received but upload logic needs your function:", file.originalname);
        }
    }

    // 4. Array Conversion (Colors/Sizes)
    // Ye ensure karta hai ki agar string aaye "Red,Blue" to wo Array ban jaye
    const parsedColors = Array.isArray(colors) ? colors : (colors ? colors.split(',') : []);
    const parsedSizes = Array.isArray(sizes) ? sizes : (sizes ? sizes.split(',') : []);

    // 5. Create Product in DB
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
      images: imageUrls, // Jo URLs upar set huye
      isActive: true,
      
      // ✅ New Fields Save kar rahe hain
      discount: numDiscount,
      salePrice: finalSalePrice 
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// 2. Get All Products (With Filters & Category Fix)
export const getProductsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { category, sortBy, search } = req.query;

    let query: any = {};

    // 1. Handle Category Filter (Name -> ID translation)
    if (category) {
      const categoryDoc = await Category.findOne({
        name: { $regex: new RegExp(`^${category}$`, "i") },
      });

      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        return res
          .status(200)
          .json(
            new ApiResponse(200, [], "No products found for this category")
          );
      }
    }

    // 2. Handle Search
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // 3. Build Query
    let productQuery = Product.find(query).populate("category", "name");

    // 4. Handle Sorting
    if (sortBy === "newest") {
      productQuery = productQuery.sort({ createdAt: -1 });
    } else if (sortBy === "price_low") {
      productQuery = productQuery.sort({ price: 1 });
    } else if (sortBy === "price_high") {
      productQuery = productQuery.sort({ price: -1 });
    }

    const products = await productQuery;

    // Use ApiResponse
    res
      .status(200)
      .json(new ApiResponse(200, products, "Products fetched successfully"));
  }
);

// 3. Get Single Product
export const getProductByIdHandler = async (req: Request, res: Response) => {
  try {
    const product = await productService.getProduct(req.params.id);
    // Use ApiResponse so Frontend .data.data works
    res
      .status(200)
      .json(new ApiResponse(200, product, "Product fetched successfully"));
  } catch (error: any) {
    if (error.message === "Product not found") {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Product not found"));
    }
    logger.error(error, "Error fetching product");
    res.status(500).json(new ApiResponse(500, null, "Server Error"));
  }
};

// 4. Delete Product (Admin Only)
export const deleteProductHandler = async (req: Request, res: Response) => {
  try {
    await productService.removeProduct(req.params.id);
    // Use ApiResponse
    res
      .status(200)
      .json(new ApiResponse(200, null, "Product deleted successfully"));
  } catch (error: any) {
    if (error.message === "Product not found") {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Product not found"));
    }
    logger.error(error, "Error deleting product");
    res.status(500).json(new ApiResponse(500, null, "Server Error"));
  }
};

// 5. Update Product (Admin Only)
export const updateProductHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { price, discount, stock, ...otherData } = req.body;

    // 1. Update Object Prepare karein
    const updatePayload: any = { ...otherData };

    // Stock convert karo
    if (stock !== undefined) updatePayload.stock = Number(stock);

    // 2. ✅ Price & Discount Logic (Automatic Calculation)
    if (price !== undefined || discount !== undefined) {
      const numPrice = price !== undefined ? Number(price) : undefined;
      const numDiscount = discount !== undefined ? Number(discount) : 0;

      if (numPrice !== undefined) updatePayload.price = numPrice;
      updatePayload.discount = numDiscount;

      // Sale Price Tabhi niklega jab Price maujood ho
      if (numPrice !== undefined) {
        if (numDiscount > 0) {
          updatePayload.salePrice = Math.round(numPrice - (numPrice * numDiscount / 100));
        } else {
          updatePayload.salePrice = numPrice;
        }
      }
    }

    // 3. Image Handling (Update ke time)
    // Agar nayi files aayi hain to unhe add karo
    if (req.files) {
        const files = req.files as Express.Multer.File[];
        const newImageUrls: string[] = [];
        
        for (const file of files) {
            // 👇 YAHAN APNA UPLOAD FUNCTION CALL KAREIN
            // const url = await uploadToImageKit(file);
            // newImageUrls.push(url);
        }

        // Database me push karne ka logic
        if (newImageUrls.length > 0) {
            if (!updatePayload.$push) updatePayload.$push = {};
            updatePayload.$push.images = { $each: newImageUrls };
        }
    }

    // 4. Database Update
    const product = await Product.findByIdAndUpdate(id, updatePayload, { new: true });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error: any) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};