import React from "react";
import { motion } from "framer-motion";
import { Clock, BarChart, Award, PlayCircle } from "lucide-react";

/* ===== Animation Variants (Same system used everywhere) ===== */
const sectionVariants = {
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

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const CourseDetailsPage = () => {
  return (
    <div className="bg-gray-50">

      {/* ================= HERO ================= */}
      <motion.section
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20 px-6 md:px-16 lg:px-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.3 }}
      >
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl"
        >
          Full Stack Web Development (MERN)
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg text-blue-100 max-w-2xl"
        >
          Learn to build scalable, real-world applications using MongoDB,
          Express, React, and Node.js with hands-on projects.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-6 mt-8"
        >
          <div className="flex items-center gap-2">
            <Clock /> <span>6 Months</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart /> <span>Beginner to Advanced</span>
          </div>
          <div className="flex items-center gap-2">
            <Award /> <span>Certificate Included</span>
          </div>
        </motion.div>
      </motion.section>

      {/* ================= OVERVIEW ================= */}
      <motion.section
        className="py-16 px-6 md:px-16 lg:px-24 bg-white"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.25 }}
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold text-gray-800 mb-6"
        >
          Course Overview
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="text-gray-600 max-w-4xl leading-relaxed"
        >
          This course is designed to take you from fundamentals to building
          complete full-stack applications. You’ll work on real projects,
          understand industry workflows, and gain confidence to crack
          internships and jobs.
        </motion.p>
      </motion.section>

      {/* ================= WHAT YOU WILL LEARN ================= */}
      <motion.section
        className="py-16 px-6 md:px-16 lg:px-24 bg-gray-50"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.25 }}
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold text-gray-800 mb-10"
        >
          What You Will Learn
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            "HTML, CSS & JavaScript",
            "React & Component Architecture",
            "Node.js & Express APIs",
            "MongoDB & Database Design",
            "Authentication & Security",
            "Deployment & Optimization",
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <p className="font-medium text-gray-800">{item}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ================= CURRICULUM ================= */}
      <motion.section
        className="py-16 px-6 md:px-16 lg:px-24 bg-white"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.25 }}
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold text-gray-800 mb-8"
        >
          Course Curriculum
        </motion.h2>

        <div className="space-y-4 max-w-3xl">
          {[
            "Introduction & Web Basics",
            "Frontend with React",
            "Backend with Node & Express",
            "Database & Authentication",
            "Full Stack Project",
          ].map((module, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex items-center justify-between bg-gray-50 rounded-xl p-5 border"
            >
              <span className="text-gray-700 font-medium">{module}</span>
              <PlayCircle className="text-blue-600" />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ================= CTA ================= */}
      <motion.section
        className="py-20 px-6 md:px-16 lg:px-24 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.3 }}
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl md:text-4xl font-bold mb-6"
        >
          Ready to Start Your Journey?
        </motion.h2>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-green-600 px-10 py-3 rounded-full font-semibold shadow-lg"
        >
          Enroll Now
        </motion.button>
      </motion.section>
    </div>
  );
};

export default CourseDetailsPage;

