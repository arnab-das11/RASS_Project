import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Search, Menu, X, User, Globe, Mic, ChevronDown, 
  LogOut, LayoutDashboard 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSidebarProfileMenu, setShowSidebarProfileMenu] = useState(false);

  // --- User Info State ---
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const saved = localStorage.getItem("userInfo");
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  // Scroll Effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update User on Route Change
  useEffect(() => {
    const saved = localStorage.getItem("userInfo");
    setUserInfo(saved ? JSON.parse(saved) : null);
  }, [location]);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setIsLangModalOpen(false);
  };

  const handleLogout = () => {
    if(window.confirm(t("Are you sure you want to log out?"))) {
      localStorage.removeItem("userInfo");
      setUserInfo(null);
      
      // --- CRITICAL: Notify Header component to update ---
      window.dispatchEvent(new Event("auth-change"));
      
      navigate("/");
      setShowProfileMenu(false);
      setIsSidebarOpen(false);
    }
  };

  const getDashboardPath = () => {
    if (!userInfo) return "/";
    return userInfo.role === "admin" ? "/admin-dashboard" 
         : userInfo.role === "instructor" ? "/instructor-dashboard" 
         : "/learner-dashboard";
  };

  return (
    <>
      <div className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md shadow-md" : "bg-white shadow-sm"}`}>
        <div className={`flex justify-between items-center px-6 sm:px-12 xl:px-24 transition-all duration-300 ${isScrolled ? "py-3" : "py-4"}`}>
          
          {/* Logo */}
          <Link to="/">
            <img src={logo} alt="Logo" className={`cursor-pointer transition-all duration-300 ${isScrolled ? "w-24 sm:w-28" : "w-28 sm:w-32"}`} />
          </Link>

          {/* Desktop Search */}
          <form className="hidden sm:flex items-center border border-gray-300 bg-white hover:bg-blue-50 rounded-full shadow-sm overflow-hidden w-48 sm:w-64 md:w-80 lg:w-96 transition">
            <button type="button" className="p-2 pl-3 text-gray-500 hover:text-blue-600 transition"><Search size={18} /></button>
            <input type="text" placeholder={t("search")} className="px-2 py-2 text-sm w-full focus:outline-none bg-transparent"/>
            <button type="button" title={t("voice_search")} className="p-2 pr-3 text-gray-500 hover:text-blue-700 transition"><Mic size={18} /></button>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className="sm:hidden p-2 rounded-full hover:bg-blue-100" onClick={() => setShowSearch(!showSearch)}><Search size={20} /></button>
            <button className="sm:hidden p-2 rounded-full hover:bg-blue-100" onClick={() => setIsSidebarOpen(true)}><Menu size={22} /></button>

            <div className="hidden sm:flex items-center gap-4">
              <Link to="/features" className="px-3 py-2 rounded-full text-sm text-black hover:bg-blue-100 transition">{t("features")}</Link>
              <Link to="/courses" className="px-3 py-2 rounded-full text-sm text-black hover:bg-blue-100 transition">{t("courses")}</Link>
              <Link to="/contact" className="px-3 py-2 rounded-full text-sm text-black hover:bg-blue-100 transition">{t("contact")}</Link>

              {/* PROFILE DROPDOWN */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  className="p-1 rounded-full hover:bg-blue-50 transition flex items-center gap-1 border border-transparent hover:border-blue-100"
                  title={t("profile")}
                >
                  {/* --- NEW: AVATAR LOGIC --- */}
                  {userInfo ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md uppercase">
                        {userInfo.name?.charAt(0) || "U"}
                    </div>
                  ) : (
                    <div className="p-1.5 bg-gray-100 rounded-full text-gray-600">
                        <User size={20} />
                    </div>
                  )}
                  <ChevronDown size={14} className="text-gray-500" />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden"
                    >
                      {userInfo ? (
                        <>
                          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-500">{t("welcome")},</p>
                            <p className="text-sm font-bold text-gray-800 truncate">{userInfo.name}</p>
                          </div>
                          <Link to={getDashboardPath()} onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 w-full text-left px-4 py-3 text-blue-600 hover:bg-blue-50 transition">
                            <LayoutDashboard size={16}/> {t("dashboard")}
                          </Link>
                          <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition">
                            <LogOut size={16}/> {t("logout")}
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { navigate("/instructor-signup"); setShowProfileMenu(false); }} className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-100 transition">{t("instructor")}</button>
                          <button onClick={() => { navigate("/learner-signup"); setShowProfileMenu(false); }} className="block w-full text-left px-4 py-2 text-green-600 hover:bg-green-100 transition">{t("learner")}</button>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={() => setIsLangModalOpen(true)} className="p-2 rounded-full hover:bg-blue-100 transition cursor-pointer"><Globe size={20} /></button>
            </div>
          </div>
        </div>

        {showSearch && (
          <div className="sm:hidden px-6 pb-3 transition-all duration-300">
            <form className="flex border border-gray-300 bg-white rounded-full shadow-sm overflow-hidden">
              <input type="text" placeholder={t("search")} className="px-4 py-2 text-sm w-full focus:outline-none rounded-full"/>
            </form>
          </div>
        )}
      </div>

      {/* --- MOBILE SIDEBAR --- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-black z-40" onClick={() => setIsSidebarOpen(false)}/>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.3 }} className="fixed top-0 right-0 w-64 h-full bg-white shadow-xl z-50 flex flex-col p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">{t("menu")}</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full hover:bg-blue-100 transition"><X size={22} /></button>
              </div>

              <nav className="flex flex-col gap-3">
                <Link to="/features" onClick={() => setIsSidebarOpen(false)} className="text-gray-700 hover:text-blue-600 transition">{t("features")}</Link>
                <Link to="/courses" onClick={() => setIsSidebarOpen(false)} className="text-gray-700 hover:text-blue-600 transition">{t("courses")}</Link>
                <Link to="/contact" onClick={() => setIsSidebarOpen(false)} className="text-gray-700 hover:text-blue-600 transition">{t("contact")}</Link>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button onClick={() => setShowSidebarProfileMenu(!showSidebarProfileMenu)} className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition w-full">
                    {/* MOBILE AVATAR */}
                    {userInfo ? (
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold uppercase">{userInfo.name?.charAt(0) || "U"}</div>
                    ) : <User size={18} />}
                    
                    <span>{userInfo ? userInfo.name : t("profile")}</span>
                    <ChevronDown size={16} className={`ml-auto transition-transform ${showSidebarProfileMenu ? "rotate-180" : ""}`}/>
                  </button>

                  <AnimatePresence>
                    {showSidebarProfileMenu && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="ml-6 mt-2 flex flex-col gap-2">
                        {userInfo ? (
                            <>
                                <Link to={getDashboardPath()} onClick={() => setIsSidebarOpen(false)} className="text-blue-600 text-left hover:bg-blue-50 rounded-md px-2 py-1 transition flex items-center gap-2"><LayoutDashboard size={14}/> {t("dashboard")}</Link>
                                <button onClick={handleLogout} className="text-red-600 text-left hover:bg-red-50 rounded-md px-2 py-1 transition flex items-center gap-2"><LogOut size={14}/> {t("logout")}</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => { navigate("/instructor-signup"); setShowSidebarProfileMenu(false); setIsSidebarOpen(false); }} className="text-blue-600 text-left hover:bg-blue-100 rounded-md px-2 py-1 transition">{t("instructor")}</button>
                                <button onClick={() => { navigate("/learner-signup"); setShowSidebarProfileMenu(false); setIsSidebarOpen(false); }} className="text-green-600 text-left hover:bg-green-100 rounded-md px-2 py-1 transition">{t("learner")}</button>
                            </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button onClick={() => { setIsLangModalOpen(true); setIsSidebarOpen(false); }} className="mt-4 flex items-center gap-2 text-gray-700 hover:text-blue-600 transition w-full"><Globe size={18} /><span>{t("change_language")}</span></button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Language Modal */}
      <AnimatePresence>
        {isLangModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-black z-40" onClick={() => setIsLangModalOpen(false)}/>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4 text-center">{t("select_language")}</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => changeLanguage("en")} className={`px-3 py-2 rounded-lg transition ${i18n.language === "en" ? "bg-blue-600 text-white" : "bg-gray-50 hover:bg-gray-100"}`}>English</button>
                  <button onClick={() => changeLanguage("hi")} className={`px-3 py-2 rounded-lg transition ${i18n.language === "hi" ? "bg-blue-600 text-white" : "bg-gray-50 hover:bg-gray-100"}`}>हिंदी</button>
                  <button onClick={() => changeLanguage("bn")} className={`px-3 py-2 rounded-lg transition ${i18n.language === "bn" ? "bg-blue-600 text-white" : "bg-gray-50 hover:bg-gray-100"}`}>বাংলা</button>
                </div>
                <div className="mt-4 text-right"><button onClick={() => setIsLangModalOpen(false)} className="text-sm text-gray-600 hover:underline">{t("cancel")}</button></div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;