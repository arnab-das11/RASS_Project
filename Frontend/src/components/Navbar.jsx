import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X, User } from "lucide-react"; // ✅ Added User icon
import logo from "../assets/logo.png";

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="w-full bg-gray-300">
      <div className="flex justify-between items-center py-4 px-6 sm:px-12 xl:px-24">
        <img src={logo} alt="Logo" className="w-28 sm:w-32" />

        <form className="hidden sm:flex justify-between border border-gray-300 bg-white rounded-full shadow-sm overflow-hidden w-48 sm:w-64 md:w-80 lg:w-96">
          <input
            type="text"
            placeholder="Search"
            className="px-4 py-2 text-sm w-full focus:outline-none rounded-l-full"/>
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
            <button className="px-3 py-2 rounded-full text-sm text-black hover:bg-gray-200">
              Features
            </button>
            <button className="px-3 py-2 rounded-full text-sm text-black hover:bg-gray-200">
              Courses
            </button>
            <button className="px-3 py-2 rounded-full text-sm text-black hover:bg-gray-200">
              Contact
            </button>

            <Link
              to="/login"
              className="p-2 rounded-full hover:bg-gray-200 transition">
              <User size={20} />
            </Link>
          </div>
        </div>
      </div>

      {showSearch && (
        <div className="sm:hidden px-6 pb-3 transition-all duration-300">
          <form className="flex border border-gray-300 bg-white rounded-full shadow-sm overflow-hidden">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 text-sm w-full focus:outline-none rounded-full"
            />
          </form>
        </div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Menu</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100">
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col mt-4 px-6 space-y-3 text-gray-700">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-left px-3 py-2 rounded-lg hover:bg-gray-100">
            Features
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-left px-3 py-2 rounded-lg hover:bg-gray-100">
            Courses
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-left px-3 py-2 rounded-lg hover:bg-gray-100">
            Contact
          </button>

          <Link
            to="/login"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
            <User size={20} />
            <span>Profile</span>
          </Link>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-40"
        ></div>
      )}
    </div>
  );
};

export default Navbar;
