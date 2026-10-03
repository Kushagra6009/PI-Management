import React from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { getToken, removeToken, getPIName } from "./api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BatchStudents from "./pages/BatchStudents";
import StudentProfile from "./pages/StudentProfile";
import MentorHistory from "./pages/MentorHistory";
import { GraduationCap, LogOut, UserCheck } from "lucide-react";

function ProtectedRoute({ children }) {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();
  const piName = getPIName();

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  const isLoginPage = location.pathname === "/login";

  return (
    <div className="min-h-screen flex flex-col bg-dark-900 text-slate-100 font-['Inter',sans-serif]">
      {/* Top Navbar for Authenticated Users */}
      {token && !isLoginPage && (
        <header className="sticky top-0 z-40 bg-dark-800/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <GraduationCap size={22} />
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight leading-tight">
                PI Administration System
              </div>
              <div className="text-xs text-slate-400">Academic Portal</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <UserCheck size={14} />
              <span>{piName}</span>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-900 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 text-xs font-medium transition-all"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>
      )}

      {/* Main Content Body */}
      <main className={token && !isLoginPage ? "flex-1 max-w-7xl w-full mx-auto p-6 md:p-8" : "flex-1"}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/batches/:id/students"
            element={
              <ProtectedRoute>
                <BatchStudents />
              </ProtectedRoute>
            }
          />

          <Route
            path="/students/:id"
            element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/batches/:id/mentor-history"
            element={
              <ProtectedRoute>
                <MentorHistory />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
