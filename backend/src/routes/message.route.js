import express from "express";
import { getMessages, getUserForSidebar, sendMessage, setUserForSidebar } from "../controllers/message.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/sideBar", protectedRoute, getUserForSidebar);
router.post("/sideBar", protectedRoute, setUserForSidebar);
router.get("/:id", protectedRoute, getMessages);
router.post("/send/:id", protectedRoute, sendMessage);

export default router;