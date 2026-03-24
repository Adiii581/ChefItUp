import Recipe from "../models/recipe.model.js";

const getRecipes = (req, res) => {
  try {
    // add logic to get all recipes from database for specific query

    // example recipe return
    res.status(200).json([
      {
        id: 1,
        title: "Spaghetti Carbonara",
        description: "A delicious Italian pasta dish",
        ingredients: ["spaghetti", "eggs", "bacon", "parmesan cheese"],
        instructions: ["Cook spaghetti according to package directions.", "Fry bacon until crispy.", "Mix eggs and parmesan cheese.", "Combine all ingredients and serve hot."]
      }
    ]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getRecipeById = (req, res) => {
  try {
    const { id } = req.params;
    // add logic to get recipe by id from database
    
    // example recipe to return
    res.status(200).json({
      id: 1,
      title: "Spaghetti Carbonara",
      description: "A delicious Italian pasta dish",
      ingredients: ["spaghetti", "eggs", "bacon", "parmesan cheese"],
      instructions: ["Cook spaghetti according to package directions.", "Fry bacon until crispy.", "Mix eggs and parmesan cheese.", "Combine all ingredients and serve hot."]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const createRecipe = (req, res) => {
  try {
    // can add or delete paramters
    const { title, description, ingredients, instructions } = req.body;
    // add logic to create new recipe in database

    res.status(201).json({ message: "Recipe create successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const updateRecipe = (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, ingredients, instructions } = req.body;
    // add logic to update recipe in database

    res.status(200).json({ message: "Recipe updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const deleteRecipe = (req, res) => {
  try {
    const { id } = req.params;
    // add logic to delete recipe from database
    
    res.status(200).json({ message: "Recipe deleted sucessfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export { getRecipes };
export { getRecipeById};
export { createRecipe };
export { updateRecipe };
export { deleteRecipe };