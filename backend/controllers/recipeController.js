import mongoose from "mongoose";
import Recipe from "../models/recipe.model.js";

/*
  How to use:
  GET /api/recipes
  Optional query params: title, ingredients=egg,milk, tags=quick_meal,microwave

  Searches for recipes based on url query parameters and returns a list of matching recipes sorted by relevance to the search criteria:
  - title: search for recipes with a title that matches the query
  - ingredients: search for recipes that contain one or more of the specified ingredients
  - tags: search for recipes that contain any of the specified tags
*/
const getRecipes = async (req, res) => {
  try {
    const { title, ingredients, tags } = req.query;

    const ingredientList = ingredients
      ? ingredients
          .split(",")
          .map((ingredient) => ingredient.trim().toLowerCase())
          .filter(Boolean)
      : [];

    const tagList = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    const pipeline = [];

    const matchStage = {};

    if (title) {
      matchStage.title = { $regex: title, $options: "i" };
    }

    if (tagList.length > 0) {
      matchStage.tags = { $in: tagList };
    }

    if (ingredientList.length > 0) {
      matchStage.$or = ingredientList.map((ingredient) => ({
        "ingredients.name": { $regex: ingredient, $options: "i" }
      }));
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    if (ingredientList.length > 0) {
      pipeline.push(
        {
          // normalizes ingredients to lowercase for case-insensitive matching
          $addFields: {
            ingredientNamesLower: {
              $map: {
                input: "$ingredients",
                as: "ingredient",
                in: { $toLower: "$$ingredient.name" }
              }
            }
          }
        },
        {
          // ranks recipes based on the number of matching ingredients with the search query
          $addFields: {
            matchCount: {
              $size: {
                $filter: {
                  input: ingredientList,
                  as: "searchedIngredient",
                  cond: {
                    $gt: [
                      {
                        $size: {
                          $filter: {
                            input: "$ingredientNamesLower",
                            as: "recipeIngredient",
                            cond: {
                              $regexMatch: {
                                input: "$$recipeIngredient",
                                regex: "$$searchedIngredient"
                              }
                            }
                          }
                        }
                      },
                      0
                    ]
                  }
                }
              }
            }
          }
        },
        {
          // sorts recipes by relevance to the search criteria, with recipes that have more matching ingredients appearing first
          $sort: { matchCount: -1, title: 1 }
        },
        {
          // removes the temporary field used for ranking from the final results
          // add matchCount: 0 to remove the matchCount field from the final results as well
          $project: {
            ingredientNamesLower: 0
          }
        }
      );
    } else {
      // if no ingredient search criteria is provided, sort the results alphabetically by title
      pipeline.push({
        $sort: { title: 1 }
      });
    }

    const recipes = await Recipe.aggregate(pipeline);

    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*
  How to use:
  GET /api/recipes/:id

  Returns one recipe by its MongoDB _id.
*/
const getRecipeById = async (req, res) => {
  try {
    const recipeId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: "Invalid recipe id" });
    }
    
    // search for recipe in the database based on the MongoDB _id
    const recipe = await Recipe.findById(recipeId);

    // recipe is not found
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    
    // return the recipe as a response
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/*
  How to use:
  POST /api/recipes
  Body: { "title": "Recipe title", "ingredients": [], "instructions": [], ...optionalFields }

  Creates a new recipe and lets MongoDB generate the unique _id.
*/
const createRecipe = async (req, res) => {
  try {
    const { title, ingredients, instructions, ...optionalFields } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (ingredients && !Array.isArray(ingredients)) {
      return res.status(400).json({ message: "Ingredients must be an array" });
    }

    if (instructions && !Array.isArray(instructions)) {
      return res.status(400).json({ message: "Instructions must be an array" });
    }

    const recipe = await Recipe.create({
      title: title.trim(),
      ingredients: ingredients ?? [],
      instructions: instructions ?? [],
      ...optionalFields
    });

    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/*
  How to use:
  PUT /api/recipes/:id
  Body: any recipe fields you want to update

  Updates an existing recipe by MongoDB _id.
*/
const updateRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: "Invalid recipe id" });
    }

    const updates = { ...req.body };

    if (updates._id !== undefined) {
      delete updates._id;
    }

    if (updates.spoonacularId !== undefined) {
      delete updates.spoonacularId;
    }

    if (updates.title !== undefined) {
      if (!updates.title?.trim()) {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      updates.title = updates.title.trim();
    }

    if (updates.ingredients !== undefined && !Array.isArray(updates.ingredients)) {
      return res.status(400).json({ message: "Ingredients must be an array" });
    }

    if (updates.instructions !== undefined && !Array.isArray(updates.instructions)) {
      return res.status(400).json({ message: "Instructions must be an array" });
    }

    const recipe = await Recipe.findByIdAndUpdate(
      recipeId,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/*
  How to use:
  DELETE /api/recipes/:id

  Deletes an existing recipe by MongoDB _id.
*/
const deleteRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: "Invalid recipe id" });
    }

    const recipe = await Recipe.findByIdAndDelete(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export { getRecipes };
export { getRecipeById};
export { createRecipe };
export { updateRecipe };
export { deleteRecipe };
