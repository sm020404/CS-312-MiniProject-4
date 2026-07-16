require('dotenv').config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;
app.set("trust proxy", 1); // required on Render so secure cookies work behind its proxy

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render') ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Database connected at:", res.rows[0].now);
    }
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

const isProduction = process.env.NODE_ENV === "production";

app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: isProduction ? "none" : "lax", // 'none' required for cross-site cookies over HTTPS
        secure: isProduction // cookies only sent over HTTPS in production
    }
}));

// Get all blogs (JSON API for React)
app.get("/api/blogs", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM blogs ORDER BY date_created DESC");
        res.json({ blogs: result.rows, user: req.session.user || null });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error loading blogs" });
    }
});

// Who is currently logged in? (React needs this on page load/refresh,
// since it has no memory of session state between browser reloads)
app.get("/api/me", (req, res) => {
    res.json({ user: req.session.user || null });
});

// Handle signup form (React posts JSON here directly, no GET page needed
// since React renders the signup form itself)
app.post("/api/signup", async (req, res) => {
    const { user_id, password, name } = req.body;
    try {
        const existing = await pool.query("SELECT * FROM users WHERE user_id = $1", [user_id]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: "Username already taken, please choose another." });
        }
        await pool.query("INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)", [user_id, password, name]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error signing up" });
    }
});

// Handle signin form
app.post("/api/signin", async (req, res) => {
    const { user_id, password } = req.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE user_id = $1 AND password = $2", [user_id, password]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Incorrect username or password." });
        }
        req.session.user = result.rows[0];
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error signing in" });
    }
});

// Create a new blog post
app.post("/api/blogs", async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "You must sign in to post." });
    const { title, body } = req.body;
    const { name, user_id } = req.session.user;
    try {
        const result = await pool.query(
            "INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
            [name, user_id, title, body]
        );
        res.json({ success: true, blog: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error creating post" });
    }
});

// Get a single blog post (React uses this if it needs to (re)load one post directly)
app.get("/api/blogs/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM blogs WHERE blog_id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Post not found" });
        res.json({ blog: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error loading post" });
    }
});

// Handle edit form submission
app.put("/api/blogs/:id", async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "You must sign in." });
    const { id } = req.params;
    const { title, body } = req.body;
    try {
        const result = await pool.query("SELECT * FROM blogs WHERE blog_id = $1", [id]);
        const blog = result.rows[0];
        if (!blog) return res.status(404).json({ error: "Post not found" });
        if (blog.creator_user_id !== req.session.user.user_id) {
            return res.status(403).json({ error: "You can only edit your own posts." });
        }
        const updated = await pool.query(
            "UPDATE blogs SET title = $1, body = $2 WHERE blog_id = $3 RETURNING *",
            [title, body, id]
        );
        res.json({ success: true, blog: updated.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error updating post" });
    }
});

// Handle delete
app.delete("/api/blogs/:id", async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "You must sign in." });
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM blogs WHERE blog_id = $1", [id]);
        const blog = result.rows[0];
        if (!blog) return res.status(404).json({ error: "Post not found" });
        if (blog.creator_user_id !== req.session.user.user_id) {
            return res.status(403).json({ error: "You can only delete your own posts." });
        }
        await pool.query("DELETE FROM blogs WHERE blog_id = $1", [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error deleting post" });
    }
});

// Sign out
app.post("/api/signout", (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});