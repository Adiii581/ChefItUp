import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../service/api";

export default function Profile() {
  const [user, setUser] = useState<{ username: string; email: string } | null>(
    null,
  );
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getMe().then((data) => {
      if (data.username) setUser(data);
    });

    api.getSavedRecipes().then((data) => {
      if (Array.isArray(data.savedRecipes)) {
        setSavedRecipes(data.savedRecipes);
      }
    });
  }, []);

  const handleUnsaveClick = async (e: React.MouseEvent, recipeId: string) => {
    e.stopPropagation();

    const data = await api.unsaveRecipe(recipeId);

    if (data.message === "Recipe removed successfully") {
      setSavedRecipes((recipes) =>
        recipes.filter((recipe) => recipe.id !== recipeId),
      );
      return;
    }

    alert(data.message || "Unable to remove saved recipe");
  };

  const displayName = user?.username ?? "...";
  const displayEmail = user?.email ?? "...";
  const avatarLetter = user?.username?.[0]?.toUpperCase() ?? "?";

  return (
    <div>
      <div className="profile-header">
        <div className="profile-avatar">{avatarLetter}</div>
        <div className="profile-info">
          <h2>{displayName}</h2>
          <p>{displayEmail}</p>
        </div>
      </div>

      <p className="section-title">Saved Favourites</p>
      {savedRecipes.length > 0 ? (
        <div className="recipe-grid">
          {savedRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="recipe-card"
              onClick={() => navigate(`/recipe/${recipe.id}`)}
            >
              <h3>{recipe.title}</h3>
              <p className="recipe-meta">
                {recipe.appliance || "General"} ·{" "}
                {recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "-"}
              </p>
              <button
                className="secondary-btn"
                onClick={(e) => handleUnsaveClick(e, recipe.id)}
              >
                Unfavourite
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No saved recipes yet.</p>
      )}
    </div>
  );
}
