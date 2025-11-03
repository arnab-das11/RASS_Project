import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, PlusCircle, Edit, Trash2, UploadCloud, Users } from "lucide-react";

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
    description: "Accessibility fundamentals and modern UI patterns.",
    learners: [
      { id: "L1003", name: "Debojyoti Mitra", progress: 42 },
      { id: "L1004", name: "Soumyadeep Bagchi", progress: 18 },
    ],
  },
];

const InstructorDashboard = () => {
  const [courses, setCourses] = useState(sampleCourses);
  const [requests, setRequests] = useState([{ id: "r1", title: "Advanced CSS Grid", status: "Pending" }]);
  const [showNewReq, setShowNewReq] = useState(false);
  const [newReqTitle, setNewReqTitle] = useState("");
  const [editing, setEditing] = useState(null);
  const [aiEditPrompt, setAiEditPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleUploadRequest = (e) => {
    e.preventDefault();
    if (!newReqTitle.trim()) return;
    const newReq = { id: `r${Date.now()}`, title: newReqTitle, status: "Pending" };
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex items-center justify-between mb-8">
          <motion.h1
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-extrabold text-blue-600 tracking-tight">
            Instructor 
            <span className="text-black/80"> Dashboard </span>
          </motion.h1>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow hover:bg-blue-50 transition">
              <User size={18} /> <span className="hidden sm:block">My Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-black shadow hover:bg-red-200 transition">
              <LogOut size={18} /> <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-white rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 text-lg">Course Requests</h2>
              <button
                onClick={() => setShowNewReq(!showNewReq)}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-600 font-medium">
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
                  className="mb-4 bg-blue-50 p-3 rounded-xl">
                  <input
                    value={newReqTitle}
                    onChange={(e) => setNewReqTitle(e.target.value)}
                    placeholder="Enter course title"
                    className="w-full p-2 border rounded mb-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"/>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 rounded bg-blue-500 text-white flex items-center justify-center gap-2 hover:bg-blue-600 transition">
                      <UploadCloud size={16} /> Send
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewReq(false)}
                      className="px-3 py-2 rounded border hover:bg-slate-50 transition">
                      Cancel
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <ul className="space-y-2">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-xl border hover:shadow-sm transition">
                  <div>
                    <div className="font-medium text-slate-800">{r.title}</div>
                    <div className="text-xs text-slate-500">{r.status}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteRequest(r.id)}
                    className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100 transition">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </motion.section>

          <section className="lg:col-span-2 space-y-6">
            {courses.map((course) => (
              <motion.article
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-xl font-semibold text-slate-800">{course.title}</h4>
                    <p className="text-sm text-slate-600">{course.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(course.id)}
                      className="p-2 rounded bg-blue-400 text-white hover:bg-blue-600 transition">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (!window.confirm("Delete course?")) return;
                        setCourses((prev) => prev.filter((c) => c.id !== course.id));
                      }}
                      className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-2 text-slate-700">Enrolled Learners</h5>
                  {course.learners.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-slate-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700">
                          {l.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{l.name}</div>
                          <div className="text-xs text-slate-500">Progress</div>
                        </div>
                      </div>

                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle cx="24" cy="24" r="20" stroke="#E5E7EB" strokeWidth="4" fill="transparent" />
                          <motion.circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="#3B82F6"
                            strokeWidth="4"
                            fill="transparent"
                            strokeLinecap="round"
                            strokeDasharray={125.6}
                            strokeDashoffset={125.6 - (125.6 * l.progress) / 100}
                            initial={{ strokeDashoffset: 125.6 }}
                            animate={{ strokeDashoffset: 125.6 - (125.6 * l.progress) / 100 }}
                            transition={{ duration: 1 }}/>
                        </svg>
                        <div className="absolute text-xs font-semibold text-slate-700">{l.progress}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.article>
            ))}
          </section>
        </main>

        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl">
                <h3 className="text-lg font-semibold mb-3 text-slate-800">Edit Course with Gemini AI</h3>
                <textarea
                  value={aiEditPrompt}
                  onChange={(e) => setAiEditPrompt(e.target.value)}
                  rows={6}
                  className="w-full p-3 border rounded mb-4 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Describe how you want to improve the course..."/>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 rounded border hover:bg-slate-50 transition">
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAiEdit(editing)}
                    disabled={aiBusy || !aiEditPrompt.trim()}
                    className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-green-500 transition">
                    {aiBusy ? "Applying..." : "Apply Edit"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {profileOpen && (
            <motion.aside
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="fixed right-6 top-6 z-50 w-80 bg-white p-5 rounded-2xl shadow-xl border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700">
                    SS
                  </div>
                  <div>
                    <div className="font-semibold">Sahitya Sk</div>
                    <div className="text-xs text-slate-500">Instructor</div>
                  </div>
                </div>
                <button onClick={() => setProfileOpen(false)} className="h-8 w-8 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center font-semibold text-red-700">
                  ✕
                </button>
              </div>

              <div className="text-sm space-y-3">
                <div>
                  <div className="text-xs text-slate-500">Email</div>
                  <div>sahityask@gmail.com</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Bio</div>
                  <div>Passionate about teaching design and front-end engineering.</div>
                </div>
                <button className="w-full mt-4 px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-700 transition flex items-center justify-center gap-2">
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
