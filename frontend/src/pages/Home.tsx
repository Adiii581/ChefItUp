import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../service/api";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliance, setAppliance] = useState("All");
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);

  const navigate = useNavigate();

  // 🔥 Fetch from backend
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams();

        if (searchQuery) {
          params.append("ingredients", searchQuery.split(" ").join(","));
        }

        if (appliance !== "All") {
          params.append("appliance", appliance);
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/recipes?${params.toString()}`);
        const data = await res.json();

        setRecipes(data);
      } catch (err) {
        console.error("Failed to fetch recipes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [searchQuery, appliance]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setSavedRecipeIds([]);
      return;
    }

    api.getSavedRecipes().then((data) => {
      if (Array.isArray(data.savedRecipes)) {
        setSavedRecipeIds(data.savedRecipes.map((recipe: any) => recipe.id));
      }
    });
  }, []);

  const handleSaveClick = async (e: React.MouseEvent, recipeId: string) => {
    e.stopPropagation();

    if (!localStorage.getItem("token")) {
      alert("Login required to save recipes");
      navigate("/login");
      return;
    }

    const isSaved = savedRecipeIds.includes(recipeId);

    if (isSaved) {
      const data = await api.unsaveRecipe(recipeId);
      if (data.message === "Recipe removed successfully") {
        setSavedRecipeIds((currentIds) => currentIds.filter((id) => id !== recipeId));
      } else {
        alert(data.message || "Unable to unsave recipe");
      }
    } else {
      const data = await api.saveRecipe(recipeId);
      if (data.message === "Recipe saved successfully") {
        setSavedRecipeIds((currentIds) => [...currentIds, recipeId]);
      } else {
        alert(data.message || "Unable to save recipe");
      }
    }
  };

  return (
    <div className="home-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3>Search</h3>

        <input
          type="text"
          className="search-bar"
          placeholder="ingredients (e.g. egg, oats)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <h3>Appliance</h3>

        <select
          className="filter-dropdown"
          value={appliance}
          onChange={(e) => setAppliance(e.target.value)}
        >
          <option value="All">All Appliances</option>
          <option value="Microwave">Microwave</option>
          <option value="No Cooking">No Cooking</option>
          <option value="Stovetop">Stovetop</option>
          <option value="Oven">Oven</option>
          <option value="Toaster Oven">Toaster Oven</option>
        </select>
      </aside>

      {/* Main */}
      <main>
        <p className="section-title">Recommended for you</p>

        {loading ? (
          <p className="empty-state">Loading recipes...</p>
        ) : recipes.length > 0 ? (
          <div className="recipe-grid">

            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="recipe-card"
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              >

                {/* Title */}
                <h3>{recipe.title}</h3>

                {/* Meta */}
                <p className="recipe-meta">
                  {recipe.appliance || "General"} ·{" "}
                  {recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "—"}
                </p>

                {/* Description (optional field) */}
                {recipe.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {recipe.description}
                  </p>
                )}

                {/* Ingredients LIST (NEW) */}
                <div className="mt-3">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                    Ingredients
                  </p>

                  <p className="text-xs text-gray-600 line-clamp-2">
                    {recipe.ingredients
                      ?.map((ing: any) => ing.name)
                      .join(", ")}
                  </p>
                </div>

                {/* Save button */}
                <button
                  className={savedRecipeIds.includes(recipe.id) ? "secondary-btn mt-4" : "primary-btn mt-4"}
                  onClick={(e) => handleSaveClick(e, recipe.id)}
                >
                  {savedRecipeIds.includes(recipe.id) ? "Saved" : "Save"}
                </button>

              </div>
            ))}

          </div>
        ) : (
          <p className="empty-state">No recipes found for those filters.</p>
        )}
      </main>
    </div>
  );
}
