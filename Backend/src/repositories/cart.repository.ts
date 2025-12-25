import Cart, { ICart } from '../models/cart.model';

export const findCartByUserId = async (userId: string): Promise<ICart | null> => {
  return await Cart.findOne({ user: userId })
    .populate('items.product', 'name price images stock'); // Populate product details for display
};

export const createCart = async (userId: string): Promise<ICart> => {
  const newCart = await Cart.create({ user: userId, items: [] });
  return newCart.populate('items.product', 'name price images stock');
};

// We don't need a specific "updateItem" function here because Mongoose
// allows us to manipulate the document object in the Service and just call .save()
export const saveCart = async (cart: ICart): Promise<ICart> => {
  const savedCart = await cart.save();
  return savedCart.populate('items.product', 'name price images stock');
};