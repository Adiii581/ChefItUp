import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliance, setAppliance] = useState("All");
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
          params.append("tags", appliance.toLowerCase());
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

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert("Login required to save recipes");
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
          <option value="Kettle">Kettle</option>
          <option value="Mini-Fridge">No Cooking</option>
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
                  className="primary-btn mt-4"
                  onClick={handleSaveClick}
                >
                  Save
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