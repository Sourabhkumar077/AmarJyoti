import { logger } from '../utils/logger';
import mongoose from 'mongoose';
import * as cartRepo from '../repositories/cart.repository';
import * as productRepo from '../repositories/product.repository';
import Cart from '../models/cart.model'; 

export const getCart = async (userId: string) => {
  try {
    let cart = await cartRepo.findCartByUserId(userId);
    if (!cart) {
      cart = await cartRepo.createCart(userId);
    }
    return cart;
  } catch (error) {
    logger.error(error, "Error getting cart");
    throw error;
  }
};

export const addItemToCart = async (userId: string, productId: string, quantity: number) => {
  try {
    let cart = await getCart(userId);

    const product = await productRepo.findProductById(productId);
    if (!product) throw new Error('Product not found');
    if (product.stock < quantity) throw new Error('Insufficient stock');

    // Robust check for existing item
    const itemIndex = cart.items.findIndex(item => {
      const itemPId = item.product
        ? (item.product as any)._id 
          ? (item.product as any)._id.toString() 
          : item.product.toString()
        : undefined; // Handle null product
      return itemPId === productId;
    });

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: product._id, quantity } as any);
    }

    return await cartRepo.saveCart(cart);
  } catch (error) {
    logger.error(error, "Error adding item to cart");
    throw error;
  }
};

export const updateItemQuantity = async (userId: string, productId: string, quantity: number) => {
  try {
    const cart = await cartRepo.findCartByUserId(userId);
    if (!cart) throw new Error('Cart not found');

    const itemIndex = cart.items.findIndex(item => {
      const itemPId = item.product
        ? (item.product as any)._id 
          ? (item.product as any)._id.toString() 
          : item.product.toString()
        : undefined; // Handle null product
      return itemPId === productId;
    });

    if (itemIndex > -1) {
      if (quantity > 0) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        cart.items.splice(itemIndex, 1);
      }
      return await cartRepo.saveCart(cart);
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

    // We check if 'item.product' is an Object (Populated) or String (ID)
    cart.items = cart.items.filter(item => {
      const itemProductId = item.product
        ? (item.product as any)._id 
          ? (item.product as any)._id.toString()   // If Populated
          : item.product.toString()                // If String ID
        : undefined; // Handle null product
        
      // Keep item ONLY if IDs do NOT match
      return itemProductId !== productId;
    });
    
    return await cartRepo.saveCart(cart);
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
      cart.items.forEach((item: any) => {
        // Robust ID extraction here too
        const pId = item.product._id ? item.product._id.toString() : item.product.toString();
        const currentQty = productMap.get(pId) || 0;
        productMap.set(pId, currentQty + item.quantity);
      });
    }

    guestItems.forEach((item) => {
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

    return await cart.populate('items.product');
  } catch (error) {
    logger.error(error, "Error merging carts");
    throw error;
  }
};