import { logger } from '../utils/logger';
import * as productRepo from '../repositories/product.repository';
import Category from '../models/category.model';
import { IProduct } from '../models/product.model';

export const addProduct = async (data: Partial<IProduct>) => {
  try {
    // Business Logic: Verify category exists before adding product
    // (Mongoose does this via 'ref', but we can be explicit if needed)
    return await productRepo.createProduct(data);
  } catch (error) {
    logger.error(error, "Error adding product");
    throw error;
  }
};

export const getProduct = async (id: string) => {
  try {
    const product = await productRepo.findProductById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  } catch (error) {
    logger.error(error, "Error getting product");
    throw error;
  }
};

export const listProducts = async (queryParams: any) => {
  try {
    const { category, min, max, fabric, color, sortBy } = queryParams;

    const filters: any = {};

    // 1. Resolve Category Name to ID (if user sends "Saree" instead of ID)
    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        filters.category = categoryDoc._id;
      } else {
        // If category not found, return empty array or throw error as per business logic
        return [];
      }
    }

    // 2. Parse Price Range
    if (min) filters.minPrice = Number(min);
    if (max) filters.maxPrice = Number(max);

    // 3. Text Filters
    if (fabric) filters.fabric = fabric;
    if (color) filters.color = color;

    // 4. Sort Logic
    let sort = { createdAt: -1 }; // Default: Newest first
    if (sortBy === 'price_asc') sort = { price: 1 } as any;
    if (sortBy === 'price_desc') sort = { price: -1 } as any;

    return await productRepo.findAllProducts(filters, sort);
  } catch (error) {
    logger.error(error, "Error listing products");
    throw error;
  }
};

export const removeProduct = async (id: string) => {
  try {
    const deletedProduct = await productRepo.deleteProductById(id);
    if (!deletedProduct) {
      throw new Error('Product not found');
    }
    return deletedProduct;
  } catch (error) {
    logger.error(error, "Error removing product");
    throw error;
  }
};

export const updateProductDetails = async (id: string, data: Partial<IProduct>) => {
  try {
    const updatedProduct = await productRepo.updateProductById(id, data);
    if (!updatedProduct) {
      throw new Error('Product not found');
    }
    return updatedProduct;
  } catch (error) {
    logger.error(error, "Error updating product details");
    throw error;
  }
};

