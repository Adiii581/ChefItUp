import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../service/api";

interface Review {
  _id: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star${onChange ? " star-interactive" : ""}`}
          style={{ color: star <= (hovered || value) ? "#f5a623" : "#ddd" }}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          onClick={() => onChange && onChange(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/recipes/${id}`);
        const data = await res.json();
        setRecipe(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecipe();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    api.getReviews(id).then((data) => {
      if (Array.isArray(data)) setReviews(data);
    });
  }, [id]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setIsSaved(false);
      return;
    }
    api.getSavedRecipes().then((data) => {
      if (Array.isArray(data.savedRecipes)) {
        setIsSaved(data.savedRecipes.some((r: any) => r.id === id));
      }
    });
    api.getMe().then((data) => {
      if (data?._id) setCurrentUserId(data._id);
    });
  }, [id]);

  const handleSaveClick = async () => {
    if (!recipe?.id) return;
    if (!localStorage.getItem("token")) {
      alert("Login required to save recipes");
      navigate("/login");
      return;
    }
    const data = await api.saveRecipe(recipe.id);
    if (data.message === "Recipe saved successfully") {
      setIsSaved(true);
      return;
    }
    alert(data.message || "Unable to save recipe");
  };

  const handleSubmitReview = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    if (myRating === 0) {
      setSubmitError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    const data = await api.submitReview(id!, myRating, myComment);
    setSubmitting(false);
    if (data._id) {
      setReviews((prev) => [data, ...prev]);
      setMyRating(0);
      setMyComment("");
    } else {
      setSubmitError(data.message || "Failed to submit review.");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const data = await api.deleteReview(id!, reviewId);
    if (data.message === "Review deleted successfully") {
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const isLoggedIn = !!localStorage.getItem("token");
  const hasReviewed = reviews.some((r) => r.userId === currentUserId);

  return (
    <div className="recipe-detail">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="safety-tip">
        <strong>Safety Tip:</strong> Never put aluminum foil in the microwave!
      </div>

      <div className="detail-card">
        <h2 style={{ marginBottom: "1rem" }}>
          {recipe?.title || `Recipe #${id}`}
        </h2>

        <button
          className={isSaved ? "secondary-btn" : "primary-btn"}
          onClick={handleSaveClick}
          disabled={isSaved}
        >
          {isSaved ? "Saved" : "Save Recipe"}
        </button>

        {/* Ingredients */}
        <h3>Ingredients</h3>
        <ul>
          {recipe?.ingredients?.length ? (
            recipe.ingredients.map((ing: any, idx: number) => (
              <li key={idx}>
                {ing.amount ? `${ing.amount} ` : ""}
                {ing.unit ? `${ing.unit} ` : ""}
                {ing.name}
              </li>
            ))
          ) : (
            <li>No ingredients found</li>
          )}
        </ul>

        {/* Steps */}
        <h3>Steps</h3>
        <ol>
          {recipe?.instructions?.length ? (
            recipe.instructions.map((step: string, idx: number) => (
              <li key={idx}>{step}</li>
            ))
          ) : (
            <li>No instructions found</li>
          )}
        </ol>
      </div>

      {/* Ratings & Comments — separate card */}
      <div className="reviews-card">
        <div className="reviews-card-header">
          <h2 className="reviews-card-title">Ratings & Reviews</h2>
          {reviews.length > 0 && (
            <div className="reviews-avg">
              <StarRating value={Math.round(averageRating)} />
              <span className="reviews-avg-text">
                {averageRating.toFixed(1)}{" "}
                <span className="reviews-avg-count">
                  ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </span>
            </div>
          )}
        </div>

        {isLoggedIn && !hasReviewed && (
          <form onSubmit={handleSubmitReview} className="review-form">
            <p>Leave a review:</p>
            <StarRating value={myRating} onChange={setMyRating} />
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="Write a comment (optional)"
              maxLength={1000}
              rows={3}
            />
            {submitError && <p className="review-error">{submitError}</p>}
            <button type="submit" className="review-submit-btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        {!isLoggedIn && (
          <p className="review-login-prompt">
            <button onClick={() => navigate("/login")}>Log in</button> to leave a review.
          </p>
        )}

        {isLoggedIn && hasReviewed && (
          <p className="review-already">You have already reviewed this recipe.</p>
        )}

        {reviews.length === 0 ? (
          <p className="review-empty">No reviews yet. Be the first!</p>
        ) : (
          <div className="review-list">
            {reviews.map((review) => (
              <div key={review._id} className="review-item">
                <div className="review-header">
                  <div className="review-meta">
                    <span className="review-author">
                      {review.username}
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                    <StarRating value={review.rating} />
                  </div>
                  {review.userId === currentUserId && (
                    <button
                      className="review-delete-btn"
                      onClick={() => handleDeleteReview(review._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
                {review.comment && (
                  <p className="review-comment">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
