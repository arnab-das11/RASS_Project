import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import FeaturesPage from './pages/FeaturesPage';

// --- Instructors ---
import InstructorSignUp from './pages/instructors/InstructorSignUp';
import InstructorDashboard from './pages/instructors/InstructorDashboard';
import InstructorCoursePage from './pages/instructors/InstructorCoursePage';

// --- Learners ---
import LearnerSignUp from './pages/learners/LearnerSignUp';
import LearnerDashboard from './pages/learners/LearnerDashboard';
// CoursePage is usually shared, keeping your original path:
import CoursePage from './pages/CoursePage'; 

// ⚠️ FIX 1: Import this from the 'learners' folder where you likely created it
import CourseDetailsPage from './pages/learners/CourseDetailsPage'; 

// --- Admin ---
import AdminDashboard from './components/admin/AdminDashboard';
import AdminSignUp from './components/admin/AdminSignUp';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<HomePage/>} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/features" element={<FeaturesPage/>} />
        
        {/* Course Routes */}
        <Route path="/courses" element={<CoursePage/>} />
        
        {/* ⚠️ FIX 2: Changed :courseId to :id to match the code in CourseDetailsPage */}
        <Route path="/courses/:id" element={<CourseDetailsPage />} />

        {/* Learner Routes */}
        <Route path='/learner-signup' element={<LearnerSignUp/>} />
        <Route path='/learner-dashboard' element={<LearnerDashboard/>} />

        {/* Instructor Routes */}
        <Route path='/instructor-signup' element={<InstructorSignUp/>} />
        <Route path='/instructor-dashboard' element={<InstructorDashboard/>} />
        <Route path="/instructor-course" element={<InstructorCoursePage />} />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-signup" element={<AdminSignUp />} />
      </Routes>
    </div>
  )
}

export default App;