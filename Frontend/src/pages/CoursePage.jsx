import React, { useState } from "react";
import { Search, Star } from "lucide-react";
import Footer from "../components/Footer";

const coursesData = [
  {
    id: 1,
    title: "Java Programming Masterclass",
    category: "Programming",
    instructor: "Prof. Arjun Mehta",
    rating: 4.8,
    students: 4200,
    desc: "Master Java programming from basics to advanced concepts, including OOPs, collections, and real-world projects.",
    image: "/Home_Card/java.jpg",
  },
  {
    id: 2,
    title: "Web Development using MERN",
    category: "Web Development",
    instructor: "Priya Sharma",
    rating: 4.9,
    students: 5200,
    desc: "Build full-stack web applications using MongoDB, Express, React, and Node.js with hands-on practical projects.",
    image: "/Home_Card/mern.webp",
  },
  {
    id: 3,
    title: "Complete DSA in C++",
    category: "Data Structures & Algorithms",
    instructor: "Rahul Verma",
    rating: 4.7,
    students: 3100,
    desc: "Strengthen your problem-solving skills by learning Data Structures and Algorithms with in-depth C++ implementation.",
    image: "/Home_Card/dsa.png",
  },
  {
    id: 4,
    title: "Machine Learning with Python",
    category: "Artificial Intelligence",
    instructor: "Dr. Neha Patel",
    rating: 4.9,
    students: 4800,
    desc: "Explore the world of AI by building predictive models, understanding algorithms, and applying Python-based ML techniques.",
    image: "/Home_Card/ml.png",
  },
  {
    id: 5,
    title: "Operating Systems Fundamentals",
    category: "Core CS",
    instructor: "Dr. Rajesh Kumar",
    rating: 4.6,
    students: 2700,
    desc: "Understand how modern operating systems work, including process management, memory, and file systems.",
    image: "/Home_Card/os.jpg",
  },
  {
    id: 6,
    title: "Database Management Systems (DBMS)",
    category: "Core CS",
    instructor: "Ananya Gupta",
    rating: 4.8,
    students: 3500,
    desc: "Learn relational databases, SQL, normalization, and transactions with hands-on MySQL and PostgreSQL practice.",
    image: "/Home_Card/dbms.jpg",
  },
  {
    id: 7,
    title: "Computer Networks",
    category: "Networking",
    instructor: "Vikram Singh",
    rating: 4.7,
    students: 2900,
    desc: "Dive into the concepts of networking, TCP/IP, routing, and protocols essential for every computer engineer.",
    image: "/Home_Card/network.jpg",
  },
  {
    id: 8,
    title: "Cloud Computing with AWS & Azure",
    category: "Cloud Computing",
    instructor: "Aisha Khan",
    rating: 4.9,
    students: 4100,
    desc: "Learn cloud fundamentals, deployment, and automation with real-world projects using AWS and Microsoft Azure.",
    image: "/Home_Card/cloud.jpg",
  },
  {
    id: 9,
    title: "Cybersecurity Essentials",
    category: "Cybersecurity",
    instructor: "Rohit Nair",
    rating: 4.8,
    students: 3600,
    desc: "Protect systems from attacks, understand ethical hacking, encryption, and security protocols through simulations.",
    image: "/Home_Card/cybersecurity.jpg",
  },
  {
    id: 10,
    title: "Artificial Intelligence Concepts",
    category: "Artificial Intelligence",
    instructor: "Dr. Sneha Menon",
    rating: 4.7,
    students: 3200,
    desc: "Understand search algorithms, neural networks, and intelligent agents to design smart AI-driven applications.",
    image: "/Home_Card/ai.jpg",
  },
  {
    id: 11,
    title: "Python for Everybody",
    category: "Programming",
    instructor: "Rajeev Sharma",
    rating: 4.8,
    students: 5100,
    desc: "Learn Python programming from scratch, including data types, loops, APIs, and real-world automation projects.",
    image: "/Home_Card/python.jpg",
  },
  {
    id: 12,
    title: "DevOps and CI/CD Pipeline",
    category: "DevOps",
    instructor: "Kiran Desai",
    rating: 4.8,
    students: 3400,
    desc: "Implement automation and continuous deployment using Docker, Kubernetes, Jenkins, and GitHub Actions.",
    image: "/Home_Card/devops.jpg",
  },
  {
    id: 13,
    title: "Mobile App Development with Flutter",
    category: "App Development",
    instructor: "Sneha Tiwari",
    rating: 4.9,
    students: 3700,
    desc: "Build cross-platform mobile apps using Flutter and Dart, covering UI, backend integration, and animations.",
    image: "/Home_Card/flutter.jpg",
  },
  {
    id: 14,
    title: "Artificial Neural Networks & Deep Learning",
    category: "Artificial Intelligence",
    instructor: "Dr. Manish Rao",
    rating: 4.9,
    students: 3900,
    desc: "Master neural networks, CNNs, and deep learning models using TensorFlow and PyTorch.",
    image: "/Home_Card/deeplearning.jpg",
  },
];

const categories = [
  "All",
  "Programming",
  "Web Development",
  "Data Structures & Algorithms",
  "Artificial Intelligence",
  "Core CS",
  "Networking",
  "Cybersecurity",
  "Cloud Computing",
  "DevOps",
  "App Development",
];

const CoursePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = coursesData.filter(
    (course) =>
      (selectedCategory === "All" || course.category === selectedCategory) &&
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      
      <main className="flex-grow py-16 px-6 md:px-20">
  
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Explore Courses
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Learn new skills, grow your knowledge, and take your career to the
            next level.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10">
          <div className="flex items-center bg-white rounded-full shadow-md px-4 w-full md:w-1/2">
            <Search className="text-gray-500 mr-3" />
            <input
              type="text"
              placeholder="Search for a course..."
              className="flex-grow py-2 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}/>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 rounded-full font-medium hover:bg-green-300 hover:scale-103 transition-transform duration-200 ${
                selectedCategory === category
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-blue-100"
              }`}>
              {category}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div key={course.id}
                className="bg-white shadow-md rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-200 flex flex-col">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover"/>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {course.category}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      By{" "}
                      <span className="font-medium text-gray-800">
                        {course.instructor}
                      </span>
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={18} fill="currentColor" />
                        <span className="text-gray-700 font-medium">
                          {course.rating}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {course.students} students
                      </p>
                    </div>
                  </div>

                  <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-full hover:bg-green-700 hover:scale-[1.03] transition-transform duration-200">
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-full">
              No courses found.
            </p>
          )}
        </div>
      </main>

      <footer className="w-full bg-gray-800 text-white mt-16">
        <Footer />
      </footer>
    </div>
  );
};

export default CoursePage;
