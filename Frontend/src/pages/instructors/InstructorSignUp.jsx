import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, User, UserRound, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from 'axios'; // Import Axios
import instructorImg from "../../assets/instructor-bg.png";

const InstructorSignUp = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // --- STATE VARIABLES ---
  const [name, setName] = useState("");
  const [iid, setIid] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // -----------------------

  const toggleMode = () => setIsLogin(!isLogin);
  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = isLogin 
        ? "http://localhost:5000/api/users/login" 
        : "http://localhost:5000/api/users/register";

      const payload = { email, password };

      // If signing up, add Name, Role, and Instructor ID
      if (!isLogin) {
        payload.name = name;
        payload.role = "instructor"; // Force role to instructor
        payload.iid = iid;
      }

      const { data } = await axios.post(endpoint, payload);

      // Success
      alert(isLogin ? "Login Successful!" : "Signup Successful!");
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/instructor-dashboard");

    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      alert("Error: " + errorMsg);
    }
  };

  const handleGoogleLogin = () => {
    window.open("https://accounts.google.com/signin", "_blank");
  };

  return (
    <div className="flex min-h-screen bg-white relative overflow-hidden">
      <button
        onClick={() => navigate("/")}
        className="fixed z-50 top-6 left-6 p-2 rounded-full bg-gray-50 shadow hover:bg-blue-200 transition">
        <ArrowLeft size={22} />
      </button>

      {/* Left Side Image */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 justify-center items-center">
        <img
          src={instructorImg || "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=800"}
          alt="Instructor"
          className="w-3/4 h-auto object-contain rounded-2xl drop-shadow-xl"
          onError={(e) => {
             e.target.onerror = null;
             e.target.src = "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=800";
          }}/>
      </motion.div>

      {/* Right Side Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white relative p-6 sm:p-10">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
            <span className="text-blue-600 font-bold">Instructor </span>
            {isLogin ? "Login" : "Sign Up"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:border-blue-400">
                <UserRound className="text-gray-400 mr-2" size={18} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-transparent focus:outline-none"/>
              </div>
            )}

            {!isLogin && (
               <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:border-blue-400">
                <User className="text-gray-400 mr-2" size={18} />
                <input
                  type="text"
                  placeholder="Instructor ID (IID)"
                  value={iid}
                  onChange={(e) => setIid(e.target.value)}
                  required
                  className="w-full bg-transparent focus:outline-none"/>
              </div>
            )}

            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:border-blue-400">
              <Mail className="text-gray-400 mr-2" size={18} />
              <input
                type="email"
                placeholder="instructor@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent focus:outline-none"/>
            </div>

            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:border-blue-400">
              <Lock className="text-gray-400 mr-2" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent focus:outline-none"/>
              <button
                type="button"
                onClick={togglePassword}
                className="text-gray-500 hover:text-blue-600 focus:outline-none">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white py-2.5 rounded-full hover:bg-blue-700 transition-colors shadow-md">
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>

          {/* Footer (Google Login etc.) */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-2 text-sm text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center w-full py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition">
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className="w-5 h-5 mr-2"/>
            <span className="text-gray-700 font-medium">
              Continue with Google
            </span>
          </button>

          <p className="mt-5 text-sm text-center text-gray-600">
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
      </motion.div>
    </div>
  );
};

export default InstructorSignUp;