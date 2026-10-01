import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={`relative inline-flex items-center justify-center p-2 rounded-lg border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
        theme === "dark"
          ? "border-dark-border bg-dark-surface text-slate-300 hover:text-white hover:bg-dark-cardHover"
          : "border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100"
      } ${className}`}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
