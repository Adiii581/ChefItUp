import { Router } from "express";
import { getReviews, createReview, deleteReview } from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const router = Router({ mergeParams: true });

router.get("/recipes/:id/reviews", getReviews);
router.post("/recipes/:id/reviews", protect, createReview);
router.delete("/recipes/:id/reviews/:reviewId", protect, deleteReview);

export default router;
