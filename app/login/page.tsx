"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: "2s"}}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl shadow-cyan-500/20 p-6 sm:p-8 border border-slate-600 backdrop-blur-sm">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              AM Clean
            </h1>
            <p className="text-gray-400 font-semibold text-sm sm:text-base">Admin Login</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 backdrop-blur-sm text-sm sm:text-base">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="animate-fadeIn">
              <label htmlFor="username" className="block text-sm font-semibold text-gray-300 mb-2 sm:mb-3">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition text-sm sm:text-base"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="animate-fadeIn" style={{animationDelay: "0.1s"}}>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2 sm:mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition pr-10 sm:pr-12 text-sm sm:text-base"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition font-semibold text-xs sm:text-sm"
                >
                  {showPassword ? "👁️ Hide" : "👁️ Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 sm:py-3 px-4 rounded-lg transition transform hover:scale-105 animate-fadeIn text-sm sm:text-base"
              style={{animationDelay: "0.2s"}}
            >
              {loading ? "⏳ Logging in..." : "🔓 Login"}
            </button>
          </form>

          <p className="text-center text-xs sm:text-sm text-gray-500 mt-6">
            Admin access only
          </p>
        </div>
      </div>
    </div>
  );
}
