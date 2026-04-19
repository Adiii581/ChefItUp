import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectMongo from "../db/mongo.js";
import Recipe from "../models/recipe.model.js";
import manualReviewRecipes from "./manual_review.js";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const backendDir = path.resolve(currentDir, "..");

dotenv.config({ path: path.join(backendDir, ".env") });

const validateManualReviewRecipe = (recipe) => {
  const validationCandidate = new Recipe(recipe);
  const validationError = validationCandidate.validateSync();

  if (validationError) {
    throw validationError;
  }

  return validationCandidate.toObject({ versionKey: false });
};

const loadManualReviewRecipes = async () => {
  if (!Array.isArray(manualReviewRecipes) || manualReviewRecipes.length === 0) {
    throw new Error("manual_review.js does not export any recipes.");
  }

  const validatedRecipes = manualReviewRecipes.map(validateManualReviewRecipe);
  const recipeTitles = validatedRecipes.map((recipe) => recipe.title);

  await connectMongo();

  // Replace previously inserted reviewed recipes with the same titles to avoid duplicates.
  await Recipe.deleteMany({ title: { $in: recipeTitles } });
  await Recipe.insertMany(validatedRecipes, { ordered: true });

  console.log(`Inserted ${validatedRecipes.length} manual review recipes into MongoDB.`);
};

loadManualReviewRecipes()
  .catch((error) => {
    console.error("Manual review load failed:", error);

    if (error.cause) {
      console.error("Cause:", error.cause);
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
