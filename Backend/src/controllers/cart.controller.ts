import { logger } from '../utils/logger';
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
    logger.error(error, "Error getting cart");
    res.status(500).json({ message: "Server Error" });
  }
};

export const addToCartHandler = async (req: Request, res: Response) => {
  try {
    
    const { productId, quantity, size,color } = req.body;
    
    //  Pass 'size' to service
    const cart = await cartService.addItemToCart(getUserId(req), productId, quantity, size,color);
    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error: any) {
    if (error.message === 'Insufficient stock') {
      return res.status(409).json({ message: error.message });
    }
    if (error.message === 'Product not found') {
      return res.status(404).json({ message: error.message });
    }
    logger.error(error, "Error adding to cart");
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateCartItemHandler = async (req: Request, res: Response) => {
  try {
    const productId = req.params.itemId;
    const { quantity } = req.body; 
    
    // Note: If you want to update quantity for a specific SIZE, 
    // you might need to pass size in body too. For now, we assume simple ID match or 
    // you can enhance this later. 
    // Ideally: updateItemQuantity(userId, productId, quantity, size)
    const cart = await cartService.updateItemQuantity(getUserId(req), productId, quantity);
    res.status(200).json({ message: "Cart updated", cart });
  } catch (error: any) {
    logger.error(error, "Error updating cart");
    res.status(500).json({ message: "Server Error" });
  }
};

export const removeCartItemHandler = async (req: Request, res: Response) => {
  try {
    const productId = req.params.itemId;
    
    const size = req.query.size as string;

   
    const cart = await cartService.removeItem(getUserId(req), productId, size);
    res.status(200).json({ message: "Item removed", cart });
  } catch (error: any) {
    logger.error(error, "Error removing item");
    res.status(500).json({ message: "Server Error" });
  }
};

// merge guest & logged user cart info
export const mergeCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id.toString();
    const { items } = req.body; // Expecting array of { productId, quantity, size? }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid items format" });
    }

    const updatedCart = await cartService.mergeCarts(userId, items);
    res.status(200).json(updatedCart);
  } catch (error: any) {
    logger.error(error, "Error merging carts");
    res.status(500).json({ message: "Server Error" });
  }
};