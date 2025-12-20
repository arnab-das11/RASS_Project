import { useState } from "react";
import { Lock, Mail, User, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const AdminSignUp = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // State for inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const toggleMode = () => setIsLogin(!isLogin);
  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin 
        ? "http://localhost:5000/api/users/login" 
        : "http://localhost:5000/api/users/register";

      const payload = { email, password };
      
      if (!isLogin) {
        payload.name = name;
        payload.role = "admin"; // Force role to Admin
      }

      const { data } = await axios.post(endpoint, payload);
      
      // --- SECURITY CHECK ---
      // If logging in, ensure the user from DB is actually an ADMIN
      if (isLogin && data.role !== 'admin') {
        alert("Access Denied: You are not authorized as an Admin.");
        return; // Stop execution immediately
      }
      // ----------------------

      localStorage.setItem("userInfo", JSON.stringify(data));
      alert(`${isLogin ? "Login" : "Sign Up"} Successful!`);
      navigate("/admin-dashboard");

    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      alert("Error: " + msg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-200 via-white to-yellow-200">
      <div className="bg-white backdrop-blur shadow-xl border-none rounded-3xl w-96 p-8 transition-all duration-500 hover:shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          {isLogin ? "Admin Login" : "Admin Sign Up"}
        </h1>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Full Name</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <User className="text-gray-400 mr-2" size={18} />
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Email</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <Mail className="text-gray-400 mr-2" size={18} />
              <input
                type="email"
                placeholder="admin@gmail.com"
                className="w-full outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-1">Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <Lock className="text-gray-400 mr-2" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={togglePassword}
                className="focus:outline-none text-gray-500 hover:text-indigo-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-green-500 hover:text-black transition-all"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={toggleMode}
            className="text-indigo-600 font-medium hover:underline"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AdminSignUp;