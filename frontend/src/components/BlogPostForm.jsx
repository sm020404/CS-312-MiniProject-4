import { useState } from "react";
import { api } from "../api/api.js";

// onPostCreated is a callback passed down from the parent (App) so that
// when a new post is made here, App can add it to the list it's showing.
function BlogPostForm({ onPostCreated }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser's default full-page-reload form submit
    setError(null);

    if (!title.trim() || !body.trim()) {
      setError("Title and body are both required.");
      return;
    }

    try {
      const data = await api.createBlog(title, body);
      onPostCreated(data.blog); // hand the new post up to App.jsx
      // Clear the form now that submission succeeded
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="write-form" onSubmit={handleSubmit}>
      <p className="write-label">Write a new entry</p>
      {error && <p className="error">{error}</p>}

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="What's on your mind?"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
      />

      <button type="submit">Publish</button>
    </form>
  );
}

export default BlogPostForm;
