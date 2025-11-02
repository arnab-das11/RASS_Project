import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, User, UserRound, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InstructorSignUp = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const toggleMode = () => setIsLogin(!isLogin);
  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`${isLogin ? "Logging in" : "Signing up"} as Instructor`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 relative">
      
      <button
        onClick={() => navigate("/login")}
        className="absolute top-6 left-6 p-2 rounded-full bg-white shadow hover:bg-blue-200 transition">
        <ArrowLeft size={22} />
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-80 sm:w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          <span className="text-blue-600 font-bold">Instructor </span>
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
    
          {!isLogin && (
            <div className="flex items-center border rounded px-3 py-2">
              <UserRound className="text-gray-400 mr-2" size={18} />
              <input
                type="text"
                placeholder="Full Name"
                required
                className="w-full focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center border rounded px-3 py-2">
            <User className="text-gray-400 mr-2" size={18} />
            <input
              type="text"
              placeholder="Instructor ID (IID)"
              required
              className="w-full focus:outline-none"/>
          </div>

          <div className="flex items-center border rounded px-3 py-2">
            <Mail className="text-gray-400 mr-2" size={18} />
            <input type="email"
              placeholder="instructor@gmail.com"
              required
              className="w-full focus:outline-none"/>
          </div>

          <div className="flex items-center border rounded px-3 py-2">
            <Lock className="text-gray-400 mr-2" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="w-full focus:outline-none"/>
            <button
              type="button"
              onClick={togglePassword}
              className="text-gray-500 hover:text-blue-600 focus:outline-none">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

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


