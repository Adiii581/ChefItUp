import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    readyInMinutes: {
      type: Number,
      required: false,
    },
    appliance: {
      type: String,
      required: false,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    instructions: {
      type: [String],
      required: false,
      trim: true,
    },
    ingredients: {
      type: [ingredientSchema],
      default: [],
    },
    equipment: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { versionKey: false }
);

// exposes MongoDB's _id as id so the frontend can use a familiar field name
recipeSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

// derives display-friendly time text from the stored minute count
recipeSchema.virtual("time").get(function getTime() {
  if (typeof this.readyInMinutes !== "number") {
    return undefined;
  }

  return `${this.readyInMinutes} min${this.readyInMinutes === 1 ? "" : "s"}`;
});

// removes Mongo-specific fields from API responses while keeping id available
const transformRecipe = (_doc, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  return ret;
};

recipeSchema.set("toJSON", {
  virtuals: true,
  transform: transformRecipe,
});

recipeSchema.set("toObject", {
  virtuals: true,
  transform: transformRecipe,
});

export default mongoose.model("Recipe", recipeSchema);
