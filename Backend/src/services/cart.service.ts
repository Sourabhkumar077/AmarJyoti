import { logger } from '../utils/logger';
import mongoose from 'mongoose';
import * as cartRepo from '../repositories/cart.repository';
import * as productRepo from '../repositories/product.repository';
import Cart from '../models/cart.model'; 

// ✅ Helper: Always populate product details before sending to Frontend
const populateCart = async (cart: any) => {
  if (!cart) return null;
  return await cart.populate({
    path: 'items.product',
    select: 'name price images stock slug category' // Only fetch what we need
  });
};


// This removes items where the product has been deleted from the database
const sanitizeCart = async (cart: any) => {
  try {
    if (!cart || !cart.items) return cart;

    const validItems = cart.items.filter((item: any) => {
      if (!item.product) return false;
      if (typeof item.product === 'object' && !item.product._id) return false;
      return true;
    });

    if (validItems.length !== cart.items.length) {
      // logger.warn(`Sanitizing cart...`); // Optional log
      cart.items = validItems;
      // We explicitly save here. If it fails due to race condition, 
      // the catch block handles it silently.
      await cartRepo.saveCart(cart); 
    }
  } catch (error) {
  }
  
  return cart;
};

export const getCart = async (userId: string) => {
  try {
    let cart = await cartRepo.findCartByUserId(userId);
    
    if (!cart) {
      cart = await cartRepo.createCart(userId);
    } else {
      // ✅ Check and fix corrupted data on every fetch
      await sanitizeCart(cart);
    }

    return await populateCart(cart);
  } catch (error) {
    logger.error(error, "Error getting cart");
    throw error;
  }
};

export const addItemToCart = async (userId: string, productId: string, quantity: number) => {
  try {
    let cart = await cartRepo.findCartByUserId(userId);
    if (!cart) {
      cart = await cartRepo.createCart(userId);
    }
    
    // ✅ Sanitize first so we don't crash when adding to a corrupt cart
    await sanitizeCart(cart);

    const product = await productRepo.findProductById(productId);
    if (!product) throw new Error('Product not found');
    if (product.stock < quantity) throw new Error('Insufficient stock');

    const itemIndex = cart.items.findIndex(item => {
      const itemPId = item.product
        ? (item.product as any)._id 
          ? (item.product as any)._id.toString() 
          : item.product.toString()
        : undefined; 
      return itemPId === productId;
    });

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Cast to any to avoid TS issues during push, validated above
      cart.items.push({ product: product._id, quantity } as any);
    }

    await cartRepo.saveCart(cart);
    
    // ✅ CRITICAL: Return populated cart so frontend updates immediately
    return await populateCart(cart);
  } catch (error) {
    logger.error(error, "Error adding item to cart");
    throw error;
  }
};

export const updateItemQuantity = async (userId: string, productId: string, quantity: number) => {
  try {
    const cart = await cartRepo.findCartByUserId(userId);
    if (!cart) throw new Error('Cart not found');

    // ✅ Sanitize before updating
    await sanitizeCart(cart);

    const itemIndex = cart.items.findIndex(item => {
      const itemPId = item.product
        ? (item.product as any)._id 
          ? (item.product as any)._id.toString() 
          : item.product.toString()
        : undefined; 
      return itemPId === productId;
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
    logger.error(error, "Error updating item quantity in cart");
    throw error;
  }
};
 
export const removeItem = async (userId: string, productId: string) => {
  try {
    const cart = await cartRepo.findCartByUserId(userId);
    if (!cart) throw new Error('Cart not found');

    // Filter logic to remove the specific item
    cart.items = cart.items.filter(item => {
      if (!item.product) return false; // Remove invalid entries while we are at it
      
      const itemProductId = (item.product as any)._id 
          ? (item.product as any)._id.toString()   
          : item.product.toString();
        
      return itemProductId !== productId;
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

export const mergeCarts = async (userId: string, guestItems: { productId: string, quantity: number }[]) => {
  try {
    let cart = await Cart.findOne({ user: userId });
    
    const productMap = new Map<string, number>();

    if (cart) {
      // ✅ Safe loop that skips invalid items
      cart.items.forEach((item: any) => {
        if (!item.product) return; // Skip bad data
        const pId = item.product._id ? item.product._id.toString() : item.product.toString();
        const currentQty = productMap.get(pId) || 0;
        productMap.set(pId, currentQty + item.quantity);
      });
    }

    // Merge Guest Items
    guestItems.forEach((item) => {
      if(!item.productId) return;
      const pId = item.productId;
      const currentQty = productMap.get(pId) || 0;
      productMap.set(pId, currentQty + item.quantity);
    });

    const mergedItems = Array.from(productMap.entries()).map(([productId, quantity]) => ({
      product: new mongoose.Types.ObjectId(productId),
      quantity: quantity
    }));

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