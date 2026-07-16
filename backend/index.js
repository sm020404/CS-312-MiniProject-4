require('dotenv').config();
const express = require("express");
const session = require("express-session");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;

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

app.use(session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false
}));

// Home
app.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM blogs ORDER BY date_created DESC");
        res.render("index", { blogs: result.rows, user: req.session.user });
    } catch (err) {
        console.error(err);
        res.send("Error loading blogs");
    }
});

// Show signup page
app.get("/signup", (req, res) => {
    res.render("signup", { error: null });
});

// Handle signup form
app.post("/signup", async (req, res) => {
    const { user_id, password, name } = req.body;
    try {
        const existing = await pool.query("SELECT * FROM users WHERE user_id = $1", [user_id]);
        if (existing.rows.length > 0) {
            return res.render("signup", { error: "Username already taken, please choose another." });
        }
        await pool.query("INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)", [user_id, password, name]);
        res.redirect("/signin");
    } catch (err) {
        console.error(err);
        res.send("Error signing up");
    }
});

// Show signin page
app.get("/signin", (req, res) => {
    res.render("signin", { error: null });
});

// Handle signin form
app.post("/signin", async (req, res) => {
    const { user_id, password } = req.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE user_id = $1 AND password = $2", [user_id, password]);
        if (result.rows.length === 0) {
            return res.render("signin", { error: "Incorrect username or password." });
        }
        req.session.user = result.rows[0];
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.send("Error signing in");
    }
});

// Create a new blog post
app.post("/create", async (req, res) => {
    if (!req.session.user) return res.redirect("/signin");
    const { title, body } = req.body;
    const { name, user_id } = req.session.user;
    try {
        await pool.query(
            "INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created) VALUES ($1, $2, $3, $4, NOW())",
            [name, user_id, title, body]
        );
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.send("Error creating post");
    }
});

// Show edit page
app.get("/edit/:id", async (req, res) => {
    if (!req.session.user) return res.redirect("/signin");
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM blogs WHERE blog_id = $1", [id]);
        const blog = result.rows[0];
        if (blog.creator_user_id !== req.session.user.user_id) return res.redirect("/");
        res.render("edit", { blog });
    } catch (err) {
        console.error(err);
        res.send("Error loading post");
    }
});

// Handle edit form
app.post("/edit/:id", async (req, res) => {
    if (!req.session.user) return res.redirect("/signin");
    const { id } = req.params;
    const { title, body } = req.body;
    try {
        const result = await pool.query("SELECT * FROM blogs WHERE blog_id = $1", [id]);
        const blog = result.rows[0];
        if (blog.creator_user_id !== req.session.user.user_id) return res.redirect("/");
        await pool.query("UPDATE blogs SET title = $1, body = $2 WHERE blog_id = $3", [title, body, id]);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.send("Error updating post");
    }
});

// Handle delete
app.post("/delete/:id", async (req, res) => {
    if (!req.session.user) return res.redirect("/signin");
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM blogs WHERE blog_id = $1", [id]);
        const blog = result.rows[0];
        if (blog.creator_user_id !== req.session.user.user_id) return res.redirect("/");
        await pool.query("DELETE FROM blogs WHERE blog_id = $1", [id]);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.send("Error deleting post");
    }
});

// Sign out
app.get("/signout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});