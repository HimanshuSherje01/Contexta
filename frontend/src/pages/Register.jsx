import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
                <span>Zero Setup Friction</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight leading-snug">
                Create your isolated document knowledge base.
              </h2>
              <p className="mt-3 text-sm text-brand-100 leading-relaxed">
                Register to index research papers, reports, technical specs, and
                operating systems textbooks. Search with semantic confidence.
              </p>
            </div>

            <div className="relative z-10 space-y-3 pt-6 border-t border-white/10 text-xs text-brand-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-brand-300 shrink-0" />
                <span>Isolated user scoping for every document</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-brand-300 shrink-0" />
                <span>Fast vector search &amp; similarity scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-brand-300 shrink-0" />
                <span>Exact page citations with expandable excerpts</span>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Create an account
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Set up access to your PDF assistant in seconds.
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
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:bg-white dark:focus:bg-dark-card focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:bg-white dark:focus:bg-dark-card focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                      placeholder="At least 6 characters"
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
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-dark-border text-center text-xs text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Log in
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
