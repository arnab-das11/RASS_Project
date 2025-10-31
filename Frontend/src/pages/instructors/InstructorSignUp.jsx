import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InstructorSignUp = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const toggleMode = () => setIsLogin(!isLogin);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    alert(`${isLogin ? "Logging in" : "Signing up"} as Instructor`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 relative">
      
      <button
        onClick={() => navigate("/login")}
        className="absolute top-6 left-6 p-2 rounded-full bg-white shadow hover:bg-gray-200 transition">
        <ArrowLeft size={22} />
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-80 sm:w-96">
    
        <h2 className="text-2xl font-semibold mb-6 text-center">
          <span className="text-blue-600 font-bold">Instructor</span>{" "}
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              required
              className="border rounded px-3 py-2 focus:outline-none"/>
          )}

          <input
            type="text"
            placeholder="Instructor ID (IID)"
            required
            className="border rounded px-3 py-2 focus:outline-none"/>

          <input
            type="email"
            placeholder="Email"
            required
            className="border rounded px-3 py-2 focus:outline-none"/>
          <input
            type="password"
            placeholder="Password"
            required
            className="border rounded px-3 py-2 focus:outline-none"/>

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded-full hover:bg-blue-700 transition-colors">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <span
                onClick={toggleMode}
                className="text-blue-600 hover:underline cursor-pointer">
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={toggleMode}
                className="text-blue-600 hover:underline cursor-pointer">
                Login
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default InstructorSignUp;
