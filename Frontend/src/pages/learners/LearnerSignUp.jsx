import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LearnerSignUp = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const toggleMode = () => setIsLogin(!isLogin);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 relative">
      <button
        onClick={() => navigate("/login")}
        className="absolute top-6 left-6 p-2 rounded-full bg-white shadow hover:bg-blue-200 transition"
      >
        <ArrowLeft size={22} />
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-80 sm:w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center">
        <span className="text-green-600 font-bold"> Learner </span>
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        <form className="flex flex-col gap-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="border rounded px-3 py-2 focus:outline-none"/>
          )}
          <input
            type="email"
            placeholder="Email"
            className="border rounded px-3 py-2 focus:outline-none"/>
          <input
            type="password"
            placeholder="Password"
            className="border rounded px-3 py-2 focus:outline-none"/>

          <button
            type="submit"
            className="bg-green-500 text-white py-2 rounded-full hover:bg-green-700 transition-colors">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <span onClick={toggleMode}
                className="text-green-600 hover:underline cursor-pointer">
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span onClick={toggleMode}
                className="text-green-600 hover:underline cursor-pointer">
                Login
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LearnerSignUp;
