import mongoose from 'mongoose'; 
import * as cartRepo from '../repositories/cart.repository';
import * as productRepo from '../repositories/product.repository';
import Cart from '../models/cart.model'; 

export const getCart = async (userId: string) => {
  let cart = await cartRepo.findCartByUserId(userId);
  if (!cart) {
    cart = await cartRepo.createCart(userId);
  }
  return cart;
};

export const addItemToCart = async (userId: string, productId: string, quantity: number) => {
  let cart = await getCart(userId);

  const product = await productRepo.findProductById(productId);
  if (!product) throw new Error('Product not found');
  if (product.stock < quantity) throw new Error('Insufficient stock');

  const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    // ✅ Fix: Cast to any to avoid TS error, or convert to ObjectId if strict
    cart.items.push({ product: product._id, quantity } as any);
  }

  return await cartRepo.saveCart(cart);
};

export const updateItemQuantity = async (userId: string, productId: string, quantity: number) => {
  const cart = await cartRepo.findCartByUserId(userId);
  if (!cart) throw new Error('Cart not found');

  const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);

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
};

export const removeItem = async (userId: string, productId: string) => {
  const cart = await cartRepo.findCartByUserId(userId);
  if (!cart) throw new Error('Cart not found');

  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  
  return await cartRepo.saveCart(cart);
};

export const clearCart = async (userId: string) => {
  const cart = await cartRepo.findCartByUserId(userId);
  if (cart) {
    cart.items = [];
    await cartRepo.saveCart(cart);
  }
};

// Merge function
export const mergeCarts = async (userId: string, guestItems: { productId: string, quantity: number }[]) => {
  let cart = await Cart.findOne({ user: userId });

  // 1. Ek Map banao jisme hum ProductID -> Quantity store karenge
  // Map automatically duplicates ko rokta hai
  const productMap = new Map<string, number>();

  
  if (cart) {
    cart.items.forEach((item: any) => {
      const pId = item.product.toString(); 
      const currentQty = productMap.get(pId) || 0;
      productMap.set(pId, currentQty + item.quantity);
    });
  }

  //  Ab Guest Items ko bhi usi Map me merge karo
  guestItems.forEach((item) => {
    const pId = item.productId;
    const currentQty = productMap.get(pId) || 0;
    productMap.set(pId, currentQty + item.quantity);
  });

  //  Ab Map se wapis Array banao
  const mergedItems = Array.from(productMap.entries()).map(([productId, quantity]) => ({
    product: new mongoose.Types.ObjectId(productId),
    quantity: quantity
  }));

  // 4. Cart Save k
  if (cart) {
    cart.items = mergedItems as any; //put new ,remove old
    await cart.save();
  } else {
    cart = await Cart.create({
      user: userId,
      items: mergedItems
    });
  }

  return await cart.populate('items.product');
};