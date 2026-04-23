import { Router } from "express"
import { createRecipe, getRecipes, getRecipeById, updateRecipe, deleteRecipe } from "../controllers/recipeController.js"
import { protect, adminOnly } from "../middleware/auth.js"

const router = Router();

router.get("/recipes", getRecipes);
router.get("/recipes/:id", getRecipeById);

router.post("/recipes", protect, adminOnly, createRecipe);
router.put("/recipes/:id", protect, adminOnly, updateRecipe);
router.delete("/recipes/:id", protect, adminOnly, deleteRecipe)

export default router;