import { useState, useEffect } from "react";
import { api } from "../api/api.js";

// currentUser is passed in as a prop so we know whether to show
// Edit/Delete buttons on posts this user owns.
function PostList({ currentUser, onEdit, refreshTrigger }) {
  // useState gives us a piece of data (`posts`) that React "remembers"
  // between renders, plus a function (`setPosts`) to update it.
  // Whenever setPosts is called, React re-renders this component
  // automatically with the new value.
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect runs code in response to something. An empty dependency
  // array [] means "run this once, right after the component first
  // appears on screen" — exactly when we want to fetch the initial data.
  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await api.getBlogs();
        setPosts(data.blogs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
    // refreshTrigger is bumped by the parent (App.jsx) whenever a post is
    // created or edited elsewhere, so this list stays in sync.
  }, [refreshTrigger]);

  async function handleDelete(id) {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.deleteBlog(id);
      // Remove the deleted post from local state so the UI updates
      // instantly, without re-fetching the whole list from the server.
      setPosts((prevPosts) => prevPosts.filter((p) => p.blog_id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p className="section-mark">Loading...</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (posts.length === 0) return <p className="section-mark">Nothing written yet</p>;

  return (
    <div>
      {/* .map() turns each item in the posts array into a piece of JSX.
          React needs a unique `key` on each item to track which is which
          across re-renders — we use blog_id, the database primary key. */}
      {posts.map((post) => (
        <div className="post" key={post.blog_id}>
          <p className="post-tag">Entry</p>
          <h2 className="post-title">{post.title}</h2>
          <p className="post-body">{post.body}</p>
          <p className="post-meta">
            {post.creator_name} &mdash;{" "}
            {new Date(post.date_created).toLocaleDateString()}
          </p>

          {/* Only show Edit/Delete if this post belongs to the logged-in user */}
          {currentUser && currentUser.user_id === post.creator_user_id && (
            <div className="post-actions">
              <button onClick={() => onEdit(post)}>Edit</button>
              <button onClick={() => handleDelete(post.blog_id)}>Delete</button>
            </div>
          )}
          <div className="post-divider" />
        </div>
      ))}
    </div>
  );
}

export default PostList;
