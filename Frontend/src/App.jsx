import { Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // NEW IMPORT

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
import CoursePage from './pages/CoursePage'; 
import CourseDetailsPage from './pages/learners/CourseDetailsPage'; 

// --- Admin ---
import AdminDashboard from './components/admin/AdminDashboard';
import AdminSignUp from './components/admin/AdminSignUp';

// --- Security ---
import ProtectedRoute from './components/ProtectedRoute'; 

const App = () => {
  // Grab the Client ID from Vite environment variables
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_FALLBACK_CLIENT_ID";

  return (
    // Wrap the entire app routing in the Google Provider
    <GoogleOAuthProvider clientId={clientId}>
      <div>
        <Routes>
          <Route path='/' element={<HomePage/>} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/features" element={<FeaturesPage/>} />
          
          {/* Course Routes */}
          <Route path="/courses" element={<CoursePage/>} />
          <Route path="/courses/:id" element={<CourseDetailsPage />} />

          {/* Learner Routes */}
          <Route path='/learner-signup' element={<LearnerSignUp/>} />
          
          {/* Protected Learner Dashboard */}
          <Route 
            path='/learner-dashboard' 
            element={
              <ProtectedRoute allowedRoles={['learner']}>
                <LearnerDashboard/>
              </ProtectedRoute>
            } 
          />

          {/* Instructor Routes */}
          <Route path='/instructor-signup' element={<InstructorSignUp/>} />
          
          {/* Protected Instructor Dashboard */}
          <Route 
            path='/instructor-dashboard' 
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorDashboard/>
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Instructor Course Page */}
          <Route 
            path="/instructor-course" 
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorCoursePage />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route path="/admin-signup" element={<AdminSignUp />} />
          
          {/* Protected Admin Dashboard */}
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </GoogleOAuthProvider>
  )
}

export default App;