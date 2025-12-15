import { useState } from "react";
import { Search, Star } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export const coursesData = [
  {
    id: 1,
    title: "Java Programming Masterclass",
    category: "Programming",
    instructor: "Prof. Arjun Mehta",
    rating: 4.8,
    students: 4200,
    desc: "Master Java programming from basics to advanced concepts.",
    image: "/Home_Card/java.jpg",
  },
  {
    id: 2,
    title: "Web Development using MERN",
    category: "Web Development",
    instructor: "Priya Sharma",
    rating: 4.9,
    students: 5200,
    desc: "Build full-stack web applications using MERN stack.",
    image: "/Home_Card/mern.webp",
  },
  {
    id: 3,
    title: "Complete DSA in C++",
    category: "Data Structures & Algorithms",
    instructor: "Rahul Verma",
    rating: 4.7,
    students: 3100,
    desc: "Strengthen problem-solving skills with DSA in C++.",
    image: "/Home_Card/dsa.png",
  },
  {
    id: 4,
    title: "Machine Learning with Python",
    category: "Artificial Intelligence",
    instructor: "Dr. Neha Patel",
    rating: 4.9,
    students: 4800,
    desc: "Learn ML algorithms and real-world applications.",
    image: "/Home_Card/ml.png",
  },
];

const categories = [
  "All",
  "Programming",
  "Web Development",
  "Data Structures & Algorithms",
  "Artificial Intelligence",
];

const CoursePage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = coursesData.filter(
    (course) =>
      (selectedCategory === "All" ||
        course.category === selectedCategory) &&
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="pt-28 pb-20 px-6 md:px-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Explore Courses
          </h1>
          <p className="text-gray-600">
            Learn new skills and advance your career
          </p>
        </div>

        {/* Search */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center bg-white rounded-full shadow-md px-4 w-full md:w-1/2">
            <Search className="text-gray-500 mr-3" />
            <input
              type="text"
              placeholder="Search courses..."
              className="flex-grow py-2 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full font-medium transition ${
                selectedCategory === cat
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-blue-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Courses */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-md hover:scale-[1.02] transition flex flex-col"
            >
              <img
                src={course.image}
                alt={course.title}
                className="h-48 w-full object-cover rounded-t-2xl"
              />

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold mb-2">
                  {course.title}
                </h3>

                <p className="text-sm text-gray-500 mb-2">
                  {course.category}
                </p>

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={18} fill="currentColor" />
                    <span className="text-gray-700 font-medium">
                      {course.rating}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {course.students} students
                  </span>
                </div>

                <button
                  onClick={() =>
                    navigate(`/courses/${course.slug}`)
                  }
                  className="mt-auto w-full bg-blue-500 text-white py-2 rounded-full hover:bg-green-500 transition">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CoursePage;
