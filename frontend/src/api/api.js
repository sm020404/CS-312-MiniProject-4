const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// A tiny wrapper around fetch that:
// - always points at our backend
// - always sends the session cookie (credentials: 'include')
// - always sends/receives JSON
// - throws a real error when the response isn't ok, so components can
//   catch it with try/catch instead of checking res.ok everywhere
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    // Our backend always sends { error: "..." } on failure (see index.js)
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export const api = {
  getBlogs: () => request("/api/blogs"),
  getBlog: (id) => request(`/api/blogs/${id}`),
  createBlog: (title, body) =>
    request("/api/blogs", {
      method: "POST",
      body: JSON.stringify({ title, body }),
    }),
  updateBlog: (id, title, body) =>
    request(`/api/blogs/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title, body }),
    }),
  deleteBlog: (id) =>
    request(`/api/blogs/${id}`, { method: "DELETE" }),

  getMe: () => request("/api/me"),
  signup: (user_id, password, name) =>
    request("/api/signup", {
      method: "POST",
      body: JSON.stringify({ user_id, password, name }),
    }),
  signin: (user_id, password) =>
    request("/api/signin", {
      method: "POST",
      body: JSON.stringify({ user_id, password }),
    }),
  signout: () => request("/api/signout", { method: "POST" }),
};
