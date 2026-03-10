export default function Profile() {
  return (
    <div>
      <h2>Your Profile</h2>
      <p>Role: Dorm Student</p>
      
      <h3 style={{ marginTop: '2rem' }}>Your Saved Favorites</h3>
      <div className="recipe-card">
        <h4>5-Minute Mug Cake</h4>
        <p>Microwave • 5 mins</p>
        <button className="primary-btn" style={{ backgroundColor: '#ccc', color: '#333' }}>
          Unfavorite
        </button>
      </div>
    </div>
  );
}