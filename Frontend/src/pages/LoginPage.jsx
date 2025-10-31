import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 relative">
      
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 p-2 rounded-full bg-white shadow hover:bg-gray-200 transition">
        <ArrowLeft size={22} />
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-80 sm:w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center">Continue as</h2>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/instructor-signup")}
            className="bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600 transition-colors">
            Instructor
          </button>
          <button
            onClick={() => navigate("/learner-signup")}
            className="bg-green-500 text-white py-2 rounded-full hover:bg-green-600 transition-colors">
            Learner
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
