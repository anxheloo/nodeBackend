const User = require("../models/User");

const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

module.exports = {
  createUser: async (req, res) => {
    try {
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(
          req.body.password,
          process.env.SECRET
        ).toString(),
        location: req.body.location,
      });
      await newUser.save();
      res.status(201).json({ message: "user created successfully" });
      // res.status(201).json("user created successfully");
    } catch (error) {
      console.error("Error creating user: ", error);
      res.status(500).json({ message: error });
      // res.status(500).json("failed to create the user");
    }
  },

  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res.status(401).json("Wrong credentials, provide a valid email");
      }

      const decryptedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.SECRET
      );
      const decryptedpass = decryptedPassword.toString(CryptoJS.enc.Utf8);

      if (decryptedpass !== req.body.password) {
        return res.status(401).json("Wrong password");
      }

      const userToken = jwt.sign(
        {
          id: user.id,
        },
        process.env.SECRET,
        { expiresIn: "7d" }
      );

      const { password, __v, createdAt, updatedAt, ...userData } = user._doc;

      res.status(200).json({ ...userData, token: userToken });
    } catch (error) {
      res.status(500).json({ message: error });
      console.log(error);
    }
  },
};
