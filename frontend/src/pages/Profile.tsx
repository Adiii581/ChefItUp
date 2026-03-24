import { useEffect, useState } from "react";
import { api } from "../../service/api";

export default function Profile() {
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  useEffect(() => {
    api.getMe().then((data) => {
      if (data.username) setUser(data);
    });
  }, []);

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
