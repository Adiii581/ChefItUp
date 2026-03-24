import { useParams, useNavigate } from "react-router-dom";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="recipe-detail">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="safety-tip">
        <strong>Safety Tip:</strong> Never put aluminum foil in the microwave!
      </div>

      <div className="detail-card">
        <h2 style={{ marginBottom: "1rem" }}>Mock Recipe #{id}</h2>
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
