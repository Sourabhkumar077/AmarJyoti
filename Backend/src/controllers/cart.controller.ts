import { logger } from '../utils/logger';
import { Request, Response } from 'express';
import * as cartService from '../services/cart.service';

// Helper to get Identities
const getIdentities = (req: Request) => {
  const userId = req.user?._id?.toString();
  const guestId = req.headers['x-guest-id'] as string;
  return { userId, guestId };
};

export const getCartHandler = async (req: Request, res: Response) => {
  try {
    const { userId, guestId } = getIdentities(req);
    
    if (!userId && !guestId) {
      return res.status(200).json(null); // Empty cart state
    }

    const cart = await cartService.getCart(userId, guestId);
    res.status(200).json(cart);
  } catch (error: any) {
    logger.error(error, "Error getting cart");
    res.status(500).json({ message: "Server Error" });
  }
};

export const addToCartHandler = async (req: Request, res: Response) => {
  try {
    const { userId, guestId } = getIdentities(req);
    const { productId, quantity, size, color } = req.body;
    
    if (!userId && !guestId) {
      return res.status(400).json({ message: "Missing Guest ID or User Session" });
    }

    const cart = await cartService.addItemToCart(userId, guestId, {
      productId, quantity, size, color
    });
    res.status(200).json({ message: "Item added", cart });
  } catch (error: any) {
    if (error.message === 'Insufficient stock' || error.message === 'Product not found') {
      return res.status(400).json({ message: error.message });
    }
    logger.error(error, "Error adding to cart");
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateCartItemHandler = async (req: Request, res: Response) => {
  try {
    const { userId, guestId } = getIdentities(req);
    const productId = req.params.itemId;
    const { quantity } = req.body; 

    const cart = await cartService.updateItemQuantity(userId, guestId, productId, quantity);
    res.status(200).json({ message: "Cart updated", cart });
  } catch (error: any) {
    logger.error(error, "Error updating cart");
    res.status(500).json({ message: "Server Error" });
  }
};

export const removeCartItemHandler = async (req: Request, res: Response) => {
  try {
    const { userId, guestId } = getIdentities(req);
    const productId = req.params.itemId;
    const size = req.query.size as string;

    const cart = await cartService.removeItem(userId, guestId, productId, size);
    res.status(200).json({ message: "Item removed", cart });
  } catch (error: any) {
    logger.error(error, "Error removing item");
    res.status(500).json({ message: "Server Error" });
  }
};

export const mergeCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id.toString();
    const guestId = req.headers['x-guest-id'] as string;
    
    if (!guestId) return res.status(400).json({ message: "No guest cart to merge" });

    const updatedCart = await cartService.mergeGuestCart(userId, guestId);
    res.status(200).json(updatedCart);
  } catch (error: any) {
    logger.error(error, "Error merging carts");
    res.status(500).json({ message: "Server Error" });
  }
};