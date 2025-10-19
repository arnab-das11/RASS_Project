import React from "react";

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-80 sm:w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

        <form className="flex flex-col gap-4">
          <input
            type="email" placeholder="Email"
            className="border rounded px-3 py-2 focus:outline-none" />
          <input
            type="password" placeholder="Password"
            className="border rounded px-3 py-2 focus:outline-none" />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded-full hover:bg-blue-700" >
            Login
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Don't have an account?{" "}
          <span className="text-blue-600 hover:underline cursor-pointer"> Sign Up </span> </p>
      </div>
    </div>
  );
};

export default LoginPage;
