import { useState } from "react";
import { Menu, X, Users, BookOpen, GraduationCap, Settings, BarChart3, LogOut, LayoutDashboard} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [isScrolled, setIsScrolled] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      <aside
        className={`fixed z-20 top-0 left-0 h-screen bg-yellow-200 text-black w-64 p-6 flex flex-col transition-transform duration-500 ease-in-out transform
        ${sidebarOpen ? "translate-x-0" : "-translate-x-64"}
        md:translate-x-0 md:relative`}>

        <div className="flex items-center justify-between mb-10">
          <Link to="/">
            <img
              src={logo}
              alt="Logo"
              className={`cursor-pointer transition-all duration-300 ${
                isScrolled ? "w-24 sm:w-28" : "w-28 sm:w-32"
              }`}/>
          </Link>
          <button className="md:hidden text-white" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-hide">
          <p className="text-xs uppercase text-indigo-500 font-semibold mb-3 px-2">
            Main
          </p>
          <div className="space-y-2 mb-6">
            <button className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-400 transition">
              <LayoutDashboard size={20} /> Dashboard
            </button>
          </div>

          <p className="text-xs uppercase text-indigo-500 font-semibold mb-3 px-2">
            Management
          </p>
          <div className="space-y-2">
            <button className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-400 transition">
              <Users size={20} /> Learners
            </button>
            <button className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-400 transition">
              <Users size={20} /> Instructors
            </button>
            <button className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-400 transition">
              <BookOpen size={20} /> Courses
            </button>
            <button className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-400 transition">
              <GraduationCap size={20} /> Enrollments
            </button>
          </div>

          <p className="text-xs uppercase text-indigo-500 font-semibold mb-3 mt-6 px-2">
            Settings
          </p>
          <div className="space-y-2">
            <button className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-400 transition">
              <Settings size={20} /> Preferences
            </button>
          </div>
        </nav>

        <div className="pt-4 border-t border-yellow-400 mt-6">
          <button className="flex items-center gap-3 text-left w-full px-3 py-2 rounded-lg hover:bg-yellow-400 transition">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        
        <header className="flex items-center justify-between bg-white shadow px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-indigo-700"
              onClick={toggleSidebar}
            >
              <Menu size={26} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <img
              src="b_logo.svg"
              alt="Admin Avatar"
              className="w-10 h-10 rounded-full border-2 border-white hover:border-green-500"
            />
          </div>
        </header>

        <main className="p-6 overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Total Students",
                value: "1,254",
                icon: <GraduationCap size={36} className="text-indigo-500" />,
              },
              {
                title: "Active Courses",
                value: "32",
                icon: <BookOpen size={36} className="text-indigo-500" />,
              },
              {
                title: "Instructors",
                value: "18",
                icon: <Users size={36} className="text-indigo-500" />,
              },
              {
                title: "Revenue",
                value: "$12,480",
                icon: <BarChart3 size={36} className="text-indigo-500" />,
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-500 text-sm">{card.title}</h3>
                    <p className="text-2xl font-bold text-indigo-700 mt-1">
                      {card.value}
                    </p>
                  </div>
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Recent Activity
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li>✅ New course "Web Development" added by Instructor John.</li>
              <li>👩‍🎓 Student Alice enrolled in "Python for Beginners".</li>
              <li>📈 Monthly report generated successfully.</li>
              <li>⚙️ Admin profile updated.</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
