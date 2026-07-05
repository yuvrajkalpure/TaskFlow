# TaskFlow - Premium MERN Stack Task Tracker

TaskFlow is a premium, fully responsive full-stack MERN (MongoDB, Express, React, Node.js) web application designed to help users track, organize, search, prioritize, and manage their daily workflows. It features a modern design (Light/Dark themes), JWT authentication, dynamic client stats, real-time validations, and custom sorting weights.

---

## 🚀 Key Features

- **Full CRUD Support**: Create, read, update, and delete tasks dynamically.
- **User Authentication & OTP Verification**: Secure user registration with passwords hashed using `bcryptjs` and session tokens signed using JWT (JSON Web Tokens). Accounts are registered as unverified, requiring a 6-digit OTP verification code sent via email (or logged to the developer console) to activate and log in.
- **Profile Photo Uploader**: Support uploading and encoding custom user profile pictures as compressed Base64 Data URIs, saved directly in the MongoDB profile record.
- **Dynamic Sidebar & Bottom Navigation**: Spotify-style navigation bar shifting from a left vertical sidebar on desktop viewports to a compact bottom navigation bar on mobile viewports. Provides quick access to Home tasks, Profile, and Devices tabs.
- **Active Devices Session Inspector**: Users can view all active devices (operating system name, browser name, IP address, and login time) currently logged into their account, and revoke any session.
- **Self-Account Deactivation**: Soft deactivation (soft delete) where a user can deactivate their account; the database preserves their records, but log-ins are blocked.
- **Password Reset & Recovery**: Form to change passwords when logged in, and a forgot-password recovery system that verifies users using a secure OTP code.
- **Admin Control Panel**: Logs in with administrator credentials (`****` / `****`) to view all registered users and their details, activate/deactivate any user, and view average feedback scores and comments.
- **Theme Database Persistence**: Preferred user themes (Light or Dark mode) are stored in their database record, allowing their preferences to persist across all logged-in devices.
- **Offline Banner Indicator**: Front-end checks connectivity to the backend and renders an offline warning banner at the top of the screen if the REST API goes offline.
- **Mobile-Responsive Task ordering**: Rearranges the dashboard order on mobile viewports (`max-width: 768px`) using CSS Flexbox so that **active Tasks are displayed at the very top**, followed by filter controls, and stats counters at the bottom.
- **Search & Filters**: Instantly search tasks by title/description and filter by completion status or priority level.
- **Custom Sorting**: Sort tasks by Due Date, Creation Date, Alphabetical Title, and Priority weight (High > Medium > Low).
- **Dynamic Stats Board**: Real-time counter metrics tracking total, pending, in-progress, completed, and overdue tasks with an overall completion rate indicator.
- **Third-Party Vector Icons**: Integrates Boxicons for clean vector iconography (no emojis used).

---

## 🛠️ Tech Stack

- **Frontend**: React.js (scaffolded with Vite), Vanilla CSS (responsive bottom navbar layouts), Boxicons CSS.
- **Backend**: Node.js + Express.js REST API, Nodemailer SMTP service.
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
