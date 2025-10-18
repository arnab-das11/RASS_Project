import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = () => {
  return (
    <div className="w-full bg-gray-300">
      <div className="flex justify-between items-center py-4 px-8 sm:px-12 xl:px-24">
        <img src={logo} alt="Logo" className="w-32 sm:w-32" />

        <form className="flex justify-between w-3xl max-sm:scale-75 mx-auto border border-gray-300 bg-white rounded overflow-hidden shadow-sm">
          <input type="text" placeholder="Search"
            className="px-4 py-2 rounded-full text-sm w-32 sm:w-48 focus:outline-none" />
        </form>

        <div className="flex items-center gap-2 px-4 sm:gap-4">
          <button className="px-4 py-2 rounded-full text-sm text-black hover:bg-gray-200"> Features </button>
          <button className="px-4 py-2 rounded-full text-sm text-black hover:bg-gray-200"> Courses </button>
          <button className="px-4 py-2 rounded-full text-sm text-black hover:bg-gray-200"> Contact </button>

          <Link to="/login" className="px-4 py-2 rounded-full text-sm text-black hover:bg-gray-200"> Login </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

