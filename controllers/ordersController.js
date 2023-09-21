const Order = require("../models/Order");

module.exports = {
  getUserOrders: async (req, res) => {
    const userId = req.user.id;

    console.log("THIS IS userID: ", userId);

    try {
      const userOrders = await Order.find({ userId })
        .populate({
          path: "productId",
          select: "-description -product_location",
        })
        .exec();

      console.log("THIS IS userOrders: ", userOrders);

      res.status(200).json(userOrders);
    } catch (error) {
      res.status(500).json(error);
    }
  },
};
