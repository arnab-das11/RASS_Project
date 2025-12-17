import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Loader } from "lucide-react"; // Assuming you have lucide-react installed

const List = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default image fallback if database image is missing or broken
  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/courses");
        // Slice to show only the first 4 courses for the homepage list
        setCourses(data.slice(0, 4)); 
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  /* Smooth sponsor-like animation */
  const containerVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.9,
        ease: "easeOut",
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-100">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <motion.section
      className="bg-gray-100 py-16 px-6 md:px-12 lg:px-20 will-change-transform"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ amount: 0.25, once: true }} // added 'once: true' for better performance
    >
      {/* Heading */}
      <motion.h1
        variants={cardVariants}
        className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800"
      >
        Explore Education Resources
      </motion.h1>

      {/* Cards */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.length > 0 ? (
          courses.map((course) => (
            <motion.div
              key={course._id} // Use MongoDB _id
              variants={cardVariants}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full"
            >
              <img
                src={course.thumbnail || DEFAULT_IMAGE}
                alt={course.title}
                className="w-full h-48 sm:h-52 md:h-56 object-cover object-center rounded-t-2xl"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_IMAGE;
                }}
              />

              <div className="p-5 flex flex-col flex-grow">
                <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center line-clamp-2">
                  {course.title}
                </h2>

                <p className="text-sm text-gray-600 text-center flex-grow line-clamp-3">
                  {/* Handle potentially long descriptions */}
                  {course.description || "No description available for this course."}
                </p>

                {/* COURSE DETAILS BUTTON */}
                <button
                  onClick={() => navigate(`/courses/${course._id}`)}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-full
                             hover:bg-green-500 hover:scale-103 transition-transform duration-200"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No courses available at the moment.
          </div>
        )}
      </div>

      {/* CTA */}
      <motion.div variants={cardVariants} className="text-center mt-12">
        <button
          onClick={() => {
            navigate("/courses");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="bg-blue-600 text-white px-8 py-3 rounded-full text-md font-medium
                     hover:bg-green-400 hover:text-black hover:scale-103 transition-transform duration-200 shadow-md"
        >
          See All Courses →
        </button>
      </motion.div>
    </motion.section>
  );
};

export default List;