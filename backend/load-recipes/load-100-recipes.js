/*-------------------------------------------------

Load to file only: node load-recipes/load-100-recipes.js

Load to db and seperate file: node load-recipes/load-100-recipes.js --load

--------------------------------------------------*/
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectMongo from "../db/mongo.js";
import Recipe from "../models/recipe.model.js";
import dormFriendlySearches from "./dorm-friendly-searches.js";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const backendDir = path.resolve(currentDir, "..");

dotenv.config();

const SPOONACULAR_BASE_URL = "https://api.spoonacular.com";
const TARGET_RECIPE_COUNT = 100;
const INSPECTION_OUTPUT_DIR = path.join(backendDir, "load-recipes", "output");
const INSPECTION_OUTPUT_FILE = path.join(
  INSPECTION_OUTPUT_DIR,
  "normalized-100-recipes.json"
);
const shouldLoadToDatabase = process.argv.includes("--load");

const buildSearchUrl = ({ query, type, maxReadyTime, limit = 10 }) => {
  const params = new URLSearchParams({
    apiKey: process.env.SPOONACULAR_API_KEY ?? "",
    query,
    number: String(limit),
    addRecipeInformation: "false",
    fillIngredients: "false",
    instructionsRequired: "false",
    sort: "popularity",
  });

  if (type) {
    params.set("type", type);
  }

  if (maxReadyTime) {
    params.set("maxReadyTime", String(maxReadyTime));
  }

  return `${SPOONACULAR_BASE_URL}/recipes/complexSearch?${params.toString()}`;
};

const buildBulkInformationUrl = (ids) => {
  const params = new URLSearchParams({
    apiKey: process.env.SPOONACULAR_API_KEY ?? "",
    ids: ids.join(","),
    includeNutrition: "false",
  });

  return `${SPOONACULAR_BASE_URL}/recipes/informationBulk?${params.toString()}`;
};

const fetchJson = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Spoonacular request failed (${response.status}): ${errorText}`);
  }

  return response.json();
};

const normalizeIngredient = (ingredient) => ({
  id: ingredient.id,
  aisle: ingredient.aisle,
  image: ingredient.image,
  consistency: ingredient.consistency,
  name: ingredient.name ?? ingredient.originalName ?? "Unknown ingredient",
  original: ingredient.original,
  amount: ingredient.amount,
  unit: ingredient.unit,
});

const normalizeRecipe = (recipe) => ({
  id: recipe.id,
  title: recipe.title,
  image: recipe.image,
  imageType: recipe.imageType,
  servings: recipe.servings,
  readyInMinutes: recipe.readyInMinutes,
  sourceUrl: recipe.sourceUrl,
  spoonacularSourceUrl: recipe.spoonacularSourceUrl,
  summary: recipe.summary,
  instructions: recipe.instructions,
  vegetarian: recipe.vegetarian,
  vegan: recipe.vegan,
  glutenFree: recipe.glutenFree,
  dairyFree: recipe.dairyFree,
  cheap: recipe.cheap,
  veryHealthy: recipe.veryHealthy,
  veryPopular: recipe.veryPopular,
  sustainable: recipe.sustainable,
  lowFodmap: recipe.lowFodmap,
  aggregateLikes: recipe.aggregateLikes,
  healthScore: recipe.healthScore,
  pricePerServing: recipe.pricePerServing,
  cuisines: Array.isArray(recipe.cuisines) ? recipe.cuisines : [],
  dishTypes: Array.isArray(recipe.dishTypes) ? recipe.dishTypes : [],
  diets: Array.isArray(recipe.diets) ? recipe.diets : [],
  occasions: Array.isArray(recipe.occasions) ? recipe.occasions : [],
  extendedIngredients: Array.isArray(recipe.extendedIngredients)
    ? recipe.extendedIngredients.map(normalizeIngredient)
    : [],
});

const validateNormalizedRecipe = (recipe) => {
  const validationCandidate = new Recipe(recipe);
  const validationError = validationCandidate.validateSync();

  if (validationError) {
    throw validationError;
  }

  return validationCandidate.toObject({ versionKey: false });
};

const fetchCandidateIds = async () => {
  const uniqueIds = new Set();

  for (const search of dormFriendlySearches) {
    const payload = await fetchJson(buildSearchUrl(search));
    const ids = Array.isArray(payload.results) ? payload.results.map((result) => result.id) : [];

    for (const id of ids) {
      if (uniqueIds.size >= TARGET_RECIPE_COUNT) {
        break;
      }

      uniqueIds.add(id);
    }

    if (uniqueIds.size >= TARGET_RECIPE_COUNT) {
      break;
    }
  }

  return Array.from(uniqueIds).slice(0, TARGET_RECIPE_COUNT);
};

const fetchDetailedRecipes = async (ids) => {
  const chunkSize = 20;
  const detailedRecipes = [];

  for (let index = 0; index < ids.length; index += chunkSize) {
    const chunk = ids.slice(index, index + chunkSize);
    const payload = await fetchJson(buildBulkInformationUrl(chunk));

    if (Array.isArray(payload)) {
      detailedRecipes.push(...payload);
    }
  }

  return detailedRecipes;
};

const writeInspectionFile = async (recipes) => {
  await mkdir(INSPECTION_OUTPUT_DIR, { recursive: true });
  await writeFile(INSPECTION_OUTPUT_FILE, JSON.stringify(recipes, null, 2));
};

const loadRecipes = async () => {
  if (!process.env.SPOONACULAR_API_KEY) {
    throw new Error("Missing SPOONACULAR_API_KEY in backend/.env");
  }

  const candidateIds = await fetchCandidateIds();

  if (candidateIds.length < TARGET_RECIPE_COUNT) {
    throw new Error(
      `Only found ${candidateIds.length} candidate recipes. Adjust the search list before loading.`
    );
  }

  const detailedRecipes = await fetchDetailedRecipes(candidateIds);
  const normalizedRecipes = detailedRecipes.map(normalizeRecipe);
  const validatedRecipes = normalizedRecipes.map(validateNormalizedRecipe);

  await writeInspectionFile(validatedRecipes);
  console.log(`Inspection copy written to ${INSPECTION_OUTPUT_FILE}`);

  if (!shouldLoadToDatabase) {
    console.log("Inspection-only mode complete. No recipes were inserted into MongoDB.");
    console.log("Run with --load to insert the validated recipes into MongoDB.");
    return;
  }

  await connectMongo();
  await Recipe.deleteMany({ id: { $in: validatedRecipes.map((recipe) => recipe.id) } });
  await Recipe.insertMany(validatedRecipes, { ordered: true });

  console.log(`Inserted ${validatedRecipes.length} recipes into MongoDB.`);
};

loadRecipes()
  .catch((error) => {
    console.error("Recipe load failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
