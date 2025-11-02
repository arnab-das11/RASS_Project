import { useState } from "react";
import { Lock, Mail, User, Eye, EyeOff } from "lucide-react";

const AdminSignUp = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const toggleMode = () => setIsLogin(!isLogin);
  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-200 via-white to-yellow-200">
      <div className="bg-white backdrop-blur shadow-xl border-none rounded-3xl w-96 p-8 transition-all duration-500 hover:shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          {isLogin ? "Admin Login" : "Admin Sign Up"}
        </h1>

        {!isLogin && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Full Name</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <User className="text-gray-400 mr-2" size={18} />
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full outline-none"/>
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
              className="w-full outline-none"/>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Password</label>
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
            <Lock className="text-gray-400 mr-2" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full outline-none"/>
            <button
              type="button"
              onClick={togglePassword}
              className="focus:outline-none text-gray-500 hover:text-indigo-600">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-green-500 hover:text-black transition-all">
          {isLogin ? "Login" : "Sign Up"}
        </button>

        <p className="text-center text-gray-600 mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={toggleMode}
            className="text-indigo-600 font-medium hover:underline">
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AdminSignUp;

