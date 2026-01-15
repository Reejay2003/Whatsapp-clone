import express from "express";
import {
  setKeyBackup,
  getKeyBackup,
  checkAuth,
  login,
  logout,
  signup,
  updateprofile,
  setDhPublicKey,
  getDhPublicKey
} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/updateprofile", protectedRoute, updateprofile);
router.get("/check", protectedRoute, checkAuth);

// E2EE routes
router.put("/dhkey", protectedRoute, setDhPublicKey);
router.get("/dhkey/:id", protectedRoute, getDhPublicKey);
router.put("/keybackup", protectedRoute, setKeyBackup);
router.get("/keybackup", protectedRoute, getKeyBackup);

export default router;