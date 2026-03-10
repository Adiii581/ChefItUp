import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockDatabase = [
  { id: 1, title: '5-Minute Mug Cake', appliance: 'Microwave', time: '5 mins', ingredients: ['flour', 'sugar', 'cocoa'] },
  { id: 2, title: 'Dorm Room Ramen', appliance: 'Kettle', time: '10 mins', ingredients: ['ramen', 'egg', 'spinach'] },
  { id: 3, title: 'Overnight Oats', appliance: 'Mini-Fridge', time: '8 hours', ingredients: ['oats', 'milk', 'honey'] },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [appliance, setAppliance] = useState('All');
  const navigate = useNavigate();

  // Simulated Frontend Filtering Logic
  const filteredRecipes = mockDatabase.filter(recipe => {
    const matchesAppliance = appliance === 'All' || recipe.appliance === appliance;
    const matchesSearch = recipe.ingredients.some(ing => ing.includes(searchQuery.toLowerCase())) || searchQuery === '';
    return matchesAppliance && matchesSearch;
  });

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents navigating to the recipe detail when clicking save
    alert('Please register or log in to save favorite recipes!');
  };

  return (
    <div>
      <section className="search-section">
        <input 
          type="text" 
          className="form-input" 
          placeholder="Ingredients on hand? (e.g. oats, egg)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          className="filter-dropdown"
          value={appliance}
          onChange={(e) => setAppliance(e.target.value)}
        >
          <option value="All">All Dorm Appliances</option>
          <option value="Microwave">Microwave Only</option>
          <option value="Kettle">Kettle Only</option>
          <option value="Mini-Fridge">No Cooking (Mini-Fridge)</option>
        </select>
      </section>

      <section>
        <h2>Recommended for you</h2>
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map(recipe => (
            <div 
              key={recipe.id} 
              className="recipe-card" 
              onClick={() => navigate(`/recipe/${recipe.id}`)}
              style={{cursor: 'pointer'}}
            >
              <h3>{recipe.title}</h3>
              <p style={{ color: '#666', fontSize: '0.85rem' }}>
                {recipe.appliance} • {recipe.time}
              </p>
              <button className="primary-btn" onClick={handleSaveClick}>
                ❤️ Save to Favorites
              </button>
            </div>
          ))
        ) : (
          <p>No recipes found for those ingredients/appliances.</p>
        )}
      </section>
    </div>
  );
}