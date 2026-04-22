import { Router } from "express";
import { saveRecipe, getRecipe, unsaveRecipe } from "../controllers/saveRecipeController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/save-recipe", protect, saveRecipe);
router.delete("/save-recipe", protect, unsaveRecipe);
router.get("/save-recipe", protect, getRecipe);

export default router;