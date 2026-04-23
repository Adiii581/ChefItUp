const BASE_URL = import.meta.env.VITE_API_URL ?? "";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const api = {
  login: (email: string, password: string) =>
    fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then((res) => res.json()),

  register: (username: string, email: string, password: string) =>
    fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    }).then((res) => res.json()),

  getMe: () =>
    fetch(`${BASE_URL}/api/user/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => res.json()),

  getSavedRecipes: () =>
    fetch(`${BASE_URL}/api/save-recipe`, {
      headers: authHeaders(),
    }).then((res) => res.json()),

  saveRecipe: (recipeId: string) =>
    fetch(`${BASE_URL}/api/save-recipe`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ recipeId }),
    }).then((res) => res.json()),

  unsaveRecipe: (recipeId: string) =>
    fetch(`${BASE_URL}/api/save-recipe`, {
      method: "DELETE",
      headers: authHeaders(),
      body: JSON.stringify({ recipeId }),
    }).then((res) => res.json()),

  getReviews: (recipeId: string) =>
    fetch(`${BASE_URL}/api/recipes/${recipeId}/reviews`).then((res) => res.json()),

  submitReview: (recipeId: string, rating: number, comment: string) =>
    fetch(`${BASE_URL}/api/recipes/${recipeId}/reviews`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ rating, comment }),
    }).then((res) => res.json()),

  deleteReview: (recipeId: string, reviewId: string) =>
    fetch(`${BASE_URL}/api/recipes/${recipeId}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then((res) => res.json()),
};
