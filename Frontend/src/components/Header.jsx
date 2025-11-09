import React from "react";

const Header = () => {
  return (
    <div className="relative w-full bg-gradient-to-r from-yellow-200 via-white to-yellow-200 py-24 sm:py-32 flex items-center justify-center shadow-md">
      <div className="mx-6 sm:mx-16 md:mx-24 text-center max-w-3xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 leading-tight">
          Unlock Your Potential With{" "}
          <span className="text-blue-600"> LearnX </span>
        </h1>

        <p className="mt-6 text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
          Your personalized learning path to master new skills and advance your
          career — guided by modern tools, mentors, and AI support.
        </p>

        <button className="mt-10 px-8 py-4 bg-blue-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:bg-green-400 hover:text-black hover:scale-105 transform transition-all duration-300">
          Explore All Career Paths →
        </button>
      </div>

      {/* Decorative subtle shadow line below */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-gray-300/50 to-transparent"></div>
    </div>
  );
};

export default Header;




