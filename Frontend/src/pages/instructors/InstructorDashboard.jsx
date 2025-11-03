import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, PlusCircle, Edit, Trash2, UploadCloud, Users} from "lucide-react";

const sampleCourses = [
  {
    id: "c1",
    title: "Web Development Basics",
    description: "A practical course to build beautiful React UIs.",
    learners: [
      { id: "L1001", name: "Arnab Das", progress: 76 },
      { id: "L1002", name: "Rishav Biswas", progress: 100 },
    ],
  },
  {
    id: "c2",
    title: "Machine Learning using AI",
    description: "Learn the fundamentals of ML and model deployment.",
    learners: [
      { id: "L1003", name: "Debojyoti Mitra", progress: 42 },
      { id: "L1004", name: "Soumyadeep Bagchi", progress: 18 },
    ],
  },
];

const InstructorDashboard = () => {
  const [courses, setCourses] = useState(sampleCourses);
  const [requests, setRequests] = useState([
    { id: "r1", title: "Advanced CSS Grid", status: "Pending" },
  ]);
  const [showNewReq, setShowNewReq] = useState(false);
  const [newReqTitle, setNewReqTitle] = useState("");
  const [editing, setEditing] = useState(null);
  const [aiEditPrompt, setAiEditPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleUploadRequest = (e) => {
    e.preventDefault();
    if (!newReqTitle.trim()) return;
    const newReq = {
      id: `r${Date.now()}`,
      title: newReqTitle,
      status: "Pending",
    };
    setRequests((prev) => [newReq, ...prev]);
    setNewReqTitle("");
    setShowNewReq(false);
  };

  const handleDeleteRequest = (id) => {
    if (!window.confirm("Delete this request?")) return;
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleLogout = () => {
    alert("Logging out...");
  };

  const openEdit = (courseId) => {
    setEditing(courseId);
    setAiEditPrompt("");
  };

  const handleAiEdit = async (courseId) => {
    setAiBusy(true);
    await new Promise((r) => setTimeout(r, 1000));
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? { ...c, description: c.description + " (Edited: " + aiEditPrompt + ")" }
          : c
      )
    );
    setEditing(null);
    setAiBusy(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#0f2744] to-[#132e53] text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex items-center justify-between mb-10">
          <motion.h1
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-extrabold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
            Instructor Portfolio
          </motion.h1>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a2a44] border border-blue-600/40 hover:bg-blue-900/40 transition">
              <User size={18} /> <span className="hidden sm:block">My Profile</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 transition">
              <LogOut size={18} /> <span className="hidden sm:block">Logout</span>
            </motion.button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-[#112240]/70 rounded-2xl shadow-lg backdrop-blur-md border border-blue-800/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sky-300 text-lg">Course Requests</h2>
              <button
                onClick={() => setShowNewReq(!showNewReq)}
                className="flex items-center gap-1 text-sky-400 hover:text-sky-200 font-medium">
                <PlusCircle size={18} /> New
              </button>
            </div>

            <AnimatePresence>
              {showNewReq && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleUploadRequest}
                  className="mb-4 bg-[#1b3558]/80 p-3 rounded-xl">
                  <input
                    value={newReqTitle}
                    onChange={(e) => setNewReqTitle(e.target.value)}
                    placeholder="Enter course title"
                    className="w-full p-2 border border-blue-700 rounded mb-2 text-sm bg-[#0d1b2a] text-white focus:ring-2 focus:ring-sky-400 outline-none"/>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 rounded bg-gradient-to-r from-blue-500 to-sky-500 text-white flex items-center justify-center gap-2 hover:from-blue-600 hover:to-sky-600 transition">
                      <UploadCloud size={16} /> Send
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewReq(false)}
                      className="px-3 py-2 rounded border border-slate-600 text-slate-300 hover:bg-slate-700 transition">
                      Cancel
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <ul className="space-y-3">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#1a2b49]/50 border border-blue-800/50 hover:bg-[#1e3153] transition">
                  <div>
                    <div className="font-medium text-sky-300">{r.title}</div>
                    <div className="text-xs text-slate-400">{r.status}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteRequest(r.id)}
                    className="p-2 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40 transition">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </motion.section>

          <section className="lg:col-span-2 space-y-8">
            {courses.map((course) => (
              <motion.article
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-[#122a46]/80 rounded-2xl border border-blue-800/50 shadow-lg hover:shadow-sky-500/20 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-xl font-semibold text-sky-300">{course.title}</h4>
                    <p className="text-sm text-slate-300">{course.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(course.id)}
                      className="p-2 rounded bg-sky-500/30 text-sky-200 hover:bg-sky-500/60 transition">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (!window.confirm("Delete course?")) return;
                        setCourses((prev) => prev.filter((c) => c.id !== course.id));
                      }}
                      className="p-2 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-2 text-slate-300">Enrolled Learners</h5>
                  {course.learners.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#0e2038]/60 hover:bg-[#122a46] transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center font-semibold text-sky-300">
                          {l.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-white">{l.name}</div>
                          <div className="text-xs text-slate-400">Progress</div>
                        </div>
                      </div>

                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle cx="24" cy="24" r="20" stroke="#1e3a5f" strokeWidth="4" fill="transparent" />
                          <motion.circle cx="24" cy="24" r="20"
                            stroke="#38bdf8" strokeWidth="4" fill="transparent"
                            strokeLinecap="round" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * l.progress) / 100}
                            initial={{ strokeDashoffset: 125.6 }}
                            animate={{
                              strokeDashoffset: 125.6 - (125.6 * l.progress) / 100,
                            }}
                            transition={{ duration: 1 }}/>
                        </svg>
                        <div className="absolute text-xs font-semibold text-sky-300">
                          {l.progress}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.article>
            ))}
          </section>
        </main>

        <AnimatePresence>
          {profileOpen && (
            <motion.aside
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="fixed right-6 top-6 z-50 w-80 bg-[#0d1b2a] text-white p-5 rounded-2xl shadow-xl border border-blue-800/60">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-sky-500/20 flex items-center justify-center font-semibold text-sky-300">
                    SS
                  </div>
                  <div>
                    <div className="font-semibold">Sahitya Sk</div>
                    <div className="text-xs text-slate-400">Instructor</div>
                  </div>
                </div>
                <button
                  onClick={() => setProfileOpen(false)}
                  className="h-8 w-8 rounded-xl bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 font-semibold">
                  ✕
                </button>
              </div>

              <div className="text-sm space-y-3">
                <div>
                  <div className="text-xs text-slate-400">Email</div>
                  <div>sahityask@gmail.com</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Bio</div>
                  <div>
                    Passionate about teaching and building interactive web
                    experiences.
                  </div>
                </div>
                <button className="w-full mt-4 px-3 py-2 rounded bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:from-blue-600 hover:to-sky-600 transition flex items-center justify-center gap-2">
                  <Users size={16} /> Manage Account
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InstructorDashboard;
