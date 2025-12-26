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
    const product = await productService.addProduct(req.body);
    // Use ApiResponse
    res
      .status(201)
      .json(new ApiResponse(201, product, "Product created successfully"));
  } catch (error: any) {
    logger.error(error, "Error creating product");
    res.status(500).json(new ApiResponse(500, null, "Server Error"));
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
    const product = await productService.updateProductDetails(
      req.params.id,
      req.body
    );
    // Use ApiResponse
    res
      .status(200)
      .json(new ApiResponse(200, product, "Product updated successfully"));
  } catch (error: any) {
    if (error.message === "Product not found") {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Product not found"));
    }
    logger.error(error, "Error updating product");
    res.status(500).json(new ApiResponse(500, null, "Server Error"));
  }
};
