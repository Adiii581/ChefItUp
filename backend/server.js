import express from "express";
import { config } from "dotenv";
import connectMongo from "./db/mongo.js";
config();

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${Number(port)}`);
});

connectMongo();
