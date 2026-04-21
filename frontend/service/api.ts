const BASE_URL = import.meta.env.VITE_API_URL ?? "";

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
};
