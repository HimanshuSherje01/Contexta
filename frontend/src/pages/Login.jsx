import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-dark-text flex flex-col justify-between selection:bg-brand-500/20 selection:text-brand-500 transition-colors duration-200">
      {/* Top bar with logo and ThemeToggle */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-dark-border/80 bg-white/70 dark:bg-dark-surface/70 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-teal-400 text-white shadow-sm shadow-brand-500/20">
            <FileText className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm text-slate-900 dark:text-white">
            PDF RAG Assistant
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-xl shadow-slate-900/5 dark:shadow-black/30 overflow-hidden animate-slide-up">
          {/* Left Hero Column (Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 bg-gradient-to-br from-brand-900 via-brand-800 to-teal-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-200 backdrop-blur-sm mb-6">
                <Sparkles className="h-3.5 w-3.5 text-brand-300" />
                <span>Verified RAG Pipeline</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight leading-snug">
                Welcome back to your document intelligence workspace.
              </h2>
              <p className="mt-3 text-sm text-brand-100 leading-relaxed">
                Log in to resume chatting with your indexed PDFs, inspect exact source
                citations, and query complex topics in seconds.
              </p>
            </div>

            <div className="relative z-10 space-y-3 pt-6 border-t border-white/10 text-xs text-brand-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-brand-300 shrink-0" />
                <span>Page-aware chunking &amp; source attribution</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-brand-300 shrink-0" />
                <span>Private local inference via Ollama Qwen2.5</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-brand-300 shrink-0" />
                <span>MongoDB Atlas Vector Search</span>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Welcome back
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Enter your credentials to access your account.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 animate-fade-in"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:bg-white dark:focus:bg-dark-card focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:bg-white dark:focus:bg-dark-card focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 disabled:opacity-60 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span>Log in</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-dark-border text-center text-xs text-slate-500 dark:text-slate-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 dark:text-slate-500">
        &copy; {new Date().getFullYear()} PDF RAG Assistant. Scoped &amp; Secure.
      </footer>
    </div>
  );
}
