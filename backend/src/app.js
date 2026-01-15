import dotenv from "dotenv";
dotenv.config();
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import express from 'express';
import {app, server, io} from './lib/socket.js'
import path from "path";

const port = process.env.PORT;
const __dirname=path.resolve()

// Middleware setup (fixed order and removed duplicate)
app.use(cors({
  origin: true, //Temporary: allows any website to connect
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Only this one - with limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectDB();
});