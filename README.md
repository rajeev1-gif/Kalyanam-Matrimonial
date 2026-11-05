# Kalyanam | Premium Indian Matrimonial Platform

A modern, full-stack, enterprise-grade matrimonial platform inspired by Shaadi.com, meticulously crafted with an elegant royal Indian wedding aesthetic, complete relational data modeling, real-time messaging, and multi-tier membership management.

---

## 🌟 Key Architecture & Highlights

- **Frontend**: React.js with Vite, Tailwind CSS, Lucide React icons, Axios, and Socket.IO client.
- **Backend**: Node.js, Express.js REST API with input validation, rate limiting, and centralized error handling.
- **Database**: PostgreSQL with Prisma ORM (24 normalized relational models, enum constraints, foreign keys, and indexes).
- **Real-Time Communication**: Socket.IO integration for live messaging, online status indicators, and typing notifications.
- **Security & Privacy**: JWT authentication, bcrypt password hashing, role-based authorization (USER / ADMIN), protected contact revelations (email & phone concealed until mutual match or VIP subscription).
- **Design System**: Royal Indian wedding luxury theme featuring Ivory, Deep Rose / Maroon, Champagne Gold, and Charcoal accents with Google Fonts (*Playfair Display*, *Cinzel*, *Plus Jakarta Sans*).

---

## 📁 Project Structure

```text
matrimonial-platform/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── assets/            # Static image assets
│   │   ├── components/
│   │   │   ├── common/        # Navbar, Footer, ProfileCard, Badge
│   │   │   ├── dashboard/     # DashboardSidebar, Widgets
│   │   │   └── search/        # SearchFilters, SortBar
│   │   ├── context/           # AuthContext, SocketContext, NotificationContext
│   │   ├── layouts/           # PublicLayout, DashboardLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── public/        # HomePage, LoginPage, RegisterPage, SearchPage, SuccessStories, Plans
│   │   │   ├── dashboard/     # DashboardOverview, MyProfile, EditProfileWizard, Messages, etc.
│   │   │   ├── profile/       # ProfileDetailPage
│   │   │   └── admin/         # AdminDashboard, Users, Profiles, Reports, Plans, Content
│   │   ├── routes/            # AppRoutes, ProtectedRoute, AdminRoute
│   │   ├── services/          # Axios API modules (auth, profile, search, chat, etc.)
│   │   └── styles/            # Tailwind CSS directives & custom gradients
│   └── vite.config.js         # Proxy configuration for API & uploads
│
├── server/                     # Express REST Backend
│   ├── prisma/
│   │   ├── schema.prisma      # 24 Relational models & enums
│   │   └── seed.js            # Comprehensive demo data seed script
│   ├── src/
│   │   ├── config/            # Prisma client instance
│   │   ├── controllers/       # Auth, Profile, Search, Interest, Chat, Admin, etc.
│   │   ├── middleware/        # JWT Auth, Role checking, Multer upload, Error handler
│   │   ├── routes/            # Express routers
│   │   ├── sockets/           # Socket.IO connection & messaging events
│   │   └── utils/             # Response helper utilities
│   └── uploads/               # Profile photo storage directory
│
├── test_full_suite.js         # Automated 25-point integration test suite
└── README.md
```

---

## 🔑 Demo Accounts (Pre-Seeded)

The database includes rich, authentic seed data. You can log in using the 1-click pills on the login screen or manually:

| Role / Profile | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@matrimonial.com` | `Password@123` | Full Admin Console (`/admin`), Analytics, User & Profile Moderation |
| **Groom (Aditya)** | `aditya.verma@example.com` | `Password@123` | Gold Member, IIT Bombay CS / Google Manager, Bangalore |
| **Bride (Dr. Ananya)** | `ananya.sharma@example.com` | `Password@123` | Silver Member, AIIMS Pediatrician, South Delhi |
| **Groom (Rohan)** | `rohan.mehta@example.com` | `Password@123` | VP Goldman Sachs Mumbai, IIM Ahmedabad |
| **Bride (Priya)** | `priya.nair@example.com` | `Password@123` | Staff UX Designer Razorpay, NID Ahmedabad |

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **PostgreSQL**: v14+ (running locally on port `5432` or `5433`)

### 2. Configure Environment Variables
Inside `server/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres@127.0.0.1:5433/matrimonial_db?schema=public"
JWT_SECRET="matrimonial_jwt_super_secret_key_2026_indian_wedding"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
RAZORPAY_KEY_ID="rzp_test_placeholder_key"
RAZORPAY_KEY_SECRET="rzp_test_placeholder_secret"
```

### 3. Initialize & Seed Database
```powershell
# Navigate to server
cd server

# Push schema to PostgreSQL
npx prisma db push

# Run seed script to load 12 profiles, plans, and interactions
node prisma/seed.js
```

### 4. Run Backend Server
```powershell
cd server
node src/index.js
# Output: 🚀 Kalyanam Matrimonial Server running on port 5000
```

### 5. Run Frontend Development Server
```powershell
cd client
npm run dev
# Vite runs at http://localhost:5173
```

---

## 🧪 Automated Integration Tests

A standalone 25-point end-to-end integration test is provided:
```powershell
node test_full_suite.js
```
Verifies:
1. Server health check
2. Public statistics
3. Admin authentication
4. Groom & Bride authentication
5. Registration & Profile creation
6. 8-step wizard update & completeness calculation
7. Public profile view with privacy shielding
8. Search engine with multi-filtering (gender, age, community, location)
9. Matchmaking recommendation engine
10. Interest dispatch, incoming list, and acceptance
11. Mutual connection establishment & contact reveal
12. Real-time messaging delivery & unread counting
13. Shortlist toggling and retrieval
14. In-app notification triggers
15. Order generation & payment activation (Free, Silver, Gold, Platinum)
16. Admin analytics metrics, user moderation, and profile verification

---

## 💎 Features Checklist

- [x] **Homepage (14 sections)**: Royal hero banner, quick search form, How It Works, Featured Profiles, Recent Profiles, Why Choose Us, Success Stories, Membership Plans, Testimonials, FAQ accordion, Footer trust badges.
- [x] **Authentication**: Register on behalf of Myself / Son / Daughter / Sibling / Relative, Login, Logout, Forgot Password, Reset Password.
- [x] **8-Step Wizard**: Basic Info, Religion & Community, Education & Career, Location, Family Details, Lifestyle, About Me, Photo Gallery.
- [x] **Search Engine**: Multi-filter by age, height, religion, caste, occupation, location, diet, keyword. Sort by recent, age, and completeness.
- [x] **Real-Time Chat**: Socket.IO messaging with read status, unread badges, and typing indicators.
- [x] **Interest Management**: Pending, Accepted, Rejected, Withdrawn states with real-time alerts.
- [x] **Shortlist & Views**: Save favorites, track profile view history with 1-hour duplicate protection.
- [x] **Membership & Payments**: Free, Silver, Gold, and Platinum tiers with dynamic quota deductions and Razorpay checkout architecture.
- [x] **Admin Console**: Analytics dashboard, User accounts management, Profile verification toggle, Reported accounts resolution, and dynamic Plan editing.

---

## 📜 License
Developed as an enterprise-grade matrimonial demonstration platform. All rights reserved.

