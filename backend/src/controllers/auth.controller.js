const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const generateToken = require("../lib/token");

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    console.log(existingUser);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,  
      password: hashedPassword,
    });

    await newUser.save();
    if (newUser) {
      generateToken(newUser._id, res);
    }

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      profilePic: newUser.profilePic,
      createdAt: newUser.createdAt,
    });
  } catch (error) {
    console.log("Error in Signup Controller");
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body  ;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isUser = await bcrypt.compare(password, user.password);
    if (!isUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.log("Error in Login Controller");
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in Logout Controller");
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
  
    const filePath = `/uploads/${file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: filePath },
      { new: true }
    );

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};

const checkAuth = (req, res) => {
  try {  
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller: ", error);
    res.status(500).json({ message: "Internal Sever Error." });
  }
};

module.exports = { signup, login, logout, checkAuth, updateProfile };


