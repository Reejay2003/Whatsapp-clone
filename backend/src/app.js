import dotenv from "dotenv";
dotenv.config();
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import express from 'express';

const app = express();

const port = process.env.PORT;

// Middleware setup (fixed order and removed duplicate)
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}));

app.use(express.json({ limit: '10mb' })); // Only this one - with limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectDB();
});