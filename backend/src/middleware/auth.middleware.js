const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res  
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded) {
      return res.status(401).json({ message: "Access denied. Invalid token." });
    }

    const user = await User.findOne({ _id: decoded.userId }).select(
      "-password"
    );  
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = authMiddleware;
