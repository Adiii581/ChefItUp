import express from "express";
import cors from "cors";
import { config } from "dotenv";
import connectMongo from "./db/mongo.js";
import authRoutes from "./routes/authRoute.js";
config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${Number(port)}`);
});

connectMongo();
