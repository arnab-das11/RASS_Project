import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X, User, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false); 
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setIsLangModalOpen(false); 
  };

  return (
    <div className="w-full bg-gray-300">
    
      <div className="flex justify-between items-center py-4 px-6 sm:px-12 xl:px-24">
        <Link to="/">
          <img src={logo} alt="Logo" className="w-28 sm:w-32 cursor-pointer" />
        </Link>

        <form className="hidden sm:flex justify-between border border-gray-300 bg-white rounded-full shadow-sm overflow-hidden w-48 sm:w-64 md:w-80 lg:w-96">
          <input
            type="text"
            placeholder="Search"
            className="px-4 py-2 text-sm w-full focus:outline-none rounded-l-full"
          />
        </form>

        <div className="flex items-center gap-3">
          
          <button
            className="sm:hidden p-2 rounded-full hover:bg-gray-200"
            onClick={() => setShowSearch(!showSearch)}>
            <Search size={20} />
          </button>

          <button
            className="sm:hidden p-2 rounded-full hover:bg-gray-200"
            onClick={() => setIsSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          <div className="hidden sm:flex items-center gap-2 sm:gap-4">
            <Link
              to="/features"
              className="px-3 py-2 rounded-full text-sm text-black hover:bg-gray-200 transition">
              {t("features")}
            </Link>

            <Link
              to="/courses"
              className="px-3 py-2 rounded-full text-sm text-black hover:bg-gray-200 transition">
              {t("courses")}
            </Link>

            <Link
              to="/contact"
              className="px-3 py-2 rounded-full text-sm text-black hover:bg-gray-200 transition">
              {t("contact")}
            </Link>

            <Link
              to="/login"
              className="p-2 rounded-full hover:bg-gray-200 transition">
              <User size={20} />
            </Link>

            <button
              onClick={() => setIsLangModalOpen(true)}
              className="p-2 rounded-full hover:bg-gray-200 transition"
              title="Change Language">
              <Globe size={20} />
            </button>
          </div>
        </div>
      </div>

      {showSearch && (
        <div className="sm:hidden px-6 pb-3 transition-all duration-300">
          <form className="flex border border-gray-300 bg-white rounded-full shadow-sm overflow-hidden">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 text-sm w-full focus:outline-none rounded-full"/>
          </form>
        </div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-700">{t("menu")}</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100">
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col mt-4 px-6 space-y-3 text-gray-700">
          <Link
            to="/features"
            onClick={() => setIsSidebarOpen(false)}
            className="text-left px-3 py-2 rounded-lg hover:bg-gray-100">
            {t("features")}
          </Link>

          <Link
            to="/courses"
            onClick={() => setIsSidebarOpen(false)}
            className="text-left px-3 py-2 rounded-lg hover:bg-gray-100">
            {t("courses")}
          </Link>

          <Link
            to="/contact"
            onClick={() => setIsSidebarOpen(false)}
            className="text-left px-3 py-2 rounded-lg hover:bg-gray-100">
            {t("contact")}
          </Link>

          <Link
            to="/login"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
            <User size={20} />
            <span>{t("profile")}</span>
          </Link>

          <button
            onClick={() => setIsLangModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-left">
            <Globe size={20} />
            <span>Change Language</span>
          </button>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-40">
        </div>
      )}

      {isLangModalOpen && (
        <>
          
          <div
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur"
            onClick={() => setIsLangModalOpen(false)}>
          </div>

          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-80 text-center">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Select Language
              </h2>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => changeLanguage("en")}
                  className={`py-2 rounded-lg border ${
                    i18n.language === "en"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-green-200"
                  } transition`}>
                  English
                </button>

                <button
                  onClick={() => changeLanguage("hi")}
                  className={`py-2 rounded-lg border ${
                    i18n.language === "hi"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-green-200"
                  } transition`}>
                  हिंदी
                </button>

                <button
                  onClick={() => changeLanguage("bn")}
                  className={`py-2 rounded-lg border ${
                    i18n.language === "bn"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-green-200"
                  } transition`}>
                  বাংলা
                </button>
              </div>

              <button
                onClick={() => setIsLangModalOpen(false)}
                className="mt-4 text-sm text-gray-600 hover:underline">
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;
