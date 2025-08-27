import express from "express";
import { checkAuth, login, logout, signup, updateprofile, setDhPublicKey, getDhPublicKey } from "../controllers/auth.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/updateprofile",protectedRoute, updateprofile);

router.get("/check", protectedRoute, checkAuth);
// ...
router.put("/dhkey", protectedRoute, setDhPublicKey);      // save my public key

router.get("/dhkey/:id", protectedRoute, getDhPublicKey);  // get someone else’s public key

export default router;