# 📚 BookStore Pro

A full-stack, production-quality bookstore management system with a modern, clean UI.

---

## ✨ Features

- **JWT Authentication** — Register, login, protected routes
- **Full Book CRUD** — Create, read, update, delete with validation
- **Advanced Search** — Debounced search by title, author, ISBN
- **Filters** — By category, status, with sort & pagination
- **Dual View** — Table and grid views with animations
- **Dashboard** — Analytics, stats, top books, category charts
- **Featured Books** — Toggle & showcase with one click
- **Book Detail** — Full info page with rating, price history
- **Professional UI** — Clean light theme, responsive, accessible
- **Toast Notifications** — Success/error/info messages
- **Input Validation** — Both client and server side

---

## 🛠️ Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Router  |
| Backend    | Node.js, Express.js, MVC architecture       |
| Database   | MySQL with relational schema                |
| Auth       | JWT + bcrypt (12 rounds)                    |
| Validation | express-validator (server) + custom (client)|
| Security   | Helmet, CORS, parameterized queries         |

---

## 📁 Project Structure

```
bookstore/
├── backend/
│   ├── config/
│   │   ├── database.js     # MySQL connection pool
│   │   └── schema.sql      # Full schema + seed data
│   ├── controllers/
│   │   ├── authController.js
│   │   └── bookController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT protect/admin
│   │   └── errorHandler.js  # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   └── Book.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── books.js
│   ├── validations/
│   │   └── index.js
│   ├── utils/
│   │   └── response.js
│   ├── app.js
│   ├── server.js
│   └── .env
│
└── frontend/
    └── src/
        ├── api/
        │   └── index.js           # Axios instance + all API calls
        ├── components/
        │   ├── books/
        │   │   └── BookFormModal.jsx
        │   └── common/
        │       └── index.jsx      # Spinner, Modal, Pagination, etc.
        ├── context/
        │   └── AuthContext.jsx
        ├── layouts/
        │   └── AppShell.jsx       # Sidebar + topbar layout
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── BooksPage.jsx
        │   └── BookDetail.jsx
        ├── App.jsx
        └── main.jsx
```

---

## ⚡ Setup

### Prerequisites
- Node.js 18+
- MySQL 5.7+ / 8.0+

### 1. Database

```bash
# Option A: MySQL CLI
mysql -u root -p < backend/config/schema.sql

# Option B: MySQL Workbench
# Open schema.sql and execute all
```

### 2. Backend

```bash
cd backend
npm install

# Edit .env — set your MySQL password:
# DB_PASSWORD=your_password

npm run dev   # → http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev   # → http://localhost:5173
```

---

## 🔑 Default Credentials

```
Email:    admin@bookstore.com
Password: Admin@123
```

---

## 📡 API Endpoints

### Auth

| Method | Endpoint            | Auth | Description   |
|--------|---------------------|------|---------------|
| POST   | /api/auth/register  | No   | Register user |
| POST   | /api/auth/login     | No   | Login user    |
| GET    | /api/auth/me        | Yes  | Get profile   |

### Books

| Method | Endpoint                  | Auth     | Description          |
|--------|---------------------------|----------|----------------------|
| GET    | /api/books                | Optional | List with search/page|
| GET    | /api/books/:id            | Optional | Get single book      |
| GET    | /api/books/stats          | Yes      | Dashboard stats      |
| GET    | /api/books/featured       | Optional | Featured books       |
| GET    | /api/books/categories     | Optional | All categories       |
| POST   | /api/books                | Yes      | Create book          |
| PUT    | /api/books/:id            | Yes      | Update book          |
| DELETE | /api/books/:id            | Yes      | Delete book          |
| PATCH  | /api/books/:id/featured   | Yes      | Toggle featured      |

### Query Parameters (GET /api/books)

```
?search=gatsby   Search by title, author, ISBN
?page=1          Page number
?limit=10        Items per page (max 100)
?sortBy=price    Sort by: title, author, price, rating, total_sold, created_at
?sortOrder=ASC   ASC or DESC
?category=fiction  Filter by category slug
?status=active   Filter by: active, inactive, out_of_stock
```

---

## 🚀 Deployment

### Frontend → Vercel

```bash
cd frontend
# Add .env file:
echo "VITE_API_URL=https://your-backend.railway.app/api" > .env.production

# Build
npm run build

# Deploy via Vercel CLI or GitHub integration
```

### Backend → Railway / Render

```bash
# Set environment variables in Railway/Render dashboard:
PORT=5000
DB_HOST=...  (from Railway MySQL)
DB_USER=...
DB_PASSWORD=...
DB_NAME=bookstore_pro
JWT_SECRET=your_production_secret
CLIENT_URL=https://your-vercel-app.vercel.app
```

---

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT expires in 7 days
- Helmet.js sets HTTP security headers
- CORS restricts allowed origins
- All SQL queries use parameterized inputs
- Input validation on all endpoints
