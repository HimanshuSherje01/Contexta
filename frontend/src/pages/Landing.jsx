import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  Cpu,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Database,
  Menu,
  X,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Landing() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-dark-text selection:bg-brand-500/20 selection:text-brand-500 transition-colors duration-200">
      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-dark-border/80 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-teal-400 text-white shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                PDF RAG Assistant
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800/40">
                  AI
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a
              href="#features"
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#security"
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Security
            </a>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              >
                <span>Open Chat</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-card transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 py-4 space-y-3 animate-fade-in">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 py-1"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 py-1"
            >
              How It Works
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 py-1"
            >
              Security
            </a>
            <div className="pt-3 border-t border-slate-200 dark:border-dark-border flex flex-col gap-2">
              {user ? (
                <Link
                  to="/chat"
                  className="w-full text-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Open Chat
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full text-center rounded-lg border border-slate-300 dark:border-dark-border px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-100"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 dark:bg-brand-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-50/70 dark:bg-brand-950/40 px-3.5 py-1 text-xs font-medium text-brand-700 dark:text-brand-300 mb-6 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            <span>Grounded Document Intelligence with Qwen2.5 3B</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
            Chat with your documents.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-teal-500 to-emerald-400">
              Understand anything.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Upload your PDFs and ask questions using an AI assistant grounded in
            your documents. Accurate answers, exact page citations, and zero
            hallucinations.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? "/chat" : "/register"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-6 py-3.5 text-base font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-card transition-all"
            >
              <span>See How It Works</span>
            </a>
          </div>

          {/* ================= RAG PIPELINE DIAGRAM (DECORATIVE) ================= */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white/70 dark:bg-dark-surface/70 p-6 md:p-8 backdrop-blur-xl shadow-xl shadow-slate-900/5 dark:shadow-black/40">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6 text-center">
                Real-Time Document Ingestion &amp; Retrieval Architecture
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Step 1: PDF */}
                <div className="relative rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/80 dark:bg-dark-card/80 p-5 text-left flex flex-col justify-between">
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mb-3">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                      Stage 01
                    </span>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white mt-1">
                      PDF Document
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Upload raw PDF files up to 15MB.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-dark-border/60 text-[11px] font-mono text-slate-400">
                    Input: .pdf file
                  </div>
                </div>

                {/* Step 2: Processing */}
                <div className="relative rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/80 dark:bg-dark-card/80 p-5 text-left flex flex-col justify-between">
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mb-3">
                      <Layers className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                      Stage 02
                    </span>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white mt-1">
                      Page Chunking
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Extracts text preserving page boundaries.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-dark-border/60 text-[11px] font-mono text-slate-400">
                    384-dim Embeddings
                  </div>
                </div>

                {/* Step 3: Semantic Search */}
                <div className="relative rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/80 dark:bg-dark-card/80 p-5 text-left flex flex-col justify-between">
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 mb-3">
                      <Database className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                      Stage 03
                    </span>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white mt-1">
                      Atlas Vector Search
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Scoped by userId &amp; documentId with cosine similarity.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-dark-border/60 text-[11px] font-mono text-slate-400">
                    MongoDB $vectorSearch
                  </div>
                </div>

                {/* Step 4: AI Answer */}
                <div className="relative rounded-xl border border-brand-500/40 bg-brand-50/30 dark:bg-brand-950/20 p-5 text-left flex flex-col justify-between">
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 mb-3">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                      Stage 04
                    </span>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white mt-1">
                      Grounded Answer
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Qwen2.5 3B synthesizes answer with exact page citations.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-brand-200/60 dark:border-brand-900/40 text-[11px] font-mono text-brand-600 dark:text-brand-400">
                    Ollama Local Inference
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section id="features" className="py-20 border-t border-slate-200 dark:border-dark-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Core Capabilities
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Built for precision, speed, and privacy.
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              Every feature is backed by a verified, local RAG pipeline designed to
              give you complete confidence in the answers you receive.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 hover:border-brand-500/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4">
                <FileCheck className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                PDF Upload &amp; Parsing
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Accepts documents up to 15MB with automatic multi-page extraction
                and validation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 hover:border-brand-500/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                Page-Aware Chunking
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Chunks retain precise page metadata so every reference leads
                directly to the source page.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 hover:border-brand-500/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                Semantic Vector Search
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                384-dimensional dense embeddings stored in MongoDB Atlas index
                relevant context rapidly.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 hover:border-brand-500/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                Document-Aware AI
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Powered by Qwen2.5 3B via Ollama. Prompts are strictly restricted
                to your retrieved document passages.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 hover:border-brand-500/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                Grounded Answers
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                If the document does not contain the answer, the assistant clearly
                states it rather than inventing facts.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 hover:border-brand-500/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4">
                <ExternalLink className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                Interactive Source Citations
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Inspect matching percentages, exact page numbers, and expandable
                excerpts for complete transparency.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 hover:border-brand-500/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                Multi-Document Management
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Upload multiple documents, track processing in real time, and
                switch between documents seamlessly.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 hover:border-brand-500/50 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                Scoped Authentication
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                JWT protected access guarantees that queries and documents are
                isolated strictly to your user account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="py-20 bg-slate-100/60 dark:bg-dark-surface/50 border-t border-slate-200 dark:border-dark-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Workflow
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              How It Works
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              From PDF drop to grounded synthesis in four seamless steps.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative flex flex-col items-start p-6 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm">
              <span className="text-3xl font-black text-brand-600 dark:text-brand-400 mb-4">
                01
              </span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Upload
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Select or drag any PDF document from your filesystem. Supports up
                to 15MB.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-start p-6 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm">
              <span className="text-3xl font-black text-brand-600 dark:text-brand-400 mb-4">
                02
              </span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Process
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                The document is extracted, split into page-aware chunks, and
                converted to 384-dimensional vector embeddings.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-start p-6 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm">
              <span className="text-3xl font-black text-brand-600 dark:text-brand-400 mb-4">
                03
              </span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Ask
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Type questions in natural language. Atlas Vector Search retrieves
                the most semantically relevant passages.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col items-start p-6 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm">
              <span className="text-3xl font-black text-brand-600 dark:text-brand-400 mb-4">
                04
              </span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Get Grounded Answers
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Qwen2.5 3B generates a structured markdown response with verified
                page numbers and excerpts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRIVACY / SECURITY ================= */}
      <section id="security" className="py-20 border-t border-slate-200 dark:border-dark-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-gradient-to-b from-white to-slate-50 dark:from-dark-surface dark:to-dark-card p-8 md:p-12 shadow-sm">
            <div className="max-w-3xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Privacy &amp; Data Isolation
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Your documents stay under your control.
              </h2>
              <div className="mt-4 space-y-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                <p>
                  Documents are associated with your account and retrieval is
                  strictly scoped to the authenticated user.
                </p>
                <p>
                  Every vector search query applies a mandatory compound filter
                  verifying both your <code className="text-brand-600 dark:text-brand-400 font-mono text-xs">userId</code> and
                  the target <code className="text-brand-600 dark:text-brand-400 font-mono text-xs">documentId</code>.
                  Cross-tenant or cross-document data leakage is prevented at the
                  database query layer.
                </p>
                <p>
                  Inference is conducted locally via Ollama with the Qwen2.5 3B
                  model. Your raw document contents are never transmitted to
                  third-party external APIs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-20 border-t border-slate-200 dark:border-dark-border bg-brand-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Turn your PDFs into an AI knowledge base.
          </h2>
          <p className="mt-4 text-lg text-brand-100 max-w-2xl mx-auto">
            Experience fast, document-grounded question answering today.
          </p>
          <div className="mt-8">
            <Link
              to={user ? "/chat" : "/register"}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-brand-700 shadow-lg hover:bg-brand-50 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <span>Start Chatting</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface py-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              PDF RAG Assistant
            </span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Ollama Qwen2.5 3B
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              MongoDB Atlas Vector Search
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
