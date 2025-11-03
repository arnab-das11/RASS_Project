import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import InstructorSignUp from './pages/instructors/InstructorSignUp';
import LearnerSignUp from './pages/learners/LearnerSignUp';
import ContactPage from './pages/ContactPage';
import CoursePage from './pages/CoursePage';
import FeaturesPage from './pages/FeaturesPage';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminSignUp from './components/admin/AdminSignUp';
import InstructorDashboard from './pages/instructors/InstructorDashboard';
import LearnerDashboard from './pages/learners/LearnerDashboard';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<HomePage/>} />
        <Route path='/login' element={<LoginPage/>} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-signup" element={<AdminSignUp />} />
        <Route path='/instructor-signup' element={<InstructorSignUp/>} />
        <Route path='/instructor-dashboard' element={<InstructorDashboard/>} />
        <Route path='/learner-signup' element={<LearnerSignUp/>} />
        <Route path='/learner-dashboard' element={<LearnerDashboard/>} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/courses" element={<CoursePage/>} />
        <Route path="/features" element={<FeaturesPage/>} />
      </Routes>
    </div>
  )
}

export default App;
