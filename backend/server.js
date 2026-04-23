import express from "express";
import cors from "cors";
import { config } from "dotenv";
import connectMongo from "./db/mongo.js";
config();
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import saveRecipeRoutes from "./routes/saveRecipeRoute.js";
import reviewRoutes from "./routes/reviewRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  /\.vercel\.app$/,
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api", recipeRoutes);
app.use("/api", saveRecipeRoutes);
app.use("/api/user", userRoutes);
app.use("/api", reviewRoutes);

await connectMongo();

app.listen(port, () => {
  console.log(`Example app listening on port ${Number(port)}`);
});
