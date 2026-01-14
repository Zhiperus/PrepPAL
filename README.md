# PrepPAL 🎒

**Disaster Readiness for Every Household.**

PrepPAL is a web application designed to help households prepare for disasters through standardized checklists, inventory tracking, and interactive learning modules. It gamifies preparedness by awarding points for safety milestones, feeding into a community leaderboard that helps Local Government Units (LGUs) monitor area resilience.

---
## 🚀 Key Features

### 📋 Standardized Onboarding
New users provide household details (member count, pets, etc.) to initialize their profile. All users start with a **standardized, expert-verified emergency Go Bag checklist** based on national guidelines.

### 🎒 Go-Bag & Safety Inventory
A digital inventory system to track essential survival items against a standard requirements list. Users can verify their items by uploading photos for community validation.

### 📸 Community Posting & Rating
A social feed where users post their Go Bag setups. Community members verify these posts to validate item quality, ensuring fairness in the scoring system.

### 📚 Refresher Modules
Interactive educational content covering topics like Earthquake Readiness, Typhoon Safety, and First Aid. Includes assessments with spaced reinforcement learning.

### 🏆 Gamification & Leaderboard
Users earn points for inventory completeness, module completion, and community interaction. Leaderboards rank users by League (Barangay, City, Region).

### 📊 LGU Dashboard
A specialized view for local authorities to monitor preparedness statistics, identify high-risk households, and generate PDF/CSV reports for logistic planning.

---

## 🛠 Tech Stack

**Frontend:**
- React (Vite)
- TypeScript
- Tailwind CSS
- Tanstack Query
- React Hook Form + Zod

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- JSON Web Tokens (JWT) for Authentication

**Services:**
- Resend (Email Verification)

---

## ⚙️ Installation

You can set up PrepPAL manually or use Docker for an instant development environment.

### Option A: Quick Start with Docker (Recommended)
This project comes with a configured **DevContainer**. This automatically sets up Node.js, pnpm, and a local MongoDB instance for you.

**Prerequisites:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [VS Code](https://code.visualstudio.com/)
- [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) for VS Code

**Steps:**
1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/preppal.git](https://github.com/your-username/preppal.git)
    ```
2.  **Open in VS Code**
    Open the cloned folder in VS Code. You should see a prompt: *"Folder contains a Dev Container configuration file. Reopen to develop in a container?"*
3.  **Click "Reopen in Container"**
    - VS Code will build the Docker image and start the MongoDB service automatically.
    - Dependencies will be installed via `pnpm install` automatically.
4.  **Refer to step 5 of the manual installation**

### Option B: Manual Installation

**Prerequisites:**
- Node.js (v18+)
- pnpm (`npm install -g pnpm`)
- MongoDB (Running locally or use Atlas URI)

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/preppal.git](https://github.com/your-username/preppal.git)
    cd preppal
    ```

2.  **Install Dependencies**
    Since this is a monorepo, running install at the root will install dependencies for frontend, backend, and shared packages.
    ```bash
    pnpm install
    ```

3.  **Build Shared Library**
    The frontend and backend rely on the shared schemas. You must build this package before running the apps.
    ```bash
    pnpm --filter @repo/shared build
    # OR if you prefer navigating manually:
    # cd shared && pnpm run build && cd ..
    ```

4.  **Database Seeding**
    To populate the database with the LGU locations, modules, and demo users:
    ```bash
    cd backend
    pnpm run seed
    ```

5.  **Run the Application**
    ```bash
    # Run Backend (Port 3000)
    cd backend
    pnpm run dev

    # Run Frontend (Port 5173)
    cd frontend
    pnpm run dev
    ```
---

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory:

### 1. Backend Configuration
Create a file named `.env` in the `backend/` directory and add the following:

```env
# Server Configuration
PORT=3000

# Database Connection
DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.km2i1yx.mongodb.net/preppal?appName=Cluster0

# Security
JWT_SECRET=<your_super_secret_string>

# Email Service (Resend)
RESEND_API_KEY=re_<your_resend_api_key>

# Image Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

### 2. Frontend Configuration
Create a file named `.env` in the `frontend/` directory and add the following:

```env
# API Connection
VITE_APP_API_URL=http://localhost:3000
```
