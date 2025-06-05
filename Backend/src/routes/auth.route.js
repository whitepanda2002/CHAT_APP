import express from "express";
import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup); // Signup route
router.post("/login", login);   // Login route
router.post("/logout", logout); // Logout route

router.put("/update-profile", protectRoute, updateProfile); // Protected update-profile route 

router.get("/check", protectRoute, checkAuth); // Protected checkAuth route

export default router;
