import mongoose from "mongoose";
import user from "../models/user.js";

const saveRecipe = async (req, res) => {
  try {
    const { recipeId } = req.body;
    const userId = req.user._id;

    // Validate the recipeId
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: "Invalid recipe id" });
    }

    // Check if the recipe is already saved    const userDoc = await user.findById(userId);
    if (userDoc.savedRecipes.includes(recipeId)) {
      return res.status(400).json({ message: "Recipe already saved" });
    }

    // Save the recipe to the user's savedRecipes array
    userDoc.savedRecipes.push(recipeId);
    await userDoc.save();

    res.status(200).json({ message: "Recipe saved successfully" });
  } catch (error) {
    console.error("Error saving recipe:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getRecipe = async (req, res) => {
  try {
    const userId = req.user._id;
    const userDoc = await user.findById(userId).populate("savedRecipes");

    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ savedRecipes: userDoc.savedRecipes });
  } catch (error) {
    console.error("Error fetching saved recipes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const { recipeId } = req.body;
    const userId = req.user._id;

    // Validate the recipeId
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: "Invalid recipe id" });
    }

    const userDoc = await user.findById(userId);

    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the recipe from the user's savedRecipes array
    userDoc.savedRecipes = userDoc.savedRecipes.filter(
      (id) => id.toString() !== recipeId
    );
    await userDoc.save();
    res.status(200).json({ message: "Recipe removed successfully" });
  } catch (error) {
    console.error("Error deleting saved recipe:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { saveRecipe, getRecipe, deleteRecipe };