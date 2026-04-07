import Recipe from "../models/recipe.model.js";

/*
  searches for recipes based on url query parameters and returns a list of matching recipes sorted by relevance to the search criteria:
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
  searches for a single recipe based on id passed as a route parameter
*/
const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // search for recipe in the database based on the id
    const recipe = await Recipe.findOne({ id: Number(id) });

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