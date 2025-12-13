import * as cartRepo from '../repositories/cart.repository';
import * as productRepo from '../repositories/product.repository';

export const getCart = async (userId: string) => {
  let cart = await cartRepo.findCartByUserId(userId);
  if (!cart) {
    cart = await cartRepo.createCart(userId);
  }
  return cart;
};

export const addItemToCart = async (userId: string, productId: string, quantity: number) => {
  // 1. Get or Create Cart
  let cart = await getCart(userId);

  // 2. Validate Product & Stock
  const product = await productRepo.findProductById(productId);
  if (!product) throw new Error('Product not found');
  if (product.stock < quantity) throw new Error('Insufficient stock');

  // 3. Check if item already exists in cart
  const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);

  if (itemIndex > -1) {
    // Product exists in cart, update quantity
    cart.items[itemIndex].quantity += quantity;
  } else {
    // Product does not exist in cart, push new item
    cart.items.push({ product: product._id as any, quantity });
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
      // If quantity is 0, remove the item
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

  // Filter out the item to remove it
  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  
  return await cartRepo.saveCart(cart);
};

export const clearCart = async (userId: string) => {
  const cart = await cartRepo.findCartByUserId(userId);
  if (cart) {
    cart.items = []; // Empty the array
    await cartRepo.saveCart(cart);
  }
};