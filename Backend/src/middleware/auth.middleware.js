import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import jwt from "jsonwebtoken";


export const protectRoute = async (req, res, next) => {
  try {
    // Retrieve the JWT token from cookies
    const token = req.cookies.jwt;

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from the database using the ID in the token
    const user = await User.findById(decoded.userId).select("-password"); // Exclude password field

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    // Attach user to the request object
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);

    // Handle token expiration or other errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please log in again" });
    }

    res.status(401).json({ message: "Not authorized, token verification failed" });
  }
};

// User signup
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    // Save user and generate JWT token
    await newUser.save();
    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.error("Error in signup:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// User login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// User logout
export const logout = (req, res) => {
  try {
    // Clear JWT cookie
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0), // Expire immediately
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfile:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Check if user is authenticated
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user); // `req.user` is populated by `protectRoute` middleware
  } catch (error) {
    console.error("Error in checkAuth:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
