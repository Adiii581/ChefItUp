import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState<any>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`/api/recipes/${id}`);
        const data = await res.json();
        setRecipe(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRecipe();
  }, [id]);

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