import mongoose from "mongoose";
import Review from "../models/review.model.js";
import Recipe from "../models/recipe.model.js";
import User from "../models/users.model.js";

// Basic list of blocked terms for inappropriate content filtering
const BLOCKED_TERMS = [
  "fuck", "shit", "ass", "bitch", "bastard", "damn", "crap",
  "dick", "cock", "pussy", "cunt", "whore", "slut", "nigger",
  "nigga", "faggot", "retard", "idiot", "stupid", "moron",
];

const containsInappropriateContent = (text) => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BLOCKED_TERMS.some((term) => {
    const regex = new RegExp(`\\b${term}\\b`, "i");
    return regex.test(lower);
  });
};

// Recalculates and saves ratingAverage and ratingCount on the recipe
const updateRecipeRating = async (recipeId) => {
  const result = await Review.aggregate([
    { $match: { recipeId: new mongoose.Types.ObjectId(recipeId) } },
    {
      $group: {
        _id: "$recipeId",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0) {
    await Recipe.findByIdAndUpdate(recipeId, { ratingAverage: 0, ratingCount: 0 });
  } else {
    await Recipe.findByIdAndUpdate(recipeId, {
      ratingAverage: Math.round(result[0].avg * 10) / 10,
      ratingCount: result[0].count,
    });
  }
};

/*
  GET /api/recipes/:id/reviews
  Returns all reviews for a recipe, newest first.
*/
const getReviews = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid recipe id" });
    }

    const reviews = await Review.find({ recipeId: id }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*
  POST /api/recipes/:id/reviews
  Body: { rating: 1-5, comment: "..." }
  Requires auth. One review per user per recipe.
*/
const createReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid recipe id" });
    }

    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    if (comment && containsInappropriateContent(comment)) {
      return res.status(400).json({ message: "Comment contains inappropriate content" });
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const existing = await Review.findOne({ recipeId: id, userId: req.user.id });
    if (existing) {
      return res.status(409).json({ message: "You have already reviewed this recipe" });
    }

    const user = await User.findById(req.user.id).select("username");
    const username = user?.username ?? "Anonymous";

    const review = await Review.create({
      recipeId: id,
      userId: req.user.id,
      username,
      rating: ratingNum,
      comment: comment?.trim() ?? "",
    });

    await updateRecipeRating(id);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*
  DELETE /api/recipes/:id/reviews/:reviewId
  Requires auth. Only the review author can delete their own review.
*/
const deleteReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await review.deleteOne();
    await updateRecipeRating(id);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getReviews, createReview, deleteReview };
