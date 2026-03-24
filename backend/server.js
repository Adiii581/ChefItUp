import express from "express";
import { config } from "dotenv";
import connectMongo from "./db/mongo.js";
import authRoutes from "./routes/authRoute.js";
import recipeRoutes from "./routes/recipeRoutes.js"
config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/auth", authRoutes);
app.use("/api", recipeRoutes)

app.listen(port, () => {
  console.log(`Example app listening on port ${Number(port)}`);
});

connectMongo();
