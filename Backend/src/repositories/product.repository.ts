import { logger } from '../utils/logger';
import Product, { IProduct } from '../models/product.model';

// Interface for Filter Arguments
interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  fabric?: string;
  color?: string;
}

export const createProduct = async (data: Partial<IProduct>): Promise<IProduct> => {
  try {
    return await Product.create(data);
  } catch (error) {
    logger.error(error, "Error creating product in repository");
    throw error;
  }
};

export const findProductById = async (id: string): Promise<IProduct | null> => {
  try {
    return await Product.findById(id).populate('category', 'name');
  } catch (error) {
    logger.error(error, `Error finding product by ID: ${id} in repository`);
    throw error;
  }
};

export const findAllProducts = async (filters: ProductFilters, sort: any = { createdAt: -1 }) => {
  try {
    const query: any = {};

    // Build Dynamic Query
    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.fabric) {
      query.fabric = { $regex: new RegExp(filters.fabric, 'i') }; // Case-insensitive partial match
    }

    if (filters.color) {
      query.colors = { $in: [filters.color] }; // Matches if color is in the array
    }

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    // Execute Query with Pagination (Default limit 50 for now)
    return await Product.find(query)
      .sort(sort)
      .populate('category', 'name')
      .limit(50);
  } catch (error) {
    logger.error(error, "Error finding all products in repository");
    throw error;
  }
};

export const deleteProductById = async (id: string): Promise<IProduct | null> => {
  try {
    return await Product.findByIdAndDelete(id);
  } catch (error) {
    logger.error(error, `Error deleting product by ID: ${id} in repository`);
    throw error;
  }
};

export const updateProductById = async (id: string, data: Partial<IProduct>): Promise<IProduct | null> => {
  try {
    return await Product.findByIdAndUpdate(id, data, { new: true });
  } catch (error) {
    logger.error(error, `Error updating product by ID: ${id} in repository`);
    throw error;
  }
};