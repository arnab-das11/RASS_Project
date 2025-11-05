import React from "react";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 bg-gray-300">
      <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-gray-500/30 text-gray-500">
        

        <div>
          <img src={logo} alt="logo" className="w-32 sm:w-44" />
          <p className="max-w-[410px] mt-6">
            Our platform makes learning easier, clearer, and more motivating. Instead of searching all over the internet, learners get a guided path to follow, step by step. Instructors can share resources in an organized way, and learners can track progress and earn certificates. Built with a smooth MERN experience, it will soon offer smart course suggestions and career-focused guidance to support real growth.
          </p>
        </div>

        
        <div className="flex flex-wrap justify-between w-full md:w-[45%] gap-5">
          
          <div>
            <h3 className="font-semibold text-base text-gray-900 md:mb-5 mb-2">
              Company
            </h3>
            <ul className="text-sm space-y-1">
              <li><a href="#" className="hover:underline transition">About Us</a></li>
              <li><a href="#" className="hover:underline transition">Careers</a></li>
              <li><a href="#" className="hover:underline transition">Blog</a></li>
            </ul>
          </div>


          <div>
            <h3 className="font-semibold text-base text-gray-900 md:mb-5 mb-2">
              Support
            </h3>
            <ul className="text-sm space-y-1">
              <li><a href="#" className="hover:underline transition">Help Center</a></li>
              <li><a href="#" className="hover:underline transition">Contact Us</a></li>
              <li><a href="#" className="hover:underline transition">Privacy Policy</a></li>
            </ul>
          </div>

    
          <div>
            <h3 className="font-semibold text-base text-gray-900 md:mb-5 mb-2">
              Follow Us
            </h3>
            <ul className="text-sm space-y-1">
              <li><a href="#" className="hover:underline transition">Instagram</a></li>
              <li><a href="#" className="hover:underline transition">Twitter</a></li>
              <li><a href="#" className="hover:underline transition">Facebook</a></li>
            </ul>
          </div>
        </div>
      </div>


      <p className="py-4 text-center text-sm md:text-base text-gray-500/80">
        © 2025 | LearnX | All Rights Reserved
      </p>
    </div>
  );
};

export default Footer;
