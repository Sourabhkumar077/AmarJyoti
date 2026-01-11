import { logger } from '../utils/logger';
import mongoose from 'mongoose';
import * as cartRepo from '../repositories/cart.repository';
import * as productRepo from '../repositories/product.repository';
import Cart from '../models/cart.model'; 

//  Always populate product details
const populateCart = async (cart: any) => {
  if (!cart) return null;
  return await cart.populate({
    path: 'items.product',
    select: 'name price images stock slug category colors sizes'
  });
};

const sanitizeCart = async (cart: any) => {
  try {
    if (!cart || !cart.items) return cart;
    const validItems = cart.items.filter((item: any) => {
      if (!item.product) return false;
      if (typeof item.product === 'object' && !item.product._id) return false;
      return true;
    });

    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cartRepo.saveCart(cart); 
    }
  } catch (error) {}
  return cart;
};

export const getCart = async (userId: string) => {
  try {
    let cart = await cartRepo.findCartByUserId(userId);
    if (!cart) {
      cart = await cartRepo.createCart(userId);
    } else {
      await sanitizeCart(cart);
    }
    return await populateCart(cart);
  } catch (error) {
    logger.error(error, "Error getting cart");
    throw error;
  }
};


export const addItemToCart = async (userId: string, productId: string, quantity: number, size?: string,color?: string) => {
  try {
    let cart = await cartRepo.findCartByUserId(userId);
    if (!cart) cart = await cartRepo.createCart(userId);
    
    await sanitizeCart(cart);

    const product = await productRepo.findProductById(productId);
    if (!product) throw new Error('Product not found');
    if (product.stock < quantity) throw new Error('Insufficient stock');

    //  CHECK: Match Product ID AND Size
    const itemIndex = cart.items.findIndex(item => {
      const pId = (item.product as any)._id ? (item.product as any)._id.toString() : item.product.toString();
      
      const isSameProduct = pId === productId;
      // Handle optional size: matches if both are same string OR both are undefined/null
      const isSameSize = (item.size === size) || (!item.size && !size);
      const isSameColor = item.color === color || (!item.color && !color);
      
      return isSameProduct && isSameSize && isSameColor;
    });

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      //  Add new item with Size
      cart.items.push({ product: product._id, quantity, size,color } as any);
    }

    await cartRepo.saveCart(cart);
    return await populateCart(cart);
  } catch (error) {
    logger.error(error, "Error adding item to cart");
    throw error;
  }
};

//  Update Quantity (Optional: You can enhance to target specific size if needed later)
export const updateItemQuantity = async (userId: string, productId: string, quantity: number,) => {
  try {
    const cart = await cartRepo.findCartByUserId(userId);
    if (!cart) throw new Error('Cart not found');
    await sanitizeCart(cart);

    // Matches first item with productId. 
    // To support multiple sizes of same product fully in update, pass 'size' here too.
    const itemIndex = cart.items.findIndex(item => {
      const pId = (item.product as any)._id ? (item.product as any)._id.toString() : item.product.toString();
      return pId === productId;
    });

    if (itemIndex > -1) {
      if (quantity > 0) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        cart.items.splice(itemIndex, 1);
      }
      await cartRepo.saveCart(cart);
      return await populateCart(cart);
    } else {
      throw new Error('Item not found in cart');
    }
  } catch (error) {
    logger.error(error, "Error updating item quantity");
    throw error;
  }
};


export const removeItem = async (userId: string, productId: string, size?: string,color?: string) => {
  try {
    const cart = await cartRepo.findCartByUserId(userId);
    if (!cart) throw new Error('Cart not found');

    //  Filter logic: Keep items that DO NOT match (ID + Size)
    cart.items = cart.items.filter(item => {
      if (!item.product) return false;
      const pId = (item.product as any)._id ? (item.product as any)._id.toString() : item.product.toString();
        
      if (pId !== productId) return true; // Keep other products

      // If product matches, check attributes
      const matchSize = item.size === size || (!item.size && !size);
      const matchColor = item.color === color || (!item.color && !color);

      if (matchSize && matchColor) return false;
      return true;
    });
    
    await cartRepo.saveCart(cart);
    return await populateCart(cart);
  } catch (error) {
    logger.error(error, "Error removing item from cart");
    throw error;
  }
};

export const clearCart = async (userId: string) => {
  try {
    const cart = await cartRepo.findCartByUserId(userId);
    if (cart) {
      cart.items = [];
      await cartRepo.saveCart(cart);
    }
  } catch (error) {
    logger.error(error, "Error clearing cart");
    throw error;
  }
};

//  Merge Logic to respect sizes & color
export const mergeCarts = async (userId: string, guestItems: { productId: string, quantity: number, size?: string, color?: string }[]) => {
  try {
    let cart = await Cart.findOne({ user: userId });
    
    // Key format: "productId:size:color" to distinguish items
    const productMap = new Map<string, number>();
    // Key Generator: ProductID:Size:Color
    const generateKey = (pId: string, sz?: string, c?: string) => `${pId}:${sz || ''}:${c || ''}`;

    if (cart) {
      cart.items.forEach((item: any) => {
        if (!item.product) return;
        const pId = item.product._id ? item.product._id.toString() : item.product.toString();

        const key = generateKey(pId, item.size, item.color);
        
        const currentQty = productMap.get(key) || 0;
        productMap.set(key, currentQty + item.quantity);
      });
    }

    // Merge Guest Items
    guestItems.forEach((item) => {
      if(!item.productId) return;
      const key = generateKey(item.productId, item.size, item.color);
      const currentQty = productMap.get(key) || 0;
      productMap.set(key, currentQty + item.quantity);
    });

    // Reconstruct Items Array
    const mergedItems = Array.from(productMap.entries()).map(([key, quantity]) => {
      const [productId, size, color] = key.split(':');
      return {
        product: new mongoose.Types.ObjectId(productId),
        quantity: quantity,
        size: size || undefined,
        color: color || undefined
      };
    });

    if (cart) {
      cart.items = mergedItems as any;
      await cart.save();
    } else {
      cart = await Cart.create({
        user: userId,
        items: mergedItems
      });
    }

    return await populateCart(cart);
  } catch (error) {
    logger.error(error, "Error merging carts");
    throw error;
  }
};