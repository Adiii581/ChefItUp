import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../service/api";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);

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
    if (!localStorage.getItem("token")) {
      setIsSaved(false);
      return;
    }

    api.getSavedRecipes().then((data) => {
      if (Array.isArray(data.savedRecipes)) {
        setIsSaved(data.savedRecipes.some((savedRecipe: any) => savedRecipe.id === id));
      }
    });
  }, [id]);

  const handleSaveClick = async () => {
    if (!recipe?.id) {
      return;
    }

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
            <>
              <li>No ingredients found</li>
            </>
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
            <>
              <li>No instructions found</li>
            </>
          )}
        </ol>
      </div>
    </div>
  );
}
