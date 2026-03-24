import mongoose from "mongoose";
// --------------------------------------------------------
// Consider adding tags: [strings] field for feature searching like microwavable 
// or breakfast. 
// --------------------------------------------------------

const ingredientSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: false,
    },
    aisle: {
      type: String,
      required: false,
      trim: true,
    },
    image: {
      type: String,
      required: false,
      trim: true,
    },
    consistency: {
      type: String,
      required: false,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    original: {
      type: String,
      required: false,
      trim: true,
    },
    amount: {
      type: Number,
      required: false,
    },
    unit: {
      type: String,
      required: false,
      trim: true,
    },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: false,
      trim: true,
    },
    imageType: {
      type: String,
      required: false,
      trim: true,
    },
    servings: {
      type: Number,
      required: false,
    },
    readyInMinutes: {
      type: Number,
      required: false,
    },
    sourceUrl: {
      type: String,
      required: false,
      trim: true,
    },
    spoonacularSourceUrl: {
      type: String,
      required: false,
      trim: true,
    },
    summary: {
      type: String,
      required: false,
      trim: true,
    },
    instructions: {
      type: String,
      required: false,
      trim: true,
    },
    vegetarian: {
      type: Boolean,
      default: false,
    },
    vegan: {
      type: Boolean,
      default: false,
    },
    glutenFree: {
      type: Boolean,
      default: false,
    },
    dairyFree: {
      type: Boolean,
      default: false,
    },
    cheap: {
      type: Boolean,
      default: false,
    },
    veryHealthy: {
      type: Boolean,
      default: false,
    },
    veryPopular: {
      type: Boolean,
      default: false,
    },
    sustainable: {
      type: Boolean,
      default: false,
    },
    lowFodmap: {
      type: Boolean,
      default: false,
    },
    aggregateLikes: {
      type: Number,
      required: false,
    },
    healthScore: {
      type: Number,
      required: false,
    },
    pricePerServing: {
      type: Number,
      required: false,
    },
    cuisines: {
      type: [String],
      default: [],
    },
    dishTypes: {
      type: [String],
      default: [],
    },
    diets: {
      type: [String],
      default: [],
    },
    occasions: {
      type: [String],
      default: [],
    },
    extendedIngredients: {
      type: [ingredientSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Recipe", recipeSchema);
