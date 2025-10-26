import React, { useState } from "react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-80 sm:w-96 transition-all duration-300">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        <form className="flex flex-col gap-4">
          {!isLogin && (
            <input type="text" placeholder="Full Name"  className="border rounded px-3 py-2 focus:outline-none"/>)}
          <input type="email" placeholder="Email" className="border rounded px-3 py-2 focus:outline-none"/>
          <input type="password" placeholder="Password" className="border rounded px-3 py-2 focus:outline-none"/>
          <button type="submit" className="bg-blue-500 text-white py-2 rounded-full hover:bg-blue-700 transition-colors">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          {isLogin ? ( <> Don’t have an account?{" "}
              <span className="text-blue-600 hover:underline cursor-pointer" onClick={toggleMode}> Sign Up </span> </>
          ) : ( <> Already have an account?{" "}
              <span className="text-blue-600 hover:underline cursor-pointer" onClick={toggleMode} > Login </span> </> )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
