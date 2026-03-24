import { useState } from "react";
import { useNavigate } from "react-router-dom";

const mockDatabase = [
  {
    id: 1,
    title: "5-Minute Mug Cake",
    appliance: "Microwave",
    time: "5 mins",
    ingredients: ["flour", "sugar", "cocoa"],
  },
  {
    id: 2,
    title: "Dorm Room Ramen",
    appliance: "Kettle",
    time: "10 mins",
    ingredients: ["ramen", "egg", "spinach"],
  },
  {
    id: 3,
    title: "Overnight Oats",
    appliance: "Mini-Fridge",
    time: "8 hours",
    ingredients: ["oats", "milk", "honey"],
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliance, setAppliance] = useState("All");
  const navigate = useNavigate();

  const filteredRecipes = mockDatabase.filter((recipe) => {
    const matchesAppliance =
      appliance === "All" || recipe.appliance === appliance;
    const matchesSearch =
      recipe.ingredients.some((ing) =>
        ing.includes(searchQuery.toLowerCase()),
      ) || searchQuery === "";
    return matchesAppliance && matchesSearch;
  });

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert("Please register or log in to save favorite recipes!");
  };

  return (
    <div className="home-layout">
      <aside className="sidebar">
        <h3>Search</h3>
        <input
          type="text"
          className="search-bar"
          placeholder="Ingredients on hand… (e.g. oats)"
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
          <option value="Mini-Fridge">No Cooking (Mini-Fridge)</option>
        </select>
      </aside>

      <main>
        <p className="section-title">Recommended for you</p>
        {filteredRecipes.length > 0 ? (
          <div className="recipe-grid">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="recipe-card"
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              >
                <h3>{recipe.title}</h3>
                <p className="recipe-meta">
                  {recipe.appliance} · {recipe.time}
                </p>
                <button className="primary-btn" onClick={handleSaveClick}>
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
