import { Request, Response } from 'express';
import * as productService from '../services/product.service';

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
    res.status(500).json({ message: error.message });
  }
};

// 2. Get All Products (With Filters)
export const getProductsHandler = async (req: Request, res: Response) => {
  try {
    // Pass query params (category, price, fabric, etc.) to service
    const products = await productService.listProducts(req.query);
    res.status(200).json({
      count: products.length,
      products
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Single Product
export const getProductByIdHandler = async (req: Request, res: Response) => {
  try {
    const product = await productService.getProduct(req.params.id);
    res.status(200).json(product);
  } catch (error: any) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(500).json({ message: error.message });
  }
};