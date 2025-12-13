import Cart, { ICart } from '../models/cart.model';

export const findCartByUserId = async (userId: string): Promise<ICart | null> => {
  return await Cart.findOne({ user: userId })
    .populate('items.product', 'name price images stock'); // Populate product details for display
};

export const createCart = async (userId: string): Promise<ICart> => {
  return await Cart.create({ user: userId, items: [] });
};

// We don't need a specific "updateItem" function here because Mongoose
// allows us to manipulate the document object in the Service and just call .save()
export const saveCart = async (cart: ICart): Promise<ICart> => {
  return await cart.save();
};