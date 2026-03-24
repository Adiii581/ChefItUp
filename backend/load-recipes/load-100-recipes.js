/*-------------------------------------------------

Load 10 recipes to a review file only:
node load-recipes/load-100-recipes.js

Load 10 recipes to the review file and database:
node load-recipes/load-100-recipes.js --load

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
const TARGET_RECIPE_COUNT = 10;
const CANDIDATE_POOL_SIZE = 40;
const INSPECTION_OUTPUT_DIR = path.join(backendDir, "load-recipes", "output");
const INSPECTION_OUTPUT_FILE = path.join(
  INSPECTION_OUTPUT_DIR,
  "manual-review-10-recipes.json"
);
const shouldLoadToDatabase = process.argv.includes("--load");

const buildSearchUrl = ({ query, type, maxReadyTime, limit = 10 }) => {
  const params = new URLSearchParams({
    apiKey: process.env.SPOONACULAR_API_KEY ?? "",
    query,
    number: String(limit),
    addRecipeInformation: "false",
    fillIngredients: "false",
    instructionsRequired: "true",
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

const stripHtml = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const APPLIANCE_TAG_RULES = [
  { equipment: ["microwave"], tag: "microwave" },
  { equipment: ["stove", "frying pan", "sauce pan", "pot", "wok", "griddle"], tag: "stovetop" },
  { equipment: ["oven", "broiler", "roasting pan", "baking pan", "baking sheet", "casserole dish"], tag: "oven" },
  { equipment: ["grill", "grill pan"], tag: "grill" },
  { equipment: ["airfryer"], tag: "air_fryer" },
  { equipment: ["instant pot", "pressure cooker"], tag: "pressure_cooker" },
  { equipment: ["slow cooker"], tag: "slow_cooker" },
  { equipment: ["rice cooker"], tag: "rice_cooker" },
  { equipment: ["blender", "immersion blender", "food processor"], tag: "blender_or_processor" },
];

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

const buildManualReviewIngredient = (ingredient) => ({
  name: ingredient.name ?? ingredient.originalName ?? "Unknown ingredient",
  original: ingredient.original ?? ingredient.originalName ?? ingredient.name ?? "",
  amount: ingredient.amount ?? null,
  unit: ingredient.unit ?? "",
});

const buildInstructionSteps = (recipe) => {
  const analyzedInstructions = Array.isArray(recipe.analyzedInstructions)
    ? recipe.analyzedInstructions
    : [];

  const analyzedSteps = analyzedInstructions.flatMap((instructionGroup) =>
    Array.isArray(instructionGroup.steps)
      ? instructionGroup.steps
          .map((step) => stripHtml(step.step ?? ""))
          .filter(Boolean)
      : []
  );

  if (analyzedSteps.length > 0) {
    return analyzedSteps;
  }

  const fallbackInstructions = stripHtml(recipe.instructions ?? "");
  return fallbackInstructions ? [fallbackInstructions] : [];
};

const buildEquipmentList = (recipe) => {
  const analyzedInstructions = Array.isArray(recipe.analyzedInstructions)
    ? recipe.analyzedInstructions
    : [];

  const equipmentNames = analyzedInstructions.flatMap((instructionGroup) =>
    Array.isArray(instructionGroup.steps)
      ? instructionGroup.steps.flatMap((step) =>
          Array.isArray(step.equipment)
            ? step.equipment
                .map((equipment) => equipment.name?.trim())
                .filter(Boolean)
            : []
        )
      : []
  );

  return Array.from(new Set(equipmentNames));
};

const buildRecipeTags = (recipe, equipmentList) => {
  const normalizedEquipment = equipmentList.map((item) => item.toLowerCase());
  const normalizedInstructions = buildInstructionSteps(recipe)
    .join(" ")
    .toLowerCase();
  const tags = new Set();

  for (const rule of APPLIANCE_TAG_RULES) {
    if (rule.equipment.some((equipment) => normalizedEquipment.includes(equipment))) {
      tags.add(rule.tag);
    }
  }

  if (normalizedEquipment.length === 0) {
    tags.add("no_equipment_listed");
  }

  const applianceOnlyEquipment = normalizedEquipment.filter((equipment) =>
    APPLIANCE_TAG_RULES.some((rule) => rule.equipment.includes(equipment))
  );

  if (applianceOnlyEquipment.length === 0) {
    tags.add("no_appliance_needed");
  }

  if (
    tags.has("microwave") &&
    !tags.has("stovetop") &&
    !tags.has("oven") &&
    !tags.has("grill") &&
    !tags.has("air_fryer") &&
    !tags.has("pressure_cooker") &&
    !tags.has("slow_cooker") &&
    !tags.has("rice_cooker")
  ) {
    tags.add("microwave_only");
  }

  if (normalizedInstructions.includes("overnight") || normalizedInstructions.includes("refrigerate")) {
    tags.add("prep_ahead");
  }

  if (recipe.readyInMinutes && recipe.readyInMinutes <= 15) {
    tags.add("quick_meal");
  }

  return Array.from(tags);
};

const buildManualReviewRecipe = (recipe) => {
  const equipment = buildEquipmentList(recipe);

  return {
    id: recipe.id,
    title: recipe.title ?? "",
    description: stripHtml(recipe.summary ?? ""),
    ingredients: Array.isArray(recipe.extendedIngredients)
      ? recipe.extendedIngredients.map(buildManualReviewIngredient)
      : [],
    instructions: buildInstructionSteps(recipe),
    equipment,
    tags: buildRecipeTags(recipe, equipment),
  };
};

const scoreRecipeForTagCoverage = (recipe, uncoveredTags) => {
  const tags = Array.isArray(recipe.tags) ? recipe.tags : [];
  const coverageScore = tags.filter((tag) => uncoveredTags.has(tag)).length;
  const varietyScore = tags.length;
  return coverageScore * 100 + varietyScore;
};

const selectDiverseRecipes = (recipes, targetCount) => {
  const remaining = [...recipes];
  const selected = [];
  const allTags = new Set(remaining.flatMap((recipe) => recipe.tags ?? []));

  while (selected.length < targetCount && remaining.length > 0) {
    remaining.sort(
      (a, b) => scoreRecipeForTagCoverage(b, allTags) - scoreRecipeForTagCoverage(a, allTags)
    );

    const nextRecipe = remaining.shift();
    selected.push(nextRecipe);

    for (const tag of nextRecipe.tags ?? []) {
      allTags.delete(tag);
    }
  }

  return selected;
};

const normalizeRecipe = (recipe) => {
  const equipment = buildEquipmentList(recipe);

  return {
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
    equipment,
    tags: buildRecipeTags(recipe, equipment),
  };
};

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
      if (uniqueIds.size >= CANDIDATE_POOL_SIZE) {
        break;
      }

      uniqueIds.add(id);
    }

    if (uniqueIds.size >= CANDIDATE_POOL_SIZE) {
      break;
    }
  }

  return Array.from(uniqueIds).slice(0, CANDIDATE_POOL_SIZE);
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
  const selectedNormalizedRecipes = selectDiverseRecipes(normalizedRecipes, TARGET_RECIPE_COUNT);
  const selectedRecipesById = new Map(detailedRecipes.map((recipe) => [recipe.id, recipe]));
  const manualReviewRecipes = selectedNormalizedRecipes
    .map((recipe) => selectedRecipesById.get(recipe.id))
    .filter(Boolean)
    .map(buildManualReviewRecipe);
  const validatedRecipes = selectedNormalizedRecipes.map(validateNormalizedRecipe);

  await writeInspectionFile(manualReviewRecipes);
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
