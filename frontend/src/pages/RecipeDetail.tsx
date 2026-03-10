import { useParams, useNavigate } from 'react-router-dom';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Back</button>
      <h2>Mock Recipe #{id} Details</h2>
      
      <div className="safety-tip">
        <strong>⚠️ Safety Tip:</strong> Never put aluminum foil in the microwave!
      </div>

      <div className="recipe-card">
        <h3>Ingredients</h3>
        <ul>
          <li>Mock Ingredient 1</li>
          <li>Mock Ingredient 2</li>
        </ul>
        <h3>Steps</h3>
        <ol>
          <li>Mix ingredients in a dorm-safe bowl.</li>
          <li>Cook using the specified appliance.</li>
          <li>Enjoy so you can get back to studying!</li>
        </ol>
      </div>
    </div>
  );
}