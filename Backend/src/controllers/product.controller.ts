import { logger } from '../utils/logger';
import { Request, Response } from 'express';
import * as productService from '../services/product.service';
import Product from '../models/product.model';
import  Category  from '../models/category.model'; 
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';

// 1. Create Product (Admin Only)
export const createProductHandler = async (req: Request, res: Response) => {
  try {
    // Validated data is in req.body
    const product = await productService.addProduct(req.body);
    res.status(201).json({
      message: "Product created successfully",
      product
    });
  } catch (error: any) {
    logger.error(error, "Error creating product");
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. Get All Products (With Filters)
export const getProductsHandler = asyncHandler(async (req: Request, res: Response) => {
    const { category, sortBy, search } = req.query;

    let query: any = {};

    // 1. Handle Category Filter (The Fix)
    if (category) {
        // Find the category document that matches the name (case-insensitive)
        const categoryDoc = await Category.findOne({ 
            name: { $regex: new RegExp(`^${category}$`, 'i') } 
        });

        if (categoryDoc) {
            // If category found, filter products by this Category ID
            query.category = categoryDoc._id;
        } else {
            // If category name doesn't exist, return empty list immediately
            return res.status(200).json(
                new ApiResponse(200, [], "No products found for this category")
            );
        }
    }

    // 2. Handle Search (Optional but good to have)
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    // 3. Build the Product Query
    let productQuery = Product.find(query).populate('category', 'name');

    // 4. Handle Sorting
    if (sortBy === 'newest') {
        productQuery = productQuery.sort({ createdAt: -1 });
    } else if (sortBy === 'price_low') {
        productQuery = productQuery.sort({ price: 1 });
    } else if (sortBy === 'price_high') {
        productQuery = productQuery.sort({ price: -1 });
    }

    const products = await productQuery;

    res.status(200).json(
        new ApiResponse(200, products, "Products fetched successfully")
    );
});

// 3. Get Single Product
export const getProductByIdHandler = async (req: Request, res: Response) => {
  try {
    const product = await productService.getProduct(req.params.id);
    res.status(200).json(product);
  } catch (error: any) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ message: "Product not found" });
    }
    logger.error(error, "Error creating product");
    res.status(500).json({ message: "Server Error" });
  }
};

// 4. Delete Product (Admin Only)
export const deleteProductHandler = async (req: Request, res: Response) => {
  try {
    await productService.removeProduct(req.params.id);
    res.status(200).json({
      message: "Product deleted successfully"
    });
  } catch (error: any) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ message: "Product not found" });
    }
    logger.error(error, "Error creating product");
    res.status(500).json({ message: "Server Error" });
  }
};

// 5. Update Product (Admin Only)
export const updateProductHandler = async (req: Request, res: Response) => {
  try {
    // req.body me wo naya data hai jo frontend se aaya hai (pre-filled + edited)
    const product = await productService.updateProductDetails(req.params.id, req.body);
    res.status(200).json({
      message: "Product updated successfully",
      product
    });
  } catch (error: any) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ message: "Product not found" });
    }
    logger.error(error, "Error creating product");
    res.status(500).json({ message: "Server Error" });
  }
};