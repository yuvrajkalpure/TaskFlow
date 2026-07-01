# TaskFlow - Premium MERN Stack Task Tracker

TaskFlow is a premium, fully responsive full-stack MERN (MongoDB, Express, React, Node.js) web application designed to help users track, organize, search, prioritize, and manage their daily workflows. It features a modern design (Light/Dark themes), JWT authentication, dynamic client stats, real-time validations, and custom sorting weights.

---

## 🚀 Key Features

- **Full CRUD Support**: Create, read, update, and delete tasks dynamically.
- **User Authentication**: Secure user registration and login with passwords hashed using `bcryptjs` and session tokens signed using JWT (JSON Web Tokens).
- **Search & Filters**: Instantly search tasks by title/description and filter by completion status or priority level.
- **Custom Sorting**: Sort tasks by Due Date, Creation Date, Alphabetical Title, and Priority weight (High > Medium > Low).
- **Dynamic Stats Board**: Real-time counter metrics tracking total, pending, in-progress, completed, and overdue tasks with an overall completion rate indicator.
- **Responsive Layout**: Designed using CSS Flexbox/Grid for a consistent look across mobile, tablet, and desktop viewports.
- **Premium Aesthetics**: Glassmorphism cards, HSL color tokens, custom scrollbars, subtle box-shadow glows, hover transitions, and a theme switcher (Light vs Dark mode).
- **Third-Party Vector Icons**: Integrates Boxicons for clean vector iconography (no emojis used).

---

## 🛠️ Tech Stack

- **Frontend**: React.js (scaffolded with Vite), Vanilla CSS (responsive, custom-tailored theme system), Boxicons CSS.
- **Backend**: Node.js + Express.js REST API.
- **Database**: MongoDB (Mongoose ODM).

---

## 📁 Directory Structure

```text
Task_Tracker/
├── backend/
│   ├── config/
│   │   └── db.js            # MongoDB Mongoose connection config
│   ├── controllers/
│   │   ├── authController.js # Signup and login controllers
│   │   └── taskController.js # Task CRUD controllers (with filters/sorts)
│   ├── middleware/
│   │   └── authMiddleware.js # JWT verification middleware
│   ├── models/
│   │   ├── User.js          # Mongoose User Schema
│   │   └── Task.js          # Mongoose Task Schema
│   ├── routes/
│   │   ├── authRoutes.js    # Auth endpoints router
│   │   └── taskRoutes.js    # Task endpoints router
│   ├── .env                 # Server configuration environment variables
│   ├── package.json         # Backend dependencies & npm scripts
│   └── server.js            # App entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Dashboard, Form, Stats, Items, Auth)
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global Auth state & localStorage sync
│   │   ├── services/
│   │   │   └── api.js        # API request functions (Fetch API client)
│   │   ├── App.jsx          # Main application frame
│   │   ├── App.css          # Responsive styling layout
│   │   ├── index.css        # Theme variables & base typography resets
│   │   └── main.jsx         # React DOM mount point
│   ├── index.html           # Document template (linked with Boxicons)
│   ├── package.json         # Frontend packages & scripts
│   └── vite.config.js       # Vite build configurations
└── README.md                # General project documentation
```

---

## 💻 Local Setup & Installation

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)
- **MongoDB** installed and running locally on port `27017` (e.g. `mongodb://127.0.0.1:27017/task_tracker`).

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. A `.env` file has already been generated with the following default values:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/task_tracker
   JWT_SECRET=super_secret_jwt_key_123456_task_tracker
   ```
4. Start the backend server:
   ```bash
   npm start
   # Or run in development mode with nodemon:
   npm run dev
   ```

The backend server should connect to MongoDB and begin listening at `http://localhost:5000/`.

---

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open the displayed URL in your browser (usually `http://localhost:5173/`).

---

## 📡 REST API Reference

All requests must have their headers contain `Content-Type: application/json`. Protected endpoints also require a valid JWT passed in the headers as: `Authorization: Bearer <JWT_TOKEN>`.

### Authentication Routes
- **`POST /api/auth/register`**
  - Registers a new user.
  - Body params: `{ "username": "johndoe", "email": "john@example.com", "password": "password123" }`
- **`POST /api/auth/login`**
  - Authenticates user credentials and issues a JWT token.
  - Body params: `{ "email": "john@example.com", "password": "password123" }`

### Tasks Routes (Protected)
- **`GET /api/tasks`**
  - Retrieves tasks for the authenticated user.
  - Query parameters (optional):
    - `status`: Filter by status (`Pending`, `In Progress`, `Completed`).
    - `priority`: Filter by priority (`Low`, `Medium`, `High`).
    - `search`: Case-insensitive text search (checks Title and Description).
    - `sortBy`: Field to sort by (`dueDate`, `createdAt`, `title`, `priority`).
    - `order`: Sorting order (`asc` or `desc`).
- **`POST /api/tasks`**
  - Creates a new task.
  - Body params: `{ "title": "...", "description": "...", "priority": "Medium", "status": "Pending", "dueDate": "YYYY-MM-DD" }`
- **`GET /api/tasks/:id`**
  - Retrieves details of a specific task.
- **`PUT /api/tasks/:id`**
  - Updates task details (can also toggle completion status).
  - Body params: Any subset of task fields.
- **`DELETE /api/tasks/:id`**
  - Deletes a specific task.
