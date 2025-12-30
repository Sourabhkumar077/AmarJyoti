import { Request, Response } from "express";
import { logger } from "../utils/logger";
import * as productService from "../services/product.service";
import Product from "../models/product.model";
import Category from "../models/category.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

// 1. Create Product (Admin Only)
export const createProductHandler = async (req: Request, res: Response) => {
  try {
    
    const { 
      name, description, category, price, stock, fabric, 
      colors, sizes, sizeDescription, discount ,subcategory
    } = req.body;

    const numPrice = Number(price);
    const numStock = Number(stock);
    const numDiscount = Number(discount) || 0;
    
    let finalSalePrice = numPrice;
   
    if (numDiscount > 0) {
      finalSalePrice = Math.round(numPrice - (numPrice * numDiscount / 100));
    }

    // 3. Image Handling Logic
    let imageUrls: string[] = [];
    if (req.body.images && Array.isArray(req.body.images)) {
        imageUrls = req.body.images;
    }
    if (req.files) {
        const files = req.files as Express.Multer.File[];
        for (const file of files) {
            console.log("File received but upload logic needs your function:", file.originalname);
        }
    }

    // 4. Array Conversion (Colors/Sizes)
    
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
      images: imageUrls, 
      isActive: true,
      discount: numDiscount,
      salePrice: finalSalePrice ,
      subcategory: subcategory || ""
      
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
    const { category, sortBy, search, subcategory } = req.query;
    
    // 1. Pagination Params Setup
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    let query: any = { isActive: true };

    // --- Category Logic ---
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

    // --- Subcategory Logic ---
    if (subcategory) {
        const cleanSub = String(subcategory).trim();
        query.subcategory = { $regex: new RegExp(cleanSub, "i") };
    }

    // --- Search Logic ---
    if (search) {
       query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
       ];
    }

    
    const totalProducts = await Product.countDocuments(query);

   
    let productQuery = Product.find(query)
        .populate("category", "name")
        .skip(skip)   
        .limit(limit); 

    // Sorting
    if (sortBy === "newest") productQuery = productQuery.sort({ createdAt: -1 });
    else if (sortBy === "price_low" || sortBy === "price_asc") productQuery = productQuery.sort({ salePrice: 1 });
    else if (sortBy === "price_high" || sortBy === "price_desc") productQuery = productQuery.sort({ salePrice: -1 });

    const products = await productQuery;
    
    // Total pages calculation
    const totalPages = Math.ceil(totalProducts / limit);

    //  STEP 3: Response structure change karo
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
    const { price, discount, stock,subcategory,...otherData } = req.body;

    
    const updatePayload: any = { ...otherData };

   
    if (stock !== undefined) updatePayload.stock = Number(stock);
    if (subcategory !== undefined) updatePayload.subcategory = subcategory;

    // Price & Discount Logic (Automatic Calculation)
    if (price !== undefined || discount !== undefined) {
      const numPrice = price !== undefined ? Number(price) : undefined;
      const numDiscount = discount !== undefined ? Number(discount) : 0;

      if (numPrice !== undefined) updatePayload.price = numPrice;
      updatePayload.discount = numDiscount;

     
      if (numPrice !== undefined) {
        if (numDiscount > 0) {
          updatePayload.salePrice = Math.round(numPrice - (numPrice * numDiscount / 100));
        } else {
          updatePayload.salePrice = numPrice;
        }
      }
    }

    // 3. Image Handling 
    
    if (req.files) {
        const files = req.files as Express.Multer.File[];
        const newImageUrls: string[] = [];
        
        for (const file of files) {
            
            // const url = await uploadToImageKit(file);
            // newImageUrls.push(url);
        }

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