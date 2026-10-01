import { Link, useNavigate } from "react-router-dom";
import { FileText, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="h-14 border-b border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 sm:px-6 flex items-center justify-between shrink-0 transition-colors">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-teal-400 text-white shadow-sm">
          <FileText className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">
            PDF RAG Assistant
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {user ? (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-dark-border">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-dark-border px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
