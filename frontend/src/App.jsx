import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { api } from "./api/api.js";
import PostList from "./components/PostList.jsx";
import BlogPostForm from "./components/BlogPostForm.jsx";
import Signup from "./components/Signup.jsx";
import Signin from "./components/Signin.jsx";
import EditPost from "./components/EditPost.jsx";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  // On first load, ask the backend "am I logged in?" — this is the
  // /api/me endpoint we added specifically because React has no memory
  // of session state across a page refresh.
  useEffect(() => {
    api
      .getMe()
      .then((data) => setCurrentUser(data.user))
      .finally(() => setCheckingAuth(false));
  }, []);

  function bumpRefresh() {
    setRefreshTrigger((n) => n + 1);
  }

  async function handleSignout() {
    await api.signout();
    setCurrentUser(null);
    navigate("/");
  }

  if (checkingAuth) return <p>Loading...</p>;

  return (
    <div className="app">
      <nav className="nav">
        <Link to="/" className="logo">The Journal</Link>
        <div className="nav-links">
          {currentUser ? (
            <>
              <span>{currentUser.name}</span>
              <a href="#" onClick={(e) => { e.preventDefault(); handleSignout(); }}>
                Sign Out
              </a>
            </>
          ) : (
            <>
              <Link to="/signin">Sign In</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <div className="hero">
                  <div className="hero-bg" />
                  <div className="hero-overlay" />
                  <div className="hero-text">
                    <p className="hero-eyebrow">Est. 2026</p>
                    <h1 className="hero-title">
                      Notes &amp; <em>Reflections</em>
                    </h1>
                    <p className="hero-sub">a small collection of thoughts</p>
                  </div>
                </div>
                <div className="feed">
                  <p className="section-mark">Latest Entries</p>
                  <PostList
                    currentUser={currentUser}
                    refreshTrigger={refreshTrigger}
                    onEdit={(post) => navigate(`/edit/${post.blog_id}`)}
                  />
                </div>
                {currentUser && <BlogPostForm onPostCreated={bumpRefresh} />}
              </>
            }
          />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/signin"
            element={<Signin onSignedIn={setCurrentUser} />}
          />
          <Route
            path="/edit/:id"
            element={<EditPost onPostUpdated={bumpRefresh} />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
