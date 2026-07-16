# Blog Web App — React + Node/Express + PostgreSQL

## Structure
- `backend/` — Express + PostgreSQL API (was EJS in Mini-Project-3, now returns JSON)
- `frontend/` — React (Vite) app that replaces the old EJS views

## Setup

### Backend
```
cd backend
npm install
```
Create a `.env` file in `backend/` with:
```
DATABASE_URL=postgres://username:password@localhost:5432/your_db_name
```
Then run:
```
node index.js
```
Runs on http://localhost:3000

### Frontend
```
cd frontend
npm install
```
Add your hero image at `frontend/public/birds.jpg` (referenced by the CSS).
Then run:
```
npm run dev
```
Runs on http://localhost:5173 — open this in your browser.

Both servers must be running at the same time.

## API Routes (backend/index.js)
| Method | Route | Purpose |
|---|---|---|
| GET | /api/blogs | list all posts |
| GET | /api/blogs/:id | one post |
| POST | /api/blogs | create post (auth required) |
| PUT | /api/blogs/:id | edit post (owner only) |
| DELETE | /api/blogs/:id | delete post (owner only) |
| GET | /api/me | currently logged-in user |
| POST | /api/signup | register |
| POST | /api/signin | log in |
| POST | /api/signout | log out |

## Component → Assignment Step Mapping
| Step | Component |
|---|---|
| 3 (integrate) | `frontend/src/api/api.js` |
| 4 (signup/signin) | `Signup.jsx`, `Signin.jsx` |
| 5 (post creation) | `BlogPostForm.jsx` |
| 6 (post viewing) | `PostList.jsx` |
| 7 (post editing) | `EditPost.jsx` |
| 8 (post deletion) | delete button in `PostList.jsx` |
| 9 (styling) | `index.css` |

## Known limitations (worth mentioning to your instructor)
- Passwords are stored/compared in plain text (inherited from the original Mini-Project-3 backend) — not fixed here, flagged for awareness.
- "My Profile" bonus section is not implemented.
- Nav bar text color assumes a dark hero image behind it; may be hard to read on non-home pages (signin/signup/edit) that lack that background.
