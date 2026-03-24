export default function Profile() {
  return (
    <div>
      <div className="profile-header">
        <div className="profile-avatar">D</div>
        <div className="profile-info">
          <h2>Dorm Student</h2>
          <p>dorm.student@university.edu</p>
        </div>
      </div>

      <p className="section-title">Saved Favourites</p>
      <div className="recipe-grid">
        <div className="recipe-card">
          <h3>5-Minute Mug Cake</h3>
          <p className="recipe-meta">Microwave · 5 mins</p>
          <button className="secondary-btn">Unfavourite</button>
        </div>
      </div>
    </div>
  );
}
