# 🎓 RASS - Learning Management System

<div align="center">

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-61DAFB?style=flat-square&logo=react)](https://mern.io)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0+-13AA52?style=flat-square&logo=mongodb)](https://www.mongodb.com)
[![React](https://img.shields.io/badge/React-19.1+-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Express.js](https://img.shields.io/badge/Express.js-4.19+-000000?style=flat-square&logo=express)](https://expressjs.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**A comprehensive, modern Learning Management System (LMS) built with the MERN stack, featuring role-based access control, AI-powered quiz & final exam generation, speech-recognition oral assessments, a synchronized gamification engine, secure Razorpay checkouts with a 75% cashback refund flow, multi-user voice/text chat channels, dynamic course feedback/audio reviews, and cloud-based media management.**

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [API Reference](#api-reference) • [How It Works](#how-it-works) • [Contributing](#contributing)

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
  - [Systematic Progression & Lesson Locking](#1-systematic-progression--lesson-locking)
  - [AI Voice Oral Assessments](#2-ai-voice-oral-assessments)
  - [AI-Powered Course Recommendations](#3-ai-powered-course-recommendations)
  - [Gamification Engine](#4-gamification-engine)
  - [AI Final Exam & Failure Path](#5-ai-final-exam--failure-path)
  - [Premium Learning Hub & Player Layout](#6-premium-learning-hub--player-layout)
  - [Paid Courses, Razorpay, & 75% Cashback Reward Flow](#7-paid-courses-razorpay--75-cashback-reward-flow)
  - [Voice Messaging Q&A & Audio Course Feedback](#8-voice-messaging-qa--audio-course-feedback)
  - [Moderation Chat & Syllabus Previews](#9-moderation-chat--syllabus-previews)
  - [Overview & Analytics Views](#10-overview--analytics-views)
  - [Course Edit Permissions & Reset Flow](#11-course-edit-permissions--reset-flow)
  - [Safe Database Reset & Verification Code](#12-safe-database-reset--verification-code)
- [API Reference](#api-reference)
- [User Roles & Workflows](#user-roles--workflows)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 📖 About the Project

**RASS** (Responsive AI-powered Structured Schooling) is a **production-ready Learning Management System** designed to bridge the gap between educators and learners in the digital age. It empowers instructors to create structured online courses with multimedia content, while enabling learners to engage with educational material through interactive quizzes, progress tracking, voice-activated oral tests, gamified incentives, and digital certification.

### The Problem It Solves

Traditional online learning platforms lack structured progression control, interactive speaking feedback, and personalized recommendation workflows. RASS provides:

- 🎯 **Systematic Progression** - Enforces chronological completion to lock advanced lessons until prerequisites are met.
- 🎙️ **AI Voice Oral Assessments** - Real-time conceptual speaking checks utilizing browser SpeechRecognition and Gemini grading.
- 🤖 **AI-Powered Assessments** - Randomized 10-MCQ final exams dynamically generated based on course syllabus.
- 🏅 **Gamification Engine** - Tracks XP, dynamic level calculations, daily active streaks, and unlocks achievement medallion badges.
- 🧭 **AI course recommendations** - Recommends subsequent courses based on student profile history and custom skills tags.
- 🎓 **Digital Credentials** - Automated PDF certificates on course completion with verified final exam scores.
- 📊 **Progress Analytics & Summaries** - Real-time analytics charts and study summary drawers.
- 💳 **Razorpay & Cashback** - Secure payment integration with a unique **75% cashback refund flow** for completed courses.
- 💬 **Multimodal Messaging** - Support for asynchronous voice questions/answers and text messaging between learners, instructors, and admins.
- 📝 **Course Feedback & Audio Reviews** - Dynamic ratings aggregation featuring written and audio-recorded learner course feedback.

---

## ✨ Features

### 🎓 Learner Features

- ✅ **Systematic Course Progression** - Chronological lesson locking ensures students master basic material before advancing.
- ✅ **Premium Learning Hub** - Dual-pane workspace with left-side sticky lesson selector and right-side interactive workspace.
- ✅ **AI Voice Oral Assessments** - Microphone speaking check (or text fallbacks) to verify understanding of a lesson.
- ✅ **Interactive Local Notebook** - Markdown scratchpad that auto-saves student notes in local state per lesson.
- ✅ **AI Lesson Summary** - Sliding side-drawer that provides instant Gemini-generated study notes for active lessons.
- ✅ **Embedded YouTube & Video Support** - Responsive HTML5 video players supporting Cloudinary video uploads and inline YouTube iframe embeds.
- ✅ **AI-Generated Quizzes** - Single MCQ checks generated instantly after completing individual videos or resource downloads.
- ✅ **10 MCQ AI Final Exam** - Challenging randomized final exam with a 70% passing threshold, interactive timer, and retry paths.
- ✅ **Gamified Profile Dashboard** - Real-time XP tracking, dynamic Level badges, Streak flames, and 5 Medallion Badges.
- ✅ **Skills & Recommendations Hub** - Editable skills tags feed the recommendation model to suggest relevant catalog additions.
- ✅ **Digital Certificates** - Customized jsPDF certificates displaying student name, course title, and completion date.
- ✅ **Multi-Language Support** - Persistent language selector supporting English, Hindi, and Bengali interfaces.
- ✅ **Google OAuth Integration** - Seamless one-click registration and profile sync.
- ✅ **Razorpay Checkout & 75% Cashback Reward** - Enroll in premium paid courses using Razorpay and claim a 75% cashback refund immediately upon graduation.
- ✅ **Learner-Instructor Voice Messaging Q&A** - Record, transcribe, and exchange audio-based questions and answers directly with the instructor inside a dedicated Chat modal.
- ✅ **Course Feedback Surveys & Audio Reviews** - Submit written comments, like/rating status, and custom recorded audio course reviews.
- ✅ **Immediate Certificate Download & Countdown** - Enhanced success screen supporting instant manual PDF downloads and auto-close countdown.
- ✅ **Learner Analytics Dashboard** - Professional Overview tab featuring Recharts visualizations: Study Minutes (daily learning activity Bar chart), Skill Strength Matrix (Radar chart showing category lesson distribution), and Active Course Progress Comparison.
- ✅ **Global Peer Arena** - Live competitive scoreboard showcasing student rank, name, and total XP relative to peers.

### 👨‍🏫 Instructor Features

- ✅ **Course Blueprint Forge** - Define course title, description, objectives, category, level, duration, and upload thumbnail image.
- ✅ **Curriculum builder** - Create sections containing video lessons (Cloudinary or YouTube URL), resource files, and external web links.
- ✅ **Detailed Descriptions Input** - Set custom text explanations for every video, document, and link created.
- ✅ **Dashboard Analytics** - Review course status badges (Pending, Approved, Rejected, Deleting) and active enrollments.
- ✅ **Deletion Oversight Requests** - Submit formal deletion requests to admin moderators rather than direct destructions.
- ✅ **Admin-Instructor Chat Portal** - Message admins directly regarding course approvals, rejections, or deletion statuses, highlighted with unread message notifications.
- ✅ **Redesigned Sidebar & Rupee Conversions** - Navigate using a polished sidebar layout and manage course pricing automatically formatted with Rupee conversions.
- ✅ **Audio Feedbacks Review** - Playback audio reviews and read written ratings left by enrolled learners.
- ✅ **Instructor Analytics Overview** - Default Overview dashboard tracking active blueprints, total enrollment count, and approval statuses.
- ✅ **Student Progress Roster** - Full visibility into student lists enrolled in the instructor's courses, detailing their individual XP, current Level, and completion progress.
- ✅ **Course Edit Request System** - Request course edit authorization from admin moderators to tweak curriculum or update titles/descriptions/objectives/pricing.
- ✅ **Progression Reset Utility** - Decide whether to reset progression to 0% for active (non-graduated) learners when modifying course syllabus materials, while safely preserving certificates for graduates.

### 👨‍💼 Admin Features

- ✅ **Course Moderation Workspace** - Approve, reject, or request edits on newly submitted blueprints.
- ✅ **Deletion Approval Workflows** - Review instructor deletion requests and execute final database cleanups.
- ✅ **Interactive Analytics Dashboard** - Recharts pie charts displaying user distribution and category histograms.
- ✅ **User Management Board** - Inspect learners and instructors, inspect progress levels, and drop user enrollments.
- ✅ **Course Editing Portal** - Manually override course metadata and details.
- ✅ **Admin-Instructor Chat Support** - Real-time support dialogue directly from the moderator dashboard to coordinate blueprint revisions.
- ✅ **Course Syllabus Preview Modal** - Inspect course objectives, category, duration, and syllabus details in an overlay preview before making decisions.
- ✅ **Database User Reset Utility** - Clean up and purge user/learner data tables via a secure administrative action.
- ✅ **Admin Edit Request Moderation** - Review, approve, or deny instructor requests for editing approved courses.
- ✅ **Danger Zone Maintenance Safeguards** - Secure 6-digit Verification Authorization Code prompt and checkbox acknowledgement for database purging/reset utilities.

---

## 🛠️ Tech Stack

### **Frontend**

| Technology              | Purpose                                           | Version     |
| ----------------------- | ------------------------------------------------- | ----------- |
| **React**               | UI library for building interactive components    | 19.1+       |
| **Vite**                | Lightning-fast build tool and dev server          | 7.1+        |
| **Tailwind CSS**        | Utility-first CSS framework for responsive design | 4.1+        |
| **Framer Motion**       | Smooth animations, slide drawers, and alert toasts| 12.23+      |
| **React Router**        | Client-side routing and navigation                | 7.8+        |
| **Recharts**            | Composable charting library for admin analytics   | 3.8+        |
| **i18next**             | Internationalization framework (3 languages)      | 25.6+       |
| **Axios**               | Promise-based HTTP client for API calls           | 1.13+       |
| **jsPDF + html2canvas** | PDF certificate generation                        | 4.2+ / 1.4+ |
| **Lucide React**        | Icon library (24x24px consistent icons)           | 0.548+      |
| **Web Speech API**      | Speech Recognition for AI Oral Assessments        | Native      |
| **Razorpay SDK**        | Dynamic checkout modal for processing payments    | Native JS   |

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
| **Google Generative AI** | Gemini API for quizzes, exams, summaries | 0.24+   |
| **Google Auth Library**  | OAuth 2.0 token verification             | 10.6+   |
| **Razorpay**             | Payment Gateway integration and verification    | 2.9+    |

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
│  │  - CoursePage      │  │ API     │  │  - Skills & XP     │  │
│  │  - ContactPage     │  │ Calls   │  │  - Progress Tracker│  │
│  ├────────────────────┤  │◄────────┤──│────────────────────┤  │
│  │  Auth Pages        │  │         │  │  Course Routes     │  │
│  │  - SignUp (3 roles)│  │◄────────┤──│  - Blueprint CRUD  │  │
│  │  - Login / Google  │  │         │  │  - Add Lectures    │  │
│  ├────────────────────┤  │         │  ├────────────────────┤  │
│  │  Protected Pages   │  │◄────────┤──│  Admin Routes      │  │
│  │  - Learner Hub     │  │         │  │  - Approve/Reject  │  │
│  │  - Instructor Page │  │         │  │  - User Analytics  │  │
│  │  - Admin Panel     │  │         │  └────────────────────┘  │
│  └────────────────────┘  │         │                          │
│        ▲   ▲             │         │      Google Gemini AI    │
│        │   │             │         ├──────────────────────────┤
│        │   └─────────────┼─────────┼─► generate-quiz          │
│        │   Speech API    │         ├─► generate-voice-question│
│        └─────────────────┼─────────┼─► verify-voice-answer    │
│            Local Notes   │         ├─► generate-final-exam    │
│                          │         ├─► recommendations        │
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
             │  Database    │ │ File      │ │ AI API      │
             │  (Users,     │ │ Storage   │ │ Fallbacks   │
             │   Courses)   │ │ (Videos,  │ │ Active      │
             │              │ │ Resources)│ │             │
             └──────────────┘ └───────────┘ └─────────────┘
```

### **Data Flow Examples**

#### Systematic Progress & Locked Lesson Flow
```
1. Student enters LearnerDashboard for Course A
2. Frontend: GET /api/users/:id/enrolled (fetches user.completedContent array)
3. UI Logic: Compiles sequential list of all section contents (Videos, Resources, Links)
4. Render:
   - Index 0 is unlocked.
   - Index N is locked (disabled + lock icon) if Index N-1 is NOT present in completedContent array.
5. Student completes Lesson N-1 -> triggers quiz/voice check -> calls PUT /api/users/progress -> updates DB -> triggers unlock of Lesson N.
```

#### AI Voice Oral Assessment Flow
```
1. Student marks lesson as complete
2. Frontend: Triggers Voice Modal -> fetches POST /api/ai/generate-voice-question
3. Backend: Prompts Gemini to return a short, open-ended conceptual check (e.g. "What is a React Hook?")
4. Student speaks: Web Speech API records input -> populates input field in real-time
5. Student submits answer -> calls POST /api/ai/verify-voice-answer
6. Backend: Prompts Gemini to grade answer leniently (5-15 words). Returns { passed: true/false, feedback: "..." }
7. If passed: Calls PUT /api/users/add-xp (+150 XP) -> synchronizes state -> marks lesson complete.
```

#### Gamification XP & Badge Synchronization Flow
```
1. Event fires (lesson complete / oral exam passed / final exam passed)
2. Backend: Handles state change -> triggers updateGamification(user, xpGained, source)
3. DB updates: Increases user.xp, checks daily streak dates, and pushes unlocked badges.
4. Response payload returns updated { xp, streak, badges }
5. Frontend compares old and new state -> triggers animated Slide-In Alert toast showing "Badge Unlocked!" or "+XP Earned!"
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18.0 or higher ([Download](https://nodejs.org))
- **npm** v9+
- **MongoDB** - Local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud account
- **Git**
- **Cloudinary Account** ([Free tier available](https://cloudinary.com))
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

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

#### Frontend `.env` File

Create `Frontend/.env`:

```env
# Vite Configuration
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

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

#### Option 2: Production Build

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
│   │   ├── userController.js         # User auth, enrollment, progress, gamification, skills
│   │   ├── courseController.js       # Course CRUD, blueprints, lectures, deletion requests
│   │   ├── aiController.js           # AI quizzes, exams, summaries, oral assessments
│   │   ├── adminController.js        # Admin stats & analytics
│   │   ├── paymentController.js      # Razorpay orders, signatures, cashback rewards
│   │   ├── feedbackController.js     # Course reviews, text feedback, audio ratings
│   │   └── messageController.js      # Inter-user chat sessions, unread checks, voice QA uploads
│   │
│   ├── models/                       # Mongoose schemas
│   │   ├── User.js                   # User schema (roles, streak, xp, badges, skills, passedExams)
│   │   ├── Course.js                 # Course schema with lectures (videos, resources, links, metadata)
│   │   ├── Feedback.js               # Course rating feedback (written text, like status, audio URLs)
│   │   └── Message.js                # Direct chat message log (sender, receiver, unread status, audio URLs)
│   │
│   ├── routes/                       # API endpoints
│   │   ├── userRoutes.js             # /api/users
│   │   ├── courseRoutes.js           # /api/courses
│   │   ├── aiRoutes.js               # /api/ai
│   │   ├── adminRoutes.js            # /api/admin
│   │   ├── paymentRoutes.js          # /api/payments
│   │   ├── feedbackRoutes.js         # /api/feedback
│   │   └── messageRoutes.js          # /api/messages
│   │
│   ├── package.json                  # Backend dependencies
│   ├── server.js                     # Express app entry point
│   └── .env                          # Environment variables
│
├── Frontend/                         # React + Vite Frontend
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Navbar.jsx            # Navigation bar (Gamification indicators, language selector)
│   │   │   ├── Header.jsx            # Hero section
│   │   │   ├── Footer.jsx            # Footer
│   │   │   ├── ProtectedRoute.jsx    # Role-based route wrapper
│   │   │   ├── FeedbackSection.jsx
│   │   │   ├── SponsorSection.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── ChatModal.jsx         # Unified messaging widget supporting voice recording & playback
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx   # Admin analytics with Recharts
│   │   │       └── AdminSignUp.jsx      # Admin authentication
│   │   │
│   │   ├── pages/                    # Full-page views
│   │   │   ├── HomePage.jsx          # Landing page
│   │   │   ├── CoursePage.jsx        # Course catalog & filters
│   │   │   ├── ContactPage.jsx
│   │   │   ├── FeaturesPage.jsx
│   │   │   └── instructors/
│   │   │       ├── InstructorDashboard.jsx    # Instructor courses & requests
│   │   │       ├── InstructorCoursePage.jsx   # Course blueprint & section uploads
│   │   │       └── InstructorSignUp.jsx       # Instructor registration
│   │   │   └── learners/
│   │   │       ├── LearnerDashboard.jsx       # Premium Learning Hub, gamification, voice check, final exam
│   │   │       ├── CourseDetailsPage.jsx      # Course preview & objectives
│   │   │       └── LearnerSignUp.jsx          # Learner registration
│   │   │
│   │   ├── i18n/                     # Internationalization
│   │   │   ├── en.json               # English translations
│   │   │   ├── hi.json               # Hindi translations
│   │   │   ├── bn.json               # Bengali translations
│   │   │   └── i18n.js               # i18next configuration
│   │   │
│   │   ├── assets/
│   │   │   └── certificateTemplate.js # PDF certificate helper
│   │   │
│   │   ├── App.jsx                   # Router and Google OAuth context provider
│   │   ├── App.css                   # Global styling
│   │   ├── index.css                 # Base stylesheet
│   │   └── main.jsx                  # React application mount
│   │
│   ├── package.json                  # Frontend dependencies
│   ├── vite.config.js                # Vite config
│   ├── eslint.config.js              # ESLint lint configuration
│   ├── tailwind.config.js            # Tailwind styling setup
│   ├── .env                          # Local environments
│   └── index.html                    # Root index HTML template
│
├── LICENSE                           # MIT License
└── README.md                         # This file
```

---

## 🔄 How It Works

### 1. Systematic Progression & Lesson Locking
To guarantee consistent student progression:
- When a student registers and enrolls, they enter the course in their **Learner Dashboard**.
- The curriculum is mapped out into sections. Each section consists of items (Videos, Documents, or Links).
- RASS tracks completed files using the `completedContent` array on the user document.
- Only the first uncompleted lesson is active. Every subsequent lesson remains locked, preventing students from skipping ahead to advanced content without finishing basics.

### 2. AI Voice Oral Assessments
- Once a student finishes a video or resource, they must verify understanding.
- Clicking "Mark Done" triggers the **AI Voice Assessment Modal**.
- The student's browser accesses Web Speech API. They speak their conceptual explanation, which gets translated into text (typing is supported as a fallback).
- The text is evaluated by the backend using a fast-executing Gemini model fallback chain.
- Correct conceptual explanations pass, awarding the student **150 XP** and marking the content complete.
- Unlocks the `voice_master` ("Orator 🎙️") Medallion badge.

### 3. AI-Powered Course Recommendations
- In the Learner Dashboard, students can declare their **Expertise / Skills** (e.g. `React`, `Node`, `CSS`).
- An AI recommendation engine queries the database, compares their completed courses and declared tags, and uses Gemini to pick the top 3 best next courses from the catalog.
- It displays these suggestions in a custom layout, detailing a specific personalized explanation of why they should enroll.

### 4. Gamification Engine
- **XP Progression**: Actions award points:
  - Complete lesson element: **+100 XP**
  - Complete AI voice check: **+150 XP**
  - Pass final exam: **+500 XP**
- **Dynamic Levels**: Levels scale mathematically:
  $$\text{Level} = \left\lfloor \frac{\text{XP}}{1000} \right\rfloor + 1$$
- **Streak Tracker**: Syncs daily visits. Continuous daily active logins build streaks, awarding the `streak_maker` badge on a 3-day streak.
- **Medallion Badges**:
  - `first_step` ("First Step 🌟"): Earned first points.
  - `streak_maker` ("Committed 🔥"): Achieved 3-day active streak.
  - `voice_master` ("Orator 🎙️"): Cleared first voice conceptual check.
  - `exam_champion` ("Champion 🏆"): Perfect score of 10/10 on the Final Exam.
  - `graduate` ("Graduate 🎓"): Passed the course Final Exam (>= 70%).

### 5. AI Final Exam & Failure Path
- Upon reaching 100% video and syllabus progress, the certificate remains locked. The student must pass the **10 MCQ AI Final Exam**.
- The exam is dynamically generated by Google Gemini based on the course syllabus.
- Students must complete the exam within an interactive countdown timer.
- **Passing Threshold**: Student must answer at least 7/10 questions correctly (score >= 70%).
- **Pass State**: The database registers `passedExams` for the course, awards **500 XP**, triggers the `graduate` badge (or `exam_champion` for 10/10), and unlocks the custom PDF certificate downloader.
- **Fail State**: The student is provided detailed AI feedback. They must retake the exam, which generates a randomized, new set of 10 MCQs.

### 6. Premium Learning Hub & Player Layout
The student workspace is styled as a dual-pane workspace:
- **Left Panel**: Course index, completed badges list, dynamic level progress bar, declared skills manager, and AI recommendations list.
- **Right Panel (Workspace)**: Handles YouTube URL embedding and Cloudinary videos, custom resource files, and external links.
- **Interactive Markdown Notebook**: An inline text area that lets users type and save custom markdown notes local to the active lesson.
- **AI Summary Drawer**: Opens a slide-out drawer utilizing `POST /api/ai/generate-summary` to generate and display clean, detailed study notes for the active lecture.

### 7. Paid Courses, Razorpay, & 75% Cashback Refund Flow
- **Razorpay Integration**: Premium courses require an enrollment fee. Clicking enroll launches the Razorpay Checkout overlay, loading the SDK dynamically and executing transaction signature verification on the backend to register the purchase.
- **75% Cashback Incentive**: To motivate learners to complete courses, a completion-triggered cashback system allows students to claim 75% of their fee back. Once they pass the course final exam and graduate, a "Claim Refund" option is unlocked, sending a payload to the backend payment controller to verify completion and process the reward.

### 8. Voice messaging Q&A & Audio Course Feedback
- **Voice Messaging**: Within the Chat Modal, learners can record voice notes (or use speech-to-text transcription). The audio is captured, uploaded to Cloudinary, and saved to the message schema. Instructors are notified of unread messages with notification badges on their sidebar layout.
- **Feedback & Audio Reviews**: Learners can submit standard stars/like ratings along with written reviews and optional voice recordings for finished courses. This provides instructors with rich feedback and allows the system to aggregate course ratings dynamically.

### 9. Moderation Chat & Syllabus Previews
- **Admin-Instructor Chat**: Instructors can coordinate directly with administrators via direct chat, enabling fast communication about course approvals, edits, or deletion requests.
- **Blueprint Preview Modal**: Before moderators approve or reject a course blueprint, they can preview the entire course structure, objectives, descriptions, and category metadata in an overlay dialog.

### 10. Overview & Analytics Views
- **Learner Dashboard**: Added a comprehensive Overview & Analytics panel featuring Recharts. Learners can view:
  - **Learning Activity (Study Minutes)**: A Bar chart showing daily study minutes.
  - **Skill Strength Matrix**: A Radar chart demonstrating completed lesson breakdown by platform categories.
  - **Active Course Blueprints**: A horizontal Bar chart comparing progress percentages across active courses.
  - **Global Peer Arena**: A leaderboard scoreboard highlighting the student's XP rank relative to other top peers.
- **Instructor Dashboard**: Includes a default Overview analytics page displaying course status statistics and a **Student Progress Roster** listing names, emails, XP, levels, and progress logs for every enrolled student.
- **Admin Dashboard**: Refined system-wide analytics showcasing categorical distributions and user enrollments via visual charts.

### 11. Course Edit Permissions & Reset Flow
- **Edit Permission Requests**: Instructors cannot make edits on approved blueprints directly. They must submit an **Edit Request** through their dashboard.
- **Admin Approval**: Admins review requests under the Course Moderation tab, choosing to approve or deny edit permissions.
- **Blueprint Updates**: When editing is allowed (`editPermission: allowed`), instructors can modify sections, edit descriptions, adjust objective metadata, and upload/delete specific video lectures and resource content.
- **Progression Resets**: On final submission, instructors can check a box to reset progression to 0% for active (non-graduated) learners (so they retake updated/changed courses).
- **Certificate Safeguards**: Once a student passes the final exam and obtains their certificate, their progress is permanently locked at 100% and lessons remain fully unlocked, preventing edits to course blueprints from invalidating their certificates.

### 12. Safe Database Reset & Verification Code
- **Danger Zone Isolation**: Administrative database wipe commands are isolated to a dedicated "System Maintenance" tab.
- **Double Authorization Safeguards**: Admins must check a safety acknowledgement box and type in a randomized **6-digit Verification Authorization Code** shown on-screen before the purge utility can execute.

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
| `PUT`  | `/progress`     | Mark content as complete (awards +100 XP)    | ✅ (Learner)  |
| `POST` | `/unenroll`     | Drop course (remove enrollment)              | ✅ (Learner)  |
| `PUT`  | `/pass-exam`    | Save passed exam status (awards +500 XP)     | ✅ (Learner)  |
| `PUT`  | `/skills`       | Save user declared skill list tags           | ✅ (Learner)  |
| `PUT`  | `/add-xp`       | Award XP manually (from oral checks +150 XP) | ✅ (Learner)  |

### Course Routes (`/api/courses/`)

| Method   | Endpoint                    | Description                              | Auth Required   |
| -------- | --------------------------- | ---------------------------------------- | --------------- |
| `GET`    | `/`                         | Fetch all approved courses (public)      | ❌              |
| `GET`    | `/pending`                  | Fetch pending & deletion_pending courses | ✅ (Admin)      |
| `POST`   | `/`                         | Create new course blueprint              | ✅ (Instructor) |
| `GET`    | `/:id`                      | Fetch course details                     | ❌              |
| `GET`    | `/instructor/:instructorId` | Fetch instructor's courses               | ✅ (Instructor) |
| `PUT`    | `/:id`                      | Update course details (Admin/Instructor Edit, optional thumbnail) | ✅ (Auth) |
| `PUT`    | `/:id/status`               | Approve/Reject/Delete course             | ✅ (Admin)      |
| `PUT`    | `/:id/request-delete`       | Request course deletion (status updates) | ✅ (Instructor) |
| `PUT`    | `/:id/request-edit`         | Request course edit permission           | ✅ (Instructor) |
| `PUT`    | `/:id/approve-edit`         | Approve course edit request              | ✅ (Admin)      |
| `PUT`    | `/:id/reject-edit`          | Reject course edit request               | ✅ (Admin)      |
| `POST`   | `/:id/lectures`             | Add lecture with videos/resources/links  | ✅ (Instructor) |
| `DELETE` | `/:id/lectures/:lectureId`  | Delete a specific lecture from course     | ✅ (Instructor) |
| `DELETE` | `/:id`                      | Force delete course                      | ✅ (Admin)      |

### AI Routes (`/api/ai/`)

| Method | Endpoint                    | Description                                       | Auth Required |
| ------ | --------------------------- | ------------------------------------------------- | ------------- |
| `POST` | `/generate-quiz`            | Generate AI single-question quiz                  | ✅ (Learner)  |
| `POST` | `/generate-final-exam`      | Generate 10-MCQ course final exam                 | ✅ (Learner)  |
| `POST` | `/recommendations`          | Suggest courses based on skills & enrollment history| ✅ (Learner)  |
| `POST` | `/generate-voice-question`  | Generate short voice oral check question           | ✅ (Learner)  |
| `POST` | `/verify-voice-answer`      | Grade oral explanation voice text responses       | ✅ (Learner)  |
| `POST` | `/generate-summary`         | Generate clean, detailed study notes summaries    | ✅ (Learner)  |

### Payment Routes (`/api/payments/`)

| Method | Endpoint        | Description                                           | Auth Required |
| ------ | --------------- | ----------------------------------------------------- | ------------- |
| `POST` | `/create-order` | Create a new Razorpay checkout order                  | ✅ (Learner)  |
| `POST` | `/verify-enroll`| Verify signature and enroll student in paid course    | ✅ (Learner)  |
| `POST` | `/claim-reward` | Process and claim 75% cashback refund upon completion | ✅ (Learner)  |

### Message Routes (`/api/messages/`)

| Method | Endpoint                  | Description                                            | Auth Required    |
| ------ | ------------------------- | ------------------------------------------------------ | ---------------- |
| `POST` | `/`                       | Send message (supports text and recorded voice Urls)   | ✅ (Authenticated)|
| `GET`  | `/chat/:userId1/:userId2` | Fetch chat history logs between two users              | ✅ (Authenticated)|
| `PUT`  | `/read`                   | Mark unread messages as read                           | ✅ (Authenticated)|
| `GET`  | `/unread/:receiverId`     | Fetch count of unread incoming messages                | ✅ (Authenticated)|
| `GET`  | `/admins`                 | Fetch list of administrators for instructor chat       | ✅ (Instructor)  |
| `GET`  | `/contacts/:userId`       | Retrieve active conversation contacts                  | ✅ (Authenticated)|

### Feedback Routes (`/api/feedback/`)

| Method | Endpoint                    | Description                                             | Auth Required   |
| ------ | --------------------------- | ------------------------------------------------------- | --------------- |
| `POST` | `/`                         | Submit course rating (likes, text, recorded voice review)| ✅ (Learner)    |
| `GET`  | `/course/:courseId`         | Retrieve all student reviews and rating for a course    | ❌               |
| `GET`  | `/instructor/:instructorId` | Retrieve aggregated feedback reviews for an instructor  | ✅ (Instructor) |

### Admin Routes (`/api/admin/`)

| Method   | Endpoint       | Description                                            | Auth Required |
| -------- | -------------- | ------------------------------------------------------ | ------------- |
| `GET`    | `/stats`       | Fetch aggregated user and course registration stats    | ✅ (Admin)    |
| `DELETE` | `/reset-users` | Reset user and progress collection data tables          | ✅ (Admin)    |

---

## 👥 User Roles & Workflows

### 🎓 Learner Workflow
```
1. Sign up (Manual or Google OAuth) -> Select declared skill tags
2. Browse approved courses -> Process Razorpay checkout for paid catalog additions
3. Enters LearnerDashboard -> Systematic Progression locks future modules; complete lessons chronologically
4. Mark lesson complete -> passes AI voice oral question check (+150 XP) or quiz
5. Record & send voice questions in Q&A thread directly to instructors if stuck
6. Earn XP -> levels up (+1 Level per 1000 XP), daily streaks, unlocks badges
7. Pass 100% lessons -> Generate 10 MCQ exam (passing score >= 70%) with countdown timer
8. Pass exam -> Unlocks Certificate (immediate download/countdown) & 75% Cashback Refund Claim
9. Submit course feedback ratings with written reviews and optional voice reviews
```

### 👨‍🏫 Instructor Workflow
```
1. Register -> Access InstructorDashboard (redesigned sidebar, Rupee conversion pricing)
2. Click "Create Course" -> Fill course blueprint (thumbnail, objectives, duration)
3. Build curriculum section-by-section:
   - Upload videos / add YouTube URLs (add custom text descriptions)
   - Upload resources / add external links (add custom text descriptions)
4. Await Admin Approval (previewed by admin via syllabus modal)
5. Review learners' course feedback and play back recorded audio reviews
6. Respond to student voice messaging Q&A requests directly from the workspace
7. Chat with Admins regarding course feedback, approval queries, or deletion requests
```

### 👨‍💼 Admin Workflow
```
1. Log in -> Open AdminDashboard
2. Moderate blueprints: Open syllabus blueprint preview modals, approve/reject creations
3. Message Instructors directly in moderation chat to coordinate updates (notification badges)
4. User management: Track users, drop user enrollments, check levels
5. Reset users / clean progress tables using user reset utility
6. Monitor analytics: Category bar charts, user pie charts
```

---

## 🚧 Future Improvements

### Planned Features (v2.0)
- [ ] **Live Webinars** - Zoom or Jitsi video conferencing integration.
- [ ] **Community Boards** - Peer-to-peer discussion threads per course.
- [ ] **Integrated Payment Gateways** - Stripe/Razorpay configuration for paid courses.
- [ ] **Blockchain Certificates** - Immutable credential verification.
- [ ] **Dynamic Recommendation Personalization** - Collaborative filtering and user reviews database.
- [ ] **WebSockets** - Live chat boards in classrooms and interactive user leaderboards.

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

### Steps to Contribute
1. **Fork the Repository**
2. **Create a Feature Branch** (`git checkout -b feature/your-feature-name`)
3. **Make Your Changes** (follow code standard formatting)
4. **Commit Your Changes** (`git commit -m "Add: feature detailed description"`)
5. **Push to Your Branch** (`git push origin feature/your-feature-name`)
6. **Open a Pull Request** (add clear verification references)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📊 Project Statistics

- **Total Files**: 75+ component and logic files
- **API Endpoints**: 40+ RESTful routes
- **Supported Languages**: 3 (English, Hindi, Bengali)
- **Database Collections**: 4 (Users, Courses, Feedbacks, Messages)
- **External Integrations**: 4 (Google OAuth, Gemini AI, Cloudinary, Razorpay)
- **User Roles**: 3 (Learner, Instructor, Admin)

**Last Updated**: July 2026  
**Version**: 1.3.0  
**Maintenance Status**: ✅ Active Development
