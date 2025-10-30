import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const LoginPage = () => {
  const [role, setRole] = useState(null); 
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate(); 

  const toggleMode = () => setIsLogin(!isLogin);

  const resetSelection = () => {
    setRole(null);
    setIsLogin(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 relative">

      {!role && (
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 p-2 rounded-full bg-white shadow hover:bg-gray-200 transition">
          <ArrowLeft size={22} />
        </button>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-lg w-80 sm:w-96 transition-all duration-300">
        {!role ? (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-6">Continue as</h2>
            <div className="flex flex-col gap-4">
              <button onClick={() => setRole("instructor")}
                className="bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600 transition-colors">
                Instructor
              </button>
              <button onClick={() => setRole("learner")}
                className="bg-green-500 text-white py-2 rounded-full hover:bg-green-600 transition-colors">
                Learner
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-center">
              {isLogin ? "Login" : "Sign Up"} as{" "}
              <span className="capitalize text-blue-600">{role}</span>
            </h2>

            <form className="flex flex-col gap-4">
              {!isLogin && (
                <input type="text" placeholder="Full Name"
                  className="border rounded px-3 py-2 focus:outline-none"/>
              )}
              <input type="email" placeholder="Email"
                className="border rounded px-3 py-2 focus:outline-none"/>
              <input type="password" placeholder="Password"
                className="border rounded px-3 py-2 focus:outline-none"/>
              <button type="submit"
                className="bg-blue-500 text-white py-2 rounded-full hover:bg-blue-700 transition-colors">
                {isLogin ? "Login" : "Sign Up"}
              </button>
            </form>

            <p className="mt-4 text-sm text-center text-gray-600">
              {isLogin ? (
                <>
                  Don't have an account?{" "}
                  <span
                    className="text-blue-600 hover:underline cursor-pointer"
                    onClick={toggleMode}>
                    Sign Up
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span
                    className="text-blue-600 hover:underline cursor-pointer"
                    onClick={toggleMode}>
                    Login
                  </span>
                </>
              )}
            </p>

            <p className="mt-4 text-center text-gray-500 text-sm cursor-pointer hover:underline"
              onClick={resetSelection}>
              ← Back to Role Selection
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
