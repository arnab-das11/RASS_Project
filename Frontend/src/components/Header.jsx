import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";

const Header = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  const opacity = useTransform(scrollY, [0, 250], [1, 0.6]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  const [userInfo, setUserInfo] = useState(null);

  // --- NEW: Listen for Auth Changes from Navbar ---
  useEffect(() => {
    // Function to check user status
    const checkUser = () => {
      try {
        const saved = localStorage.getItem("userInfo");
        setUserInfo(saved ? JSON.parse(saved) : null);
      } catch (e) {
        setUserInfo(null);
      }
    };

    // 1. Check immediately on mount
    checkUser();

    // 2. Listen for the custom event dispatched by Navbar
    window.addEventListener("auth-change", checkUser);

    // 3. Cleanup listener
    return () => window.removeEventListener("auth-change", checkUser);
  }, []);

  const handleHeroAction = () => {
    if (userInfo) {
      if(userInfo.role === 'admin') navigate('/admin-dashboard');
      else if(userInfo.role === 'instructor') navigate('/instructor-dashboard');
      else navigate('/learner-dashboard');
    } else {
      navigate("/courses");
    }
  };

  return (
    <motion.div
      style={{ opacity, scale }}
      className="relative w-full bg-gradient-to-r from-yellow-200 via-white to-yellow-200 py-32 sm:py-40 flex items-center justify-center shadow-md mt-20"
    >
      <div className="mx-6 sm:mx-16 md:mx-24 text-center max-w-3xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 leading-tight">
          {userInfo ? (
            <>
              Welcome back, <span className="text-blue-600">{userInfo.name}</span>!
            </>
          ) : (
            <>
              Unlock Your Potential With <span className="text-blue-600">LearnX</span>
            </>
          )}
        </h1>

        <p className="mt-6 text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
          {userInfo 
            ? "Your dashboard is ready. Continue your learning journey or manage your courses with our modern tools."
            : "Your personalized learning path to master new skills and advance your career — guided by modern tools, mentors, and AI support."
          }
        </p>

        <button
          onClick={handleHeroAction}
          className="mt-10 px-8 py-4 bg-blue-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:bg-green-400 hover:text-black hover:scale-105 transform transition-all duration-300"
        >
          {userInfo ? "Go to My Dashboard →" : "Explore All Career Paths →"}
        </button>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-gray-300/50 to-transparent"></div>
    </motion.div>
  );
};

export default Header;