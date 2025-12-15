import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, UserRound, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from 'axios'; // Import the messenger
import learnerImg from "../../assets/learner-bg.png";

const LearnerSignUp = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // --- NEW: These are the variables to store user input ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // --------------------------------------------------------

  const toggleMode = () => setIsLogin(!isLogin);
  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Decide which URL to call (Login or Register)
      const endpoint = isLogin 
        ? "http://localhost:5000/api/users/login" 
        : "http://localhost:5000/api/users/register";

      // 2. Prepare the data to send
      const payload = { email, password };

      // If signing up, we also need the Name and Role
      if (!isLogin) {
        payload.name = name;
        payload.role = "learner";
      }

      // 3. Send the message to the Backend
      const { data } = await axios.post(endpoint, payload);

      // 4. Success! Save the user info and go to dashboard
      alert(isLogin ? "Login Successful!" : "Signup Successful!");
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/learner-dashboard");

    } catch (error) {
       // Handle errors (like "User already exists" or "Wrong password")
       const errorMsg = error.response && error.response.data.message 
         ? error.response.data.message 
         : error.message;
       alert("Error: " + errorMsg);
    }
  };

  const handleGoogleSignIn = () => {
    window.open("https://accounts.google.com/signin", "_blank");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 relative">
      
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 p-2 z-50 rounded-full bg-white shadow hover:bg-green-100 transition">
        <ArrowLeft size={22} />
      </button>

      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex w-1/2 bg-gradient-to-br from-green-100 via-green-200 to-green-300 items-center justify-center p-10">
        <img
          src={learnerImg}
          alt="Learner"
          className="w-4/5 max-w-md rounded-3xl shadow-2xl"/>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center">
            <span className="text-green-600">
              {isLogin ? "Learner Login" : "Learner Sign Up"}
            </span>
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                <UserRound className="text-gray-400 mr-2" size={18} />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-transparent focus:outline-none"
                  // --- CONNECTING INPUT TO VARIABLE ---
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  // ------------------------------------
                  required/>
              </div>
            )}

            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
              <Mail className="text-gray-400 mr-2" size={18} />
              <input
                type="email"
                placeholder="learner@gmail.com"
                className="w-full bg-transparent focus:outline-none"
                // --- CONNECTING INPUT TO VARIABLE ---
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // ------------------------------------
                required/>
            </div>

            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
              <Lock className="text-gray-400 mr-2" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full bg-transparent focus:outline-none"
                // --- CONNECTING INPUT TO VARIABLE ---
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // ------------------------------------
                required/>
              <button
                type="button"
                onClick={togglePassword}
                className="text-gray-500 hover:text-green-600">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="bg-green-500 text-white py-2 rounded-full hover:bg-green-600 transition-colors font-medium">
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>
          
          {/* ... Rest of the UI (Google Button, Toggle Text) remains the same ... */}
          
          <div className="flex items-center my-3">
             <hr className="flex-grow border-gray-300" />
             <span className="px-3 text-sm text-gray-500">or</span>
             <hr className="flex-grow border-gray-300" />
          </div>

           <button
             type="button"
             onClick={handleGoogleSignIn}
             className="flex items-center justify-center gap-3 bg-white border border-gray-300 py-2 rounded-full shadow-sm hover:bg-gray-100 transition" >
             <img
               src="https://www.svgrepo.com/show/355037/google.svg"
               alt="Google"
               className="w-5 h-5"/>
             <span className="text-gray-700 font-medium">
               Sign in with Google
             </span>
           </button>

           <p className="mt-4 text-sm text-center text-gray-600">
             {isLogin ? (
               <>
                 Don't have an account?{" "}
                 <span
                   onClick={toggleMode}
                   className="text-green-600 hover:underline cursor-pointer">
                   Sign Up
                 </span>
               </>
             ) : (
               <>
                 Already have an account?{" "}
                 <span
                   onClick={toggleMode}
                   className="text-green-600 hover:underline cursor-pointer">
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

export default LearnerSignUp;