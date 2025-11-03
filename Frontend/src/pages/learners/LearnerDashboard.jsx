import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, PlayCircle, BookOpen, Star, CheckCircle2 } from "lucide-react";

const sampleCourses = [
  {
    id: "c1",
    title: "AI for Beginners",
    description: "Understand Artificial Intelligence fundamentals.",
    progress: 75,
    status: "In Progress",
  },
  {
    id: "c2",
    title: "React Mastery",
    description: "Build dynamic web apps using React.",
    progress: 100,
    status: "Completed",
  },
  {
    id: "c3",
    title: "Data Visualization",
    description: "Learn to visualize data using D3.js & Chart.js.",
    progress: 45,
    status: "In Progress",
  },
];

const recommendedCourses = [
  {
    id: "r1",
    title: "Machine Learning Essentials",
    description: "Kickstart your ML journey with practical examples.",
  },
  {
    id: "r2",
    title: "Next.js Crash Course",
    description: "Learn modern server-side rendering with Next.js.",
  },
];

const LearnerDashboard = () => {
  const [courses] = useState(sampleCourses);
  const [recommended] = useState(recommendedCourses);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    alert("Logging out...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c7ede1] via-[#a1d8c5] to-[#86cbb5] text-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex items-center justify-between mb-10">
          <motion.h1
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-extrabold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent drop-shadow-md">
            Learner Dashboard
          </motion.h1>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 hover:bg-teal-100 transition text-teal-700">
              <User size={18} /> <span className="hidden sm:block">My Profile</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition text-white">
              <LogOut size={18} /> <span className="hidden sm:block">Logout</span>
            </motion.button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 p-6 bg-white/80 rounded-2xl shadow-lg backdrop-blur-md border border-emerald-200">
            <h2 className="font-semibold text-emerald-800 text-lg mb-5">My Enrolled Courses</h2>

            <div className="space-y-5">
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  whileHover={{ scale: 1.01 }}
                  className="p-5 bg-[#f3faf7] rounded-xl border border-emerald-200 hover:bg-[#e7f5ee] transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-emerald-700">{course.title}</h4>
                      <p className="text-sm text-gray-600">{course.description}</p>
                    </div>
                    {course.status === "Completed" ? (
                      <CheckCircle2 size={22} className="text-emerald-600" />
                    ) : (
                      <PlayCircle size={22} className="text-teal-600" />
                    )}
                  </div>

                  <div className="mt-2">
                    <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-600">
                      </motion.div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-700">
                      <span>{course.status}</span>
                      <span>{course.progress}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white/80 rounded-2xl shadow-lg backdrop-blur-md border border-emerald-200">
            <h2 className="font-semibold text-emerald-800 text-lg mb-4 flex items-center gap-2">
              <Star size={18} className="text-emerald-600" /> Recommended Courses
            </h2>

            <div className="space-y-4">
              {recommended.map((rec) => (
                <motion.div
                  key={rec.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-[#f3faf7] rounded-xl border border-emerald-200 hover:bg-[#e7f5ee] transition">
                  <h3 className="text-emerald-700 font-medium">{rec.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                  <button className="px-3 py-2 rounded bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium flex items-center gap-2 hover:from-emerald-700 hover:to-teal-700 transition">
                    <BookOpen size={16} /> View Course
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </main>

        <AnimatePresence>
          {profileOpen && (
            <motion.aside
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="fixed right-6 top-6 z-50 w-80 bg-white text-gray-900 p-5 rounded-2xl shadow-xl border border-emerald-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 flex items-center justify-center font-semibold text-white">
                    RB
                  </div>
                  <div>
                    <div className="font-semibold text-emerald-800">Rishav Biswas</div>
                    <div className="text-xs text-gray-600">Learner</div>
                  </div>
                </div>
                <button
                  onClick={() => setProfileOpen(false)}
                  className="h-8 w-8 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-500 font-semibold">
                  ✕
                </button>
              </div>

              <div className="text-sm space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div>rishav@gmail.com</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Bio</div>
                  <div>
                    Dedicated to mastering AI, web development, and lifelong learning.
                  </div>
                </div>
                <button className="w-full mt-4 px-3 py-2 rounded bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 transition flex items-center justify-center gap-2">
                  <User size={16} /> Edit Profile
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LearnerDashboard;
