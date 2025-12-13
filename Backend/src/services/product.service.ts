import * as productRepo from '../repositories/product.repository';
import Category from '../models/category.model';
import { IProduct } from '../models/product.model';

export const addProduct = async (data: Partial<IProduct>) => {
  // Business Logic: Verify category exists before adding product
  // (Mongoose does this via 'ref', but we can be explicit if needed)
  return await productRepo.createProduct(data);
};

export const getProduct = async (id: string) => {
  const product = await productRepo.findProductById(id);
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

export const listProducts = async (queryParams: any) => {
  const { category, min, max, fabric, color, sortBy } = queryParams;

  const filters: any = {};

  // 1. Resolve Category Name to ID (if user sends "Saree" instead of ID)
  if (category) {
    const categoryDoc = await Category.findOne({ name: category });
    if (categoryDoc) {
      filters.category = categoryDoc._id;
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
};