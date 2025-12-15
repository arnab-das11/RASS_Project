import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const List = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Java Course",
      desc: "Master Java programming from basics to advanced concepts, including OOPs, collections, and real-world projects.",
      img: "/Home_Card/java.jpg",
    },
    {
      title: "Web Development using MERN",
      desc: "Build full-stack web applications using MongoDB, Express, React, and Node.js with hands-on practical projects.",
      img: "/Home_Card/mern.webp",
    },
    {
      title: "Complete DSA in C++",
      desc: "Strengthen your problem-solving skills by learning Data Structures and Algorithms with in-depth C++ implementation.",
      img: "/Home_Card/dsa.png",
    },
    {
      title: "Machine Learning",
      desc: "Explore the world of AI by building predictive models, understanding algorithms, and applying Python-based ML techniques.",
      img: "/Home_Card/ml.png",
    },
  ];

  /* SAME animation philosophy as SponsorSection */
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
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.section
      className="bg-gray-100 py-16 px-6 md:px-12 lg:px-20 will-change-transform"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ amount: 0.25 }}
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
        {cards.map((card, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col"
          >
            <img
              src={card.img}
              alt={card.title}
              className="w-full h-48 sm:h-52 md:h-56 object-cover object-center rounded-t-2xl"
            />

            <div className="p-5 flex flex-col flex-grow">
              <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center">
                {card.title}
              </h2>

              <p className="text-sm text-gray-600 text-center flex-grow">
                {card.desc}
              </p>

              <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-full hover:bg-green-500 hover:scale-103 transition-transform duration-200">
                Continue
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        variants={cardVariants}
        className="text-center mt-12"
      >
        <button
          onClick={() => {
            navigate("/courses");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="bg-blue-600 text-white px-8 py-3 rounded-full text-md font-medium hover:bg-green-400 hover:text-black hover:scale-103 transition-transform duration-200 shadow-md"
        >
          See All Courses →
        </button>
      </motion.div>
    </motion.section>
  );
};

export default List;

