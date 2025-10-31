import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import InstructorSignUp from './pages/instructors/InstructorSignUp';
import LearnerSignUp from './pages/learners/LearnerSignUp';
import ContactPage from './pages/ContactPage';
import CoursePage from './pages/CoursePage';
import FeaturesPage from './pages/FeaturesPage';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<HomePage/>} />
        <Route path='/login' element={<LoginPage/>} />
        <Route path='/instructor-signup' element={<InstructorSignUp/>} />
        <Route path='/learner-signup' element={<LearnerSignUp/>} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/courses" element={<CoursePage/>} />
        <Route path="/features" element={<FeaturesPage/>} />
      </Routes>
    </div>
  )
}

export default App;
