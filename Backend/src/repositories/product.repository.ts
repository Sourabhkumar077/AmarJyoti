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
  return await Product.create(data);
};

export const findProductById = async (id: string): Promise<IProduct | null> => {
  return await Product.findById(id).populate('category', 'name');
};

export const findAllProducts = async (filters: ProductFilters, sort: any = { createdAt: -1 }) => {
  const query: any = {};

  // Build Dynamic Query
  if (filters.category) {
    // We assume the service passes the Category ObjectId here, 
    // or we query by category name if we join tables. 
    // For simplicity, we'll expect the controller/service to resolve the ID or use the ID directly.
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
};

// product delete 
export const deleteProductById = async (id: string): Promise<IProduct | null> => {
  return await Product.findByIdAndDelete(id);
};

export const updateProductById = async (id: string, data: Partial<IProduct>): Promise<IProduct | null> => {
  // { new: true } return new updatted data
  return await Product.findByIdAndUpdate(id, data, { new: true });
};