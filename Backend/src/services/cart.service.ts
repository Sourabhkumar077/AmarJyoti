import { logger } from '../utils/logger';
import mongoose from 'mongoose';
import Cart from '../models/cart.model'; 
import * as productRepo from '../repositories/product.repository';

// Helper: Standard Population
const populateCart = async (cart: any) => {
  if (!cart) return null;
  return await cart.populate({
    path: 'items.product',
    select: 'name price images stock slug category colors sizes'
  });
};

// 1. Find Cart (User > Guest)
export const getCart = async (userId?: string, guestId?: string) => {
  try {
    if (userId) {
      let cart = await Cart.findOne({ user: userId });
      return await populateCart(cart);
    }
    
    if (guestId) {
      const cart = await Cart.findOne({ guestId, user: null });
      return await populateCart(cart);
    }

    return null;
  } catch (error) {
    logger.error(error, "Error getting cart");
    throw error;
  }
};

// 2. Add Item
export const addItemToCart = async (
  userId: string | undefined, 
  guestId: string | undefined, 
  data: { productId: string, quantity: number, size?: string, color?: string }
) => {
  const { productId, quantity, size, color } = data;

  const product = await productRepo.findProductById(productId);
  if (!product) throw new Error('Product not found');
  if (product.stock < quantity) throw new Error('Insufficient stock');

  let cart;

  // Find existing cart
  if (userId) {
    cart = await Cart.findOne({ user: userId });
  } else if (guestId) {
    cart = await Cart.findOne({ guestId, user: null });
  }

  // Create if not exists
  if (!cart) {
    cart = await Cart.create({
      user: userId || undefined,
      guestId: userId ? undefined : guestId, // Only set guestId if NOT a user
      items: []
    });
  }

  // Check for existing item match
  const itemIndex = cart.items.findIndex((item) => {
    const pId = (item.product as any)._id?.toString() || item.product.toString();
    const isSameProduct = pId === productId;
    const isSameSize = (item.size === size) || (!item.size && !size);
    const isSameColor = (item.color === color) || (!item.color && !color);
    return isSameProduct && isSameSize && isSameColor;
  });

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ 
      product: product._id, 
      quantity, 
      size, 
      color,
      priceAtAdd: product.price 
    } as any);
  }

  await cart.save();
  return await populateCart(cart);
};

// 3. Remove Item
export const removeItem = async (userId: string | undefined, guestId: string | undefined, itemId: string, size?: string) => {
  let cart;
  if (userId) cart = await Cart.findOne({ user: userId });
  else if (guestId) cart = await Cart.findOne({ guestId, user: null });

  if (!cart) throw new Error("Cart not found");

  // Filter out the specific item
  cart.items = cart.items.filter((item) => {
    const pId = (item.product as any)._id?.toString() || item.product.toString();
    if (pId === itemId) {
       const isSameSize = (item.size === size) || (!item.size && !size);
       if (isSameSize) return false; // Remove
    }
    return true; // Keep
  });

  await cart.save();
  return await populateCart(cart);
};

// 4. Update Quantity
export const updateItemQuantity = async (userId: string | undefined, guestId: string | undefined, itemId: string, quantity: number) => {
  let cart;
  if (userId) cart = await Cart.findOne({ user: userId });
  else if (guestId) cart = await Cart.findOne({ guestId, user: null });

  if (!cart) throw new Error("Cart not found");

  const itemIndex = cart.items.findIndex(item => {
    const pId = (item.product as any)._id?.toString() || item.product.toString();
    return pId === itemId; 
  });

  if (itemIndex > -1) {
    if (quantity > 0) cart.items[itemIndex].quantity = quantity;
    else cart.items.splice(itemIndex, 1);
    
    await cart.save();
    return await populateCart(cart);
  } 
  
  throw new Error("Item not found");
};

// 5. MERGE LOGIC
export const mergeGuestCart = async (userId: string, guestId: string) => {
  if (!guestId) return;

  const guestCart = await Cart.findOne({ guestId, user: null });
  const userCart = await Cart.findOne({ user: userId });

  if (!guestCart) return userCart;

  if (!userCart) {
    // Simple takeover
    guestCart.user = new mongoose.Types.ObjectId(userId);
    guestCart.guestId = undefined;
    await guestCart.save();
    return guestCart;
  }

  // Complex Merge
  const productMap = new Map<string, number>();
  const getKey = (pId: string, s?: string, c?: string) => `${pId}::${s || ''}::${c || ''}`;

  // Helper to process items
  const processItems = (items: any[]) => {
    items.forEach(item => {
      const pId = (item.product as any)._id?.toString() || item.product.toString();
      const key = getKey(pId, item.size, item.color);
      const qty = productMap.get(key) || 0;
      productMap.set(key, qty + item.quantity);
    });
  };

  processItems(userCart.items);
  processItems(guestCart.items);

  const mergedItems = [];
  for (const [key, qty] of productMap.entries()) {
    const [pId, size, color] = key.split('::');
    mergedItems.push({
      product: new mongoose.Types.ObjectId(pId),
      quantity: qty,
      size: size || undefined,
      color: color || undefined
    });
  }

  userCart.items = mergedItems as any;
  await userCart.save();
  
  // Cleanup Guest Cart
  await Cart.findByIdAndDelete(guestCart._id);
  
  return userCart;
};

// 6. CLEAR CART (Restored)
export const clearCart = async (userId: string) => {
  try {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return cart;
  } catch (error) {
    logger.error(error, "Error clearing cart");
    throw error;
  }
};