import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    setLoading(true);
    try {
      if(!auth){
        throw new Error("Authentication context is not available");
      }
      await auth.signup(name, email, password);
      toast.success("Signup successful");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-700 rounded-full opacity-30 blur-2xl"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-400 rounded-full opacity-20 blur-2xl"></div>
      <div className="bg-gray-950 rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center mb-6 tracking-widest uppercase bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800 bg-clip-text text-transparent drop-shadow-lg select-none">
          Sign up for <span className="text-gray-300 bg-none">Chat.AI</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 font-semibold mb-2" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-400 uppercase font-semibold tracking-wide px-6 py-2 rounded-lg text-white shadow-md transition-all duration-200 hover:from-purple-700 hover:to-purple-500 hover:text-black hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-gray-400">Already have an account?</span>
          <Link to="/login" className="ml-2 text-purple-400 hover:underline font-semibold">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;