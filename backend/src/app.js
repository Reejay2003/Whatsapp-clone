import dotenv from "dotenv";
dotenv.config();
import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";





const app = express();
const port = process.env.PORT; // fallback if .env fails

app.use(express.json()); // needed for JSON body parsing
app.use(cookieParser());
app.use(cors({
  origin:"http://localhost:5173/",
  credentials:true
}));


app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectDB();
});
