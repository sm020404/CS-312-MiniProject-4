import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api.js";

function EditPost({ onPostUpdated }) {
  // useParams reads the dynamic part of the URL. If App.jsx defines the
  // route as path="/edit/:id", then visiting /edit/7 gives us id === "7".
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load the existing post once when this component mounts, and use it
  // to pre-fill the form fields.
  useEffect(() => {
    async function loadPost() {
      try {
        const data = await api.getBlog(id);
        setTitle(data.blog.title);
        setBody(data.blog.body);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [id]); // if the id in the URL ever changes, reload

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await api.updateBlog(id, title, body);
      onPostUpdated(data.blog); // let App.jsx swap the updated post into its list
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="section-mark">Loading...</p>;

  return (
    <div className="edit-page">
      <h2 className="edit-title">
        Edit <em>Entry</em>
      </h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
        />

        <button type="submit">Save Changes</button>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
          Cancel
        </a>
      </form>
    </div>
  );
}

export default EditPost;

// --- Alternative approach mentioned in the assignment ---
// Instead of fetching by ID, PostList could navigate like:
//   navigate(`/edit/${post.blog_id}`, { state: { post } })
// and this component could read it with:
//   const { state } = useLocation();
// That avoids a network request, but breaks on page refresh since
// React Router's location state doesn't survive a reload.
