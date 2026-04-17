import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react'; // Optional: if you use lucide-react
import axios from 'axios';
// Import any icons you use, like from lucide-react
// import { BookOpen, PlayCircle, CheckCircle } from 'lucide-react';

const LearnerDashboard = () => {
  // --- STATE MANAGEMENT ---
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View Controllers
  const [selectedCourse, setSelectedCourse] = useState(null); 
  const [activeVideoUrl, setActiveVideoUrl] = useState(''); 

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Adjust this endpoint to match your actual backend route
        const response = await axios.get('http://localhost:5000/api/learner/my-courses');
        setEnrolledCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // --- UI RENDERING ---
  
  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-xl animate-pulse">Loading your courses...</p>
      </div>
    );
  }

  // VIEW B: The Player Mode (If a course is selected)
  if (selectedCourse) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-white">
        {/* Left Column: Video Player */}
        <div className="w-full md:w-2/3 p-4 border-r border-gray-700">
          <button 
            onClick={() => setSelectedCourse(null)}
            className="mb-4 text-sm text-gray-400 hover:text-white flex items-center"
          >
            ← Back to Dashboard
          </button>
          
          <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
             {activeVideoUrl ? (
               <video src={activeVideoUrl} controls className="w-full h-full" />
             ) : (
               <p className="text-gray-500">Select a lesson to start watching</p>
             )}
          </div>
          
          <h2 className="text-2xl font-bold mt-4">{selectedCourse.title}</h2>
          <button className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors">
            Mark as Complete
          </button>
        </div>

        {/* Right Column: Curriculum/Sidebar */}
        <div className="w-full md:w-1/3 p-4 bg-gray-800 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Course Content</h3>
          
          {/* Example static list - You will map through selectedCourse.lectures here */}
          <ul className="space-y-2">
            <li 
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded cursor-pointer transition-colors"
              onClick={() => setActiveVideoUrl('example-url-1.mp4')}
            >
              1. Introduction to the Course
            </li>
            <li 
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded cursor-pointer transition-colors"
              onClick={() => setActiveVideoUrl('example-url-2.mp4')}
            >
              2. Setting up the Environment
            </li>
          </ul>
        </div>
      </div>
    );
  }

 
// VIEW A: The Dashboard Grid (Default View)
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">My Learning Arena</h1>
      
      {enrolledCourses.length === 0 ? (
        
        /* --- NEW EMPTY STATE UI --- */
        <div className="flex flex-col items-center justify-center py-24 bg-gray-800 rounded-xl border border-gray-700 mt-8 shadow-lg">
          {/* If you don't have lucide-react, you can use a normal 📖 emoji here */}
          <BookOpen className="w-16 h-16 text-gray-500 mb-4" /> 
          
          <h2 className="text-2xl font-bold mb-2">Your journey has not yet begun</h2>
          <p className="text-gray-400 mb-8 text-center max-w-md">
            You aren't enrolled in any courses yet. Return to the main catalog to discover new skills and begin your training.
          </p>
          
          {/* This Link acts as a button to send them home */}
          <Link 
            to="/"  // Change this to "/courses" if your main catalog has a different route
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold text-white transition-all transform hover:scale-105"
          >
            Browse Available Courses
          </Link>
        </div>
        /* -------------------------- */

      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mapping through courses... (Keep your existing code here) */}
        </div>
      )}
    </div>
  );
};

export default LearnerDashboard;