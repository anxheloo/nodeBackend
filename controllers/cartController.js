const Product = require("../models/Products");
const Cart = require("../models/Cart");

module.exports = {
  addToCart: async (req, res) => {
    const userId = req.user.id;

    const { cartItem, quantity } = req.body;

    try {
      const cart = await Cart.findOne({ userId });

      if (cart) {
        const existingProduct = cart.products.find(
          (product) => product.cartItem.toString() === cartItem
        );

        if (existingProduct) {
          existingProduct.quantity += 1;
        } else {
          cart.products.push({ cartItem, quantity });
        }

        await cart.save();
        res.status(200).json("Product Added!");
      } else {
        const newCart = new Cart({
          userId,
          products: [
            {
              cartItem,
              quantity: quantity,
            },
          ],
        });

        await newCart.save();
        res.status(200).json("Product added to cart");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },

  getCart: async (req, res) => {
    // const userId = req.params.id;

    const userId = req.user.id;

    try {
      const cart = await Cart.find({ userId: userId }).populate(
        "products.cartItem",
        "_id title supplier price imageUrl"
      );
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json(error);
      // console.log(error);
    }
  },

  deleteCartItem: async (req, res) => {
    const cartItemId = req.params.cartItemId;

    try {
      const updatedCart = await Cart.findOneAndUpdate(
        { "products._id": cartItemId },
        { $pull: { products: { _id: cartItemId } } },
        { new: true }
      );

      if (!updatedCart) {
        return res.status(404).json("Cart item not found");
      }

      res.status(200).json(updatedCart);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  decrementCartQuantity: async (req, res) => {
    const { userId, cartItem } = req.body;

    try {
      // Find the user's cart by userId
      const cart = await Cart.findOne({ userId });

      // If the cart doesn't exist, return a 404 error
      if (!cart) {
        return res.status(404).json("Cart not found");
      }

      // Find the existing product in the cart
      const existingProduct = cart.products.find(
        (product) => product.cartItem.toString() === cartItem
      );

      // If the product doesn't exist in the cart, return a 404 error
      if (!existingProduct) {
        return res.status(404).json("Product not found");
      }

      // Check if the quantity of the existing product is 1
      if (existingProduct.quantity === 1) {
        // If the quantity is 1, remove the product from the cart
        cart.products = cart.products.filter(
          (product) => product.cartItem.toString() !== cartItem
        );
      } else {
        // If the quantity is greater than 1, decrement the quantity by 1
        existingProduct.quantity -= 1;
      }

      // Save the updated cart
      await cart.save();

      // Check if the quantity reached 0 (product is completely removed)
      if (existingProduct.quantity === 0) {
        // If the quantity is 0, remove the product from the cart using $pull
        await Cart.updateOne({ userId }, { $pull: { products: { cartItem } } });
      }

      // Respond with a success message
      res.status(200).json("Product updated");
    } catch (error) {
      // Handle any errors and respond with a 500 status code
      res.status(500).json(error);
      console.log(error);
    }
  },
};
