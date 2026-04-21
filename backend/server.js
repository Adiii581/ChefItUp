import express from "express";
import cors from "cors";
import { config } from "dotenv";
import connectMongo from "./db/mongo.js";
config();
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import recipeRoutes from "./routes/recipeRoutes.js";

const app = express();
const port = process.env.PORT || 3000;
const clientUrl = process.env.CLIENT_URL;
if (!clientUrl) {
  throw new Error("Missing CLIENT_URL in backend/.env");
}

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api", recipeRoutes);
app.use("/api/user", userRoutes);

await connectMongo();

app.listen(port, () => {
  console.log(`Example app listening on port ${Number(port)}`);
});
