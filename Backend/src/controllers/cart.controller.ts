import { Request, Response } from 'express';
import * as cartService from '../services/cart.service';

// Helper to get User ID safely
const getUserId = (req: Request) => {
  if (!req.user || !req.user._id) throw new Error('User not authenticated');
  return req.user._id.toString();
};

export const getCartHandler = async (req: Request, res: Response) => {
  try {
    const cart = await cartService.getCart(getUserId(req));
    res.status(200).json(cart);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addToCartHandler = async (req: Request, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addItemToCart(getUserId(req), productId, quantity);
    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error: any) {
    if (error.message === 'Insufficient stock') {
      return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    if (error.message === 'Product not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateCartItemHandler = async (req: Request, res: Response) => {
  try {
    const productId = req.params.itemId; // We pass productId in the URL
    const { quantity } = req.body;
    
    const cart = await cartService.updateItemQuantity(getUserId(req), productId, quantity);
    res.status(200).json({ message: "Cart updated", cart });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removeCartItemHandler = async (req: Request, res: Response) => {
  try {
    const productId = req.params.itemId;
    const cart = await cartService.removeItem(getUserId(req), productId);
    res.status(200).json({ message: "Item removed", cart });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
// merge guest & logged user cart info
export const mergeCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id.toString();
    const { items } = req.body; // Expecting array of { productId, quantity }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid items format" });
    }

    const updatedCart = await cartService.mergeCarts(userId, items);
    res.status(200).json(updatedCart);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};