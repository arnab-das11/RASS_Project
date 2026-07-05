# 🎓 RASS - Learning Management System

<div align="center">

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-61DAFB?style=flat-square&logo=react)](https://mern.io)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0+-13AA52?style=flat-square&logo=mongodb)](https://www.mongodb.com)
[![React](https://img.shields.io/badge/React-19.1+-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Express.js](https://img.shields.io/badge/Express.js-4.19+-000000?style=flat-square&logo=express)](https://expressjs.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**A comprehensive, modern Learning Management System (LMS) built with the MERN stack, featuring role-based access control, AI-powered quiz generation, and cloud-based media management.**

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [API Reference](#api-reference) • [Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running the Application](#running-the-application)
- [Folder Structure](#folder-structure)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
- [User Roles & Workflows](#user-roles--workflows)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 📖 About the Project

**RASS** (Responsive AI-powered Structured Schooling) is a **production-ready Learning Management System** designed to bridge the gap between educators and learners in the digital age. It empowers instructors to create structured online courses with multimedia content, while enabling learners to engage with educational material through interactive quizzes, progress tracking, and digital certification.

### The Problem It Solves

Traditional online learning platforms lack intelligent course moderation, seamless content delivery, and AI-assisted assessment. RASS provides:

- 🎯 **Smart Course Moderation** - Admin approval workflows ensure content quality
- 🤖 **AI-Powered Assessments** - Auto-generated quizzes via Google Gemini
- 📊 **Progress Analytics** - Real-time tracking at the content level
- 🎓 **Digital Credentials** - Automated PDF certificates on course completion
- 🌍 **Global Reach** - Support for 3 languages (English, Hindi, Bengali)

### Target Audience

- **Educators & Trainers** - Create and monetize online courses
- **Organizations** - Internal training programs and upskilling initiatives
- **Learners** - Access quality education from anywhere
- **Administrators** - Manage platform content and users

---

## ✨ Features

### 🎓 Learner Features

- ✅ **Course Discovery & Enrollment** - Browse approved courses by category, search, and enroll with one click
- ✅ **Progress Tracking** - Mark videos, resources, and links as complete with visual progress bars
- ✅ **AI-Generated Quizzes** - Automatic quiz creation from lecture content using Google Gemini
- ✅ **Digital Certificates** - PDF certificates auto-generated upon 100% course completion
- ✅ **Resource Downloads** - Download course materials (PDFs, documents, etc.)
- ✅ **Course Management** - Enroll, unenroll, and track multiple courses simultaneously
- ✅ **Multi-Language Support** - Switch between English, Hindi, and Bengali interfaces
- ✅ **Google OAuth Integration** - Single-click sign-up and login via Google

### 👨‍🏫 Instructor Features

- ✅ **Course Creation** - Build courses with title, description, objectives, pricing, and difficulty levels
- ✅ **Multimedia Lectures** - Upload videos, resources (PDFs, documents), and external links
- ✅ **Course Management** - Organize lectures into sections, edit content, and manage course status
- ✅ **Cloudinary Integration** - Seamless file uploads with automatic cloud storage
- ✅ **Deletion Requests** - Request course deletion with admin oversight
- ✅ **Instructor Dashboard** - View all courses with status badges (Pending, Approved, Rejected, Deleting)
- ✅ **Real-time Feedback** - See enrollment numbers and student engagement metrics
- ✅ **Multi-Language Interface** - Create courses in multiple languages

### 👨‍💼 Admin Features

- ✅ **Course Moderation** - Approve, reject, or request changes to new course submissions
- ✅ **User Management** - View all learners and instructors, manage enrollments
- ✅ **Analytics Dashboard** - Visualize user distribution, course categories, and platform metrics
- ✅ **Content Management** - Edit course details, force delete courses, and manage resources
- ✅ **Deletion Workflows** - Approve or reject instructor deletion requests
- ✅ **Platform Statistics** - Real-time counts of users, courses, and engagement metrics

### 🔐 Security & Authentication

- ✅ **JWT Authentication** - Secure token-based user sessions (30-day expiry)
- ✅ **Bcrypt Password Hashing** - Industry-standard password encryption with 10 salt rounds
- ✅ **Google OAuth 2.0** - Secure third-party authentication with role restrictions
- ✅ **Role-Based Access Control (RBAC)** - Learner, Instructor, and Admin roles with distinct permissions
- ✅ **Protected Routes** - Frontend route protection enforces authorization checks
- ✅ **Secure API Endpoints** - Backend validates user roles and permissions for all operations

---

## 🛠️ Tech Stack

### **Frontend**

| Technology              | Purpose                                           | Version     |
| ----------------------- | ------------------------------------------------- | ----------- |
| **React**               | UI library for building interactive components    | 19.1+       |
| **Vite**                | Lightning-fast build tool and dev server          | 7.1+        |
| **Tailwind CSS**        | Utility-first CSS framework for responsive design | 4.1+        |
| **Framer Motion**       | Smooth animations and transitions                 | 12.23+      |
| **React Router**        | Client-side routing and navigation                | 7.8+        |
| **Recharts**            | Composable charting library for admin analytics   | 3.8+        |
| **i18next**             | Internationalization framework (3 languages)      | 25.6+       |
| **Axios**               | Promise-based HTTP client for API calls           | 1.13+       |
| **jsPDF + html2canvas** | PDF certificate generation                        | 4.2+ / 1.4+ |
| **React Player**        | Video player component                            | 3.3+        |
| **Lucide React**        | Icon library (24x24px consistent icons)           | 0.548+      |
| **Google OAuth**        | OAuth 2.0 authentication                          | 0.13+       |

### **Backend**

| Technology               | Purpose                                  | Version |
| ------------------------ | ---------------------------------------- | ------- |
| **Express.js**           | Lightweight web framework for Node.js    | 4.19+   |
| **Node.js**              | JavaScript runtime environment           | 18+     |
| **MongoDB + Mongoose**   | NoSQL database with object modeling      | 8.2+    |
| **JWT (jsonwebtoken)**   | JSON Web Token creation and verification | 9.0+    |
| **Bcryptjs**             | Password hashing library                 | 3.0+    |
| **Cloudinary**           | Cloud-based image & video storage        | 1.41+   |
| **Multer**               | Middleware for file uploads              | 2.0+    |
| **Google Generative AI** | Gemini API for quiz generation           | 0.24+   |
| **Google Auth Library**  | OAuth 2.0 token verification             | 10.6+   |
| **CORS**                 | Cross-Origin Resource Sharing middleware | 2.8+    |
| **Dotenv**               | Environment variable management          | 16.4+   |
| **Nodemon**              | Development server auto-reload           | 3.1+    |

### **Database**

| Technology        | Purpose                              |
| ----------------- | ------------------------------------ |
| **MongoDB Atlas** | Cloud-hosted NoSQL database          |
| **Mongoose**      | Schema-based MongoDB object modeling |

### **External Services**

| Service              | Purpose                                    |
| -------------------- | ------------------------------------------ |
| **Google OAuth 2.0** | Learner authentication via Google accounts |
| **Google Gemini AI** | AI quiz generation from course content     |
| **Cloudinary API**   | Cloud storage for videos and resources     |

---

## 🏗️ Project Architecture

### **System Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────────┐
│                        RASS LMS SYSTEM                              │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│    FRONTEND (React)      │         │   BACKEND (Express)      │
│  ┌────────────────────┐  │         │  ┌────────────────────┐  │
│  │  Public Pages      │  │◄────────┤──│  User Routes       │  │
│  │  - HomePage        │  │ HTTP    │  │  - Register/Login  │  │
│  │  - CoursePage      │  │ API     │  │  - Enrollment      │  │
│  │  - ContactPage     │  │ Calls   │  │  - Progress Track  │  │
│  ├────────────────────┤  │◄────────┤──│────────────────────┤  │
│  │  Auth Pages        │  │         │  │  Course Routes     │  │
│  │  - SignUp (3 roles)│  │◄────────┤──│  - CRUD Operations │  │
│  │  - Login           │  │         │  │  - Add Lectures    │  │
│  ├────────────────────┤  │         │  ├────────────────────┤  │
│  │  Protected Pages   │  │◄────────┤──│  Admin Routes      │  │
│  │  - L-Dashboard     │  │         │  │  - Approve Courses │  │
│  │  - I-Dashboard     │  │         │  │  - Moderation      │  │
│  │  - A-Dashboard     │  │         │  │  - Analytics       │  │
│  └────────────────────┘  │         │  └────────────────────┘  │
└──────────────┬───────────┘         └──────────────┬───────────┘
               │                                    │
               │         JWT Token                  │
               │◄───────────────────────────────────┤
               │                                    │
               └────────────────────┬───────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
            │  MongoDB     │ │ Cloudinary│ │Google Gemini│
            │  Database    │ │ File      │ │ AI Quiz     │
            │  (User,      │ │ Storage   │ │ Generation  │
            │   Course)    │ │ (Videos,  │ │             │
            │              │ │ Resources)│ │             │
            └──────────────┘ └───────────┘ └─────────────┘
```

### **Data Flow Examples**

#### Learner Enrollment Flow

```
1. Learner browses CoursePage
   ↓
2. Frontend: GET /api/courses (fetches approved courses)
   ↓
3. Learner clicks "Enroll"
   ↓
4. Frontend: POST /api/users/enroll (with courseId)
   ↓
5. Backend: Adds courseId to user.enrolledCourses
   ↓
6. Learner navigates to LearnerDashboard
   ↓
7. Frontend: GET /api/users/:id/enrolled
   ↓
8. Backend: Returns user's enrolled courses
   ↓
9. Dashboard displays all courses with progress bars
```

#### Course Creation & Approval Workflow

```
1. Instructor fills course form (title, description, thumbnail, objectives)
   ↓
2. Frontend: POST /api/courses (multipart FormData with file)
   ↓
3. Backend: Uploads thumbnail to Cloudinary, saves course with status='pending'
   ↓
4. Course appears in Instructor Dashboard under "Pending Review"
   ↓
5. Instructor adds lectures: POST /api/courses/:id/lectures
   ↓
6. Backend: Uploads videos/resources to Cloudinary, stores references
   ↓
7. Admin reviews in Admin Dashboard: GET /api/courses/pending
   ↓
8. Admin clicks approve: PUT /api/courses/:id/status
   ↓
9. Backend: status changes from 'pending' to 'approved'
   ↓
10. Course now visible in public CoursePage
```

#### AI Quiz & Certificate Generation

```
1. Learner completes all course content (100% progress)
   ↓
2. Frontend: POST /api/ai/generate-quiz
   ↓
3. Backend: Calls Google Gemini API with course/lecture info
   ↓
4. Gemini generates multiple-choice quiz (fallback: 3-flash → 1.5-flash)
   ↓
5. Frontend displays quiz modal
   ↓
6. Learner answers questions
   ↓
7. Frontend validates answers and marks content complete
   ↓
8. Frontend: PUT /api/users/progress (marks content complete)
   ↓
9. When progress reaches 100%: Show certificate button
   ↓
10. Learner clicks "Generate Certificate"
    ↓
11. Frontend: Uses jsPDF + html2canvas to generate PDF
    ↓
12. Browser downloads certificate as "{CourseName}_Certificate.pdf"
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18.0 or higher ([Download](https://nodejs.org))
- **npm** v9+ or **yarn** v3+ (comes with Node.js)
- **MongoDB** - Local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud account
- **Git** for version control
- **Cloudinary Account** ([Free tier available](https://cloudinary.com/users/register_free))
- **Google OAuth Credentials** ([Setup guide](https://developers.google.com/identity/protocols/oauth2))
- **Google Gemini API Key** ([Get API key](https://makersuite.google.com/app/apikey))

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/RASS_Project.git
cd RASS_Project
```

#### 2. Backend Setup

Navigate to the Backend directory and install dependencies:

```bash
cd Backend
npm install
```

#### 3. Frontend Setup

Navigate to the Frontend directory and install dependencies:

```bash
cd ../Frontend
npm install
```

---

### Environment Setup

Create a `.env` file in both the **Backend** and **Frontend** directories with the required variables.

#### Backend `.env` File

Create `Backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rass_db?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_strong

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Gemini API (for AI quiz generation)
GEMINI_API_KEY=your_gemini_api_key

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

#### Frontend `.env.local` File

Create `Frontend/.env.local`:

```env
# Vite Configuration
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

**Important:**

- Never commit `.env` files to Git
- Add `.env` and `.env.local` to your `.gitignore`
- Use strong, unique values for `JWT_SECRET`
- Regenerate keys if accidentally exposed

---

### Running the Application

#### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Start Backend:**

```bash
cd Backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Start Frontend:**

```bash
cd Frontend
npm run dev
# Application runs on http://localhost:5173
```

#### Option 2: Run Both Concurrently (from root directory)

First, ensure both `Backend/package.json` and `Frontend/package.json` have proper dev scripts, then run:

```bash
# From the root RASS_Project directory
cd Backend && npm run dev &
cd ../Frontend && npm run dev
```

#### Option 3: Production Build

**Build Frontend:**

```bash
cd Frontend
npm run build
# Output: dist/ folder ready for deployment
```

**Start Backend for Production:**

```bash
cd Backend
npm start
# Ensure NODE_ENV=production in .env
```

---

## 📂 Folder Structure

```
RASS_Project/
│
├── Backend/                          # Express.js + MongoDB Backend
│   ├── config/
│   │   └── cloudinary.js             # Cloudinary configuration
│   │
│   ├── controllers/                  # Business logic
│   │   ├── userController.js         # User auth, enrollment, progress
│   │   ├── courseController.js       # Course CRUD, status management
│   │   ├── aiController.js           # AI quiz generation
│   │   └── adminController.js        # Admin analytics & stats
│   │
│   ├── models/                       # Mongoose schemas
│   │   ├── User.js                   # User schema (learner, instructor, admin)
│   │   └── Course.js                 # Course schema with lectures
│   │
│   ├── routes/                       # API endpoints
│   │   ├── userRoutes.js             # /api/users
│   │   ├── courseRoutes.js           # /api/courses
│   │   ├── aiRoutes.js               # /api/ai
│   │   └── adminRoutes.js            # /api/admin
│   │
│   ├── package.json                  # Backend dependencies
│   ├── server.js                     # Express app entry point
│   ├── .env                          # Environment variables (not in repo)
│   └── .gitignore
│
├── Frontend/                         # React + Vite Frontend
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Navbar.jsx            # Navigation bar with language selector
│   │   │   ├── Header.jsx            # Hero section
│   │   │   ├── Footer.jsx            # Footer
│   │   │   ├── ProtectedRoute.jsx    # Route protection wrapper
│   │   │   ├── FeedbackSection.jsx
│   │   │   ├── SponsorSection.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── List.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx   # Admin panel with charts
│   │   │       └── AdminSignUp.jsx      # Admin authentication
│   │   │
│   │   ├── pages/                    # Full-page components
│   │   │   ├── HomePage.jsx          # Landing page
│   │   │   ├── CoursePage.jsx        # Course catalog
│   │   │   ├── ContactPage.jsx
│   │   │   ├── FeaturesPage.jsx
│   │   │   └── instructors/
│   │   │       ├── InstructorDashboard.jsx    # Instructor panel
│   │   │       ├── InstructorCoursePage.jsx   # Create/edit courses
│   │   │       └── InstructorSignUp.jsx       # Instructor registration
│   │   │   └── learners/
│   │   │       ├── LearnerDashboard.jsx       # Learner panel
│   │   │       ├── CourseDetailsPage.jsx      # Course view
│   │   │       └── LearnerSignUp.jsx          # Learner registration
│   │   │
│   │   ├── i18n/                     # Internationalization
│   │   │   ├── en.json               # English translations
│   │   │   ├── hi.json               # Hindi translations
│   │   │   ├── bn.json               # Bengali translations
│   │   │   └── i18n.js               # i18next configuration
│   │   │
│   │   ├── assets/
│   │   │   ├── certificateTemplate.js # PDF certificate template
│   │   │   └── images/
│   │   │
│   │   ├── App.jsx                   # Main app routing & OAuth wrapper
│   │   ├── App.css                   # Global styles
│   │   ├── index.css                 # Base styles
│   │   └── main.jsx                  # React entry point
│   │
│   ├── public/                       # Static assets
│   │   └── Home_Card/
│   │
│   ├── package.json                  # Frontend dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── eslint.config.js              # ESLint rules
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── .env.local                    # Environment variables (not in repo)
│   ├── .gitignore
│   ├── index.html
│   └── README.md
│
├── LICENSE                           # MIT License
├── .gitignore                        # Global git ignore
└── README.md                         # This file

```

---

## 🔄 How It Works

### Authentication & User Roles

#### 1. **Sign Up / Login**

**For Learners:**

- Email/Password signup with bcrypt hashing
- Or Google OAuth (sign in with Google)
- Role automatically set to 'learner'

**For Instructors:**

- Email/Password signup only
- Role set to 'instructor'
- Cannot use Google OAuth

**For Admins:**

- Email/Password only (hardest security)
- Role set to 'admin'
- Cannot use Google OAuth
- Limited sign-up (controlled by existing admins)

#### 2. **JWT Token Flow**

```
Login/Signup → Backend validates credentials → JWT generated (30-day expiry)
                  ↓
Token stored in localStorage → Attached to all API requests
                  ↓
ProtectedRoute checks token & role → Renders dashboard or redirects to home
```

#### 3. **Role-Based Access Control**

| Route                   | Learner | Instructor | Admin |
| ----------------------- | ------- | ---------- | ----- |
| `/` (Home)              | ✅      | ✅         | ✅    |
| `/courses`              | ✅      | ✅         | ✅    |
| `/learner-dashboard`    | ✅      | ❌         | ❌    |
| `/instructor-dashboard` | ❌      | ✅         | ❌    |
| `/admin-dashboard`      | ❌      | ❌         | ✅    |

### Course Workflow

#### Instructor → Creates Course

1. Fill course form (title, description, category, level, duration, price, objectives, thumbnail)
2. Submit → Stored in DB with status='pending'
3. Add lectures (videos, resources, links)
4. Awaits admin approval

#### Admin → Reviews & Approves

1. View pending courses in admin dashboard
2. Review course content and requirements
3. Approve (status='approved') or Reject (status='rejected')
4. If approved, course appears in public catalog

#### Learner → Enrolls & Learns

1. Browse courses on CoursePage
2. Click "Enroll" on course card
3. Course added to enrolledCourses array
4. Access course in LearnerDashboard
5. Watch videos, download resources, complete content
6. Mark items as complete to track progress

#### Completion & Certification

1. **Chronological Progression**: Lessons must be completed in order. Future lessons remain locked until preceding ones are marked complete.
2. **Verify Mastery (Lesson Quiz)**: To complete a lesson (video, resource, or link), the learner must answer 1 AI-generated MCQ correctly.
3. **10 MCQ Final Exam**: Once all lessons in the course are completed (100% progress), the student must pass a 10 MCQ Final Exam (passing score is >= 70%).
4. **Failure & Retake**: If the learner fails the final exam, they can retake it. A new randomized set of 10 questions is generated by Gemini AI for each attempt.
5. **Certificate Issuance**: Once the final exam is passed, the certificate downloader is unlocked, allowing the custom PDF to be generated and downloaded.

### Content Management

**Video Uploads:**

- Cloudinary stores videos (autoplay disabled, adaptive bitrate)
- URL stored in course.lectures[].videos[]
- 100MB file size limit

**Resource Uploads:**

- PDFs, documents stored in Cloudinary
- Learners can download directly
- File type validated on upload

**External Links:**

- Added manually by instructors
- Can link to webinars, external content, etc.

---

## 📡 API Reference

### User Routes (`/api/users/`)

| Method | Endpoint        | Description                                  | Auth Required |
| ------ | --------------- | -------------------------------------------- | ------------- |
| `POST` | `/register`     | Register new user (learner/instructor)       | ❌            |
| `POST` | `/login`        | Login with email/password                    | ❌            |
| `POST` | `/google-login` | Google OAuth authentication                  | ❌            |
| `GET`  | `/`             | Fetch all users (populated with enrollments) | ✅ (Admin)    |
| `POST` | `/enroll`       | Enroll learner in course                     | ✅ (Learner)  |
| `GET`  | `/:id/enrolled` | Get learner's enrolled courses               | ✅ (Learner)  |
| `PUT`  | `/progress`     | Mark content as complete                     | ✅ (Learner)  |
| `POST` | `/unenroll`     | Drop course (remove enrollment)              | ✅ (Learner)  |
| `PUT`  | `/pass-exam`    | Mark final exam as passed for a course       | ✅ (Learner)  |

### Course Routes (`/api/courses/`)

| Method   | Endpoint                    | Description                              | Auth Required   |
| -------- | --------------------------- | ---------------------------------------- | --------------- |
| `GET`    | `/`                         | Fetch all approved courses (public)      | ❌              |
| `GET`    | `/pending`                  | Fetch pending & deletion_pending courses | ✅ (Admin)      |
| `POST`   | `/`                         | Create new course (multipart)            | ✅ (Instructor) |
| `GET`    | `/:id`                      | Fetch course details                     | ❌              |
| `GET`    | `/instructor/:instructorId` | Fetch instructor's courses               | ✅ (Instructor) |
| `PUT`    | `/:id`                      | Edit course details                      | ✅ (Admin)      |
| `PUT`    | `/:id/status`               | Approve/Reject/Delete course             | ✅ (Admin)      |
| `PUT`    | `/:id/request-delete`       | Request course deletion                  | ✅ (Instructor) |
| `POST`   | `/:id/lectures`             | Add lecture with videos/resources        | ✅ (Instructor) |
| `DELETE` | `/:id`                      | Force delete course                      | ✅ (Admin)      |

### AI Routes (`/api/ai/`)

| Method | Endpoint         | Description                          | Auth Required |
| ------ | ---------------- | ------------------------------------ | ------------- |
| `POST` | `/generate-quiz` | Generate AI quiz from course/lecture | ✅ (Learner)  |
| `POST` | `/generate-final-exam` | Generate AI 10 MCQ final exam from course data | ✅ (Learner)  |

**Quiz Generation Request:**

```json
{
  "courseTitle": "Web Development Basics",
  "lectureTitle": "Introduction to HTML",
  "courseDescription": "Learn web development from scratch"
}
```

**Quiz Response:**

```json
{
  "question": "What is HTML?",
  "options": ["Markup language", "Programming language", "Database", "Browser"],
  "correctAnswer": 0,
  "hint": "HTML stands for HyperText Markup Language"
}
```

### Admin Routes (`/api/admin/`)

| Method | Endpoint | Description                | Auth Required |
| ------ | -------- | -------------------------- | ------------- |
| `GET`  | `/stats` | Fetch dashboard statistics | ✅ (Admin)    |

**Stats Response:**

```json
{
  "totalLearners": 150,
  "totalInstructors": 25,
  "activeCourses": 45,
  "pendingCourses": 8
}
```

---

## 👥 User Roles & Workflows

### 🎓 Learner Workflow

```
1. Sign up (Email/Password or Google)
   ↓
2. Browse courses on CoursePage
   ↓
3. Enroll in course of interest
   ↓
4. Access course in LearnerDashboard
   ↓
5. Watch lecture videos
   ↓
6. Download course resources (PDFs, docs)
   ↓
7. Visit external links provided by instructor
   ↓
8. Mark content as complete
   ↓
9. Once all complete, take AI-generated quiz
   ↓
10. Pass quiz → Unlock certificate
    ↓
11. Generate & download PDF certificate
    ↓
12. Unenroll from course (optional)
```

### 👨‍🏫 Instructor Workflow

```
1. Sign up with email/password
   ↓
2. Access InstructorDashboard
   ↓
3. Click "Create Course"
   ↓
4. Fill course details:
   - Title, description, category
   - Level (Beginner/Intermediate/Advanced)
   - Duration, price, learning objectives
   - Upload thumbnail
   ↓
5. Submit course (status='pending')
   ↓
6. Add lectures:
   - Upload videos to each section
   - Add downloadable resources
   - Add external links
   ↓
7. Await admin approval
   ↓
8. Once approved:
   - Course visible in public catalog
   - Can see enrolled learners
   - Monitor completion metrics
   ↓
9. Can request course deletion (admin approval needed)
   ↓
10. Or edit course details anytime
```

### 👨‍💼 Admin Workflow

```
1. Login with email/password
   ↓
2. Access AdminDashboard with 3 tabs:
   ↓
   A. Dashboard Tab:
      - View user distribution (pie chart)
      - View courses by category (bar chart)
      - See key statistics
   ↓
   B. Pending Courses Tab:
      - Review new course submissions
      - Review deletion requests
      - Approve: makes course public
      - Reject: returns to pending (instructor can edit)
      - Delete (if deletion_pending)
   ↓
   C. Users Tab:
      - View all learners
      - View all instructors
      - Click user → see enrollments & progress
      - Unenroll learners from courses
   ↓
3. Edit any course details
   ↓
4. Force delete courses if needed
   ↓
5. Monitor platform health & metrics
```

---

## 🎯 Key Features Deep Dive

### AI Quiz Generation

**How It Works:**

1. Learner completes all course content (100% progress)
2. Completion triggers AI quiz modal
3. Frontend sends course/lecture details to backend
4. Backend calls Google Gemini API
5. Gemini generates multiple-choice quiz (4 options, 1 correct answer)
6. Fallback chain if quota exceeded: 3-flash → 3.1-flash-lite → 1.5-flash
7. Frontend displays quiz with instant feedback
8. Correct answers mark content as complete

### Certificate Generation

**Process:**

1. Uses **jsPDF** + **html2canvas** libraries
2. Loads certificate template (customizable background image)
3. Inserts learner name, course title, completion date
4. Renders as PDF with professional formatting
5. Triggered automatic browser download

**Certificate Details:**

- File name: `{CourseName}_Certificate.pdf`
- Includes: Learner name, course title, completion date, achievement seal
- Can be printed or shared digitally

### Multilingual Support

**Supported Languages:**

- 🇬🇧 **English** (default)
- 🇮🇳 **Hindi** (हिंदी)
- 🇧🇩 **Bengali** (বাংলা)

**Implementation:**

- Uses **react-i18next** framework
- Translation files: `src/i18n/en.json`, `hi.json`, `bn.json`
- Language selector in Navbar
- Persisted in localStorage
- Seamless UI updates across all pages

### Cloudinary Integration

**Features:**

- Automatic image optimization
- Responsive video delivery
- Secure URL generation
- File type validation
- 100MB upload limit per file
- Automatic resource management

**Usage:**

- Course thumbnails
- Lecture videos
- Resource files (PDFs, documents)
- User profile pictures

---

## 🚧 Future Improvements

### Planned Features (v2.0)

- [ ] **Live Classes** - Video conferencing integration (Jitsi or Zoom)
- [ ] **Discussion Forums** - Peer-to-peer course discussion boards
- [ ] **Student Reviews** - Rating and review system for courses
- [ ] **Payment Integration** - Stripe/Razorpay for paid courses
- [ ] **Certificates with Blockchain** - Verified digital credentials
- [ ] **Mobile App** - React Native iOS/Android applications
- [ ] **Advanced Analytics** - Heatmaps, time-on-page tracking
- [ ] **Batch Processing** - Course releases and schedules
- [ ] **Peer Grading** - Instructor and peer assessment workflows
- [ ] **Gamification** - Badges, leaderboards, achievement system
- [ ] **API Documentation** - Swagger/OpenAPI specifications
- [ ] **Email Notifications** - Enrollment, completion, deadline reminders

### Performance Optimizations

- [ ] Implement Redis caching for frequently accessed data
- [ ] Add pagination for large course lists
- [ ] Lazy load course thumbnails and videos
- [ ] Optimize database queries with indexing
- [ ] Implement CDN for static assets

### Security Enhancements

- [ ] Add rate limiting on API endpoints
- [ ] Implement HTTPS enforcement
- [ ] Add two-factor authentication (2FA)
- [ ] Audit logging for admin actions
- [ ] GDPR compliance features

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

### Steps to Contribute

1. **Fork the Repository**

   ```bash
   git clone https://github.com/yourusername/RASS_Project.git
   cd RASS_Project
   ```

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Write clean, well-documented code
   - Follow existing code style
   - Test your changes thoroughly

4. **Commit Your Changes**

   ```bash
   git commit -m "Add: Brief description of your feature"
   ```

5. **Push to Your Branch**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Request review from maintainers

### Contribution Guidelines

- Follow the existing code structure
- Add comments for complex logic
- Update documentation if needed
- Test edge cases
- Ensure no console errors or warnings

### Code Standards

- **Frontend**: Follow React best practices, use functional components with hooks
- **Backend**: Use async/await, proper error handling, validation middleware
- **Naming**: Use descriptive names (no single-letter variables except loops)
- **Comments**: Write meaningful comments for non-obvious code

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

The MIT License allows you to:

- ✅ Use the software commercially
- ✅ Modify the software
- ✅ Distribute copies
- ✅ Include the software in proprietary projects

With the conditions:

- ⚠️ Include license and copyright notice
- ⚠️ State changes made to the code

---

## 📞 Contact & Support

### Get in Touch

- **Email**: your.email@example.com
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **LinkedIn**: [Your Name](https://linkedin.com/in/yourprofile)
- **Portfolio**: [yourwebsite.com](https://yourwebsite.com)

### Report Issues

Found a bug? Have a feature request? Please open an [Issue](https://github.com/yourusername/RASS_Project/issues) on GitHub.

### Support

For questions or help:

1. Check existing [Issues](https://github.com/yourusername/RASS_Project/issues)
2. Search [Discussions](https://github.com/yourusername/RASS_Project/discussions)
3. Feel free to reach out via email

---

## 🙏 Acknowledgments

### Libraries & Services

- [React](https://react.dev) - UI framework
- [Express.js](https://expressjs.com) - Backend framework
- [MongoDB](https://www.mongodb.com) - Database
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Google Gemini](https://gemini.google.com) - AI quiz generation
- [Cloudinary](https://cloudinary.com) - Media storage
- [Framer Motion](https://www.framer.com/motion) - Animations
- [Recharts](https://recharts.org) - Data visualization

### Contributors

Thank you to everyone who has contributed to this project!

---

<div align="center">

### ⭐ If you found this project helpful, please consider giving it a star! ⭐

[Star on GitHub](https://github.com/yourusername/RASS_Project) • [Report Issue](https://github.com/yourusername/RASS_Project/issues) • [Contribute](https://github.com/yourusername/RASS_Project/pulls)

**Made with ❤️ by Your Team**

</div>

---

## 📊 Project Statistics

- **Total Files**: 60+ component and logic files
- **Lines of Code**: 10,000+ (Backend & Frontend combined)
- **API Endpoints**: 20+ RESTful routes
- **Supported Languages**: 3 (English, Hindi, Bengali)
- **Database Collections**: 2 (Users, Courses)
- **External Integrations**: 3 (Google OAuth, Gemini AI, Cloudinary)
- **Authentication Methods**: 2 (Email/Password, Google OAuth)
- **User Roles**: 3 (Learner, Instructor, Admin)

---

**Last Updated**: July 2026  
**Version**: 1.0.0  
**Maintenance Status**: ✅ Active Development
