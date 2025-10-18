import React from 'react'

const Header = () => {
  return (
    <div className="w-full bg-yellow-100 py-20 flex items-center justify-center">
      <div className="mx-8 sm:mx-16 md:mx-24 text-center">
        <h1 className="text-3xl sm:text-5xl font-semibold sm:leading-[4rem] text-gray-700">
          Unlock Your Potential With <span className="text-blue-600"> LearnX </span>
        </h1>
        <p className="my-4 max-w-2xl mx-auto max-sm:text-sm text-gray-500">
          Your personalized learning path to master new skills and advance your career.
        </p>
        <button className="bg-blue-600 px-8 py-4 mt-6 rounded-full font-semibold text-white hover:scale-105 transition-all cursor-pointer">
          Explore All Career Paths
        </button>
      </div>
    </div>
  )
}

export default Header;



