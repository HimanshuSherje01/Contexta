import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  FileText,
  UploadCloud,
  Trash2,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
} from "../api/documents.js";
import { sendChatMessage } from "../api/chat.js";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Modal from "../components/Modal.jsx";

export default function Chat() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Document Management States
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Chat States
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Welcome to **PDF RAG Assistant**! Please upload or select a PDF document from the sidebar to begin asking grounded questions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");

  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deleteModalDoc, setDeleteModalDoc] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Expandable sources tracker: map of messageIndex -> Set of expanded source indices
  const [expandedSources, setExpandedSources] = useState({});

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Load documents on mount
  const fetchDocuments = useCallback(async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs);

      // Auto-select first document if none selected
      setSelectedDocId((prev) => {
        if (prev && docs.some((d) => d._id === prev)) return prev;
        const firstReady = docs.find((d) => d.status === "ready");
        return firstReady ? firstReady._id : docs[0]?._id || null;
      });
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Check if any document is currently in "processing" state
  const hasProcessingDocs = documents.some((d) => d.status === "processing");

  // Polling for processing documents
  useEffect(() => {
    if (hasProcessingDocs) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const updatedDocs = await getDocuments();
          setDocuments(updatedDocs);
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2500);
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [hasProcessingDocs]);

  // Currently selected document object
  const activeDoc = documents.find((d) => d._id === selectedDocId);

  // Handle PDF file upload
  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setUploadError("Only PDF files (.pdf) are allowed.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError("File size exceeds 15MB limit.");
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      const newDoc = await uploadDocument(file);
      await fetchDocuments();
      setSelectedDocId(newDoc.documentId);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `📄 Uploaded **${file.name}**. Extraction and embedding generation in progress... I'll let you know once it's ready for questions!`,
        },
      ]);
    } catch (err) {
      setUploadError(err.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Open delete confirmation modal
  function triggerDeletePrompt(doc) {
    setDeleteModalDoc(doc);
  }

  // Execute confirmed document deletion
  async function confirmDeleteDocument() {
    if (!deleteModalDoc) return;
    const docId = deleteModalDoc._id;
    const docName = deleteModalDoc.originalName;

    setDeleting(true);
    try {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));

      if (selectedDocId === docId) {
        const remaining = documents.filter((d) => d._id !== docId);
        const nextDoc =
          remaining.find((d) => d.status === "ready") || remaining[0] || null;
        setSelectedDocId(nextDoc ? nextDoc._id : null);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `🗑️ Document **${docName}** and its embeddings have been deleted.`,
        },
      ]);
      setDeleteModalDoc(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete document");
    } finally {
      setDeleting(false);
    }
  }

  // Handle sending a chat message (supports form submit or quick chip click)
  async function handleSend(e, questionOverride) {
    if (e) e.preventDefault();
    const question = (questionOverride || input).trim();
    if (!question || sending) return;

    if (!activeDoc) {
      setChatError("Please select or upload a document first.");
      return;
    }

    if (activeDoc.status !== "ready") {
      setChatError("Selected document is still processing. Please wait.");
      return;
    }

    setChatError("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setSending(true);

    try {
      const data = await sendChatMessage({
        question,
        documentId: activeDoc._id,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer,
          sources: data.sources || [],
        },
      ]);
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        "Something went wrong answering your question. Please ensure the backend and Ollama are running.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `⚠️ **Error:** ${errMsg}`,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  // Handle Enter / Shift+Enter in input
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  }

  // Toggle snippet view
  function toggleSnippet(msgIdx, srcIdx) {
    setExpandedSources((prev) => {
      const currentSet = new Set(prev[msgIdx] || []);
      if (currentSet.has(srcIdx)) {
        currentSet.delete(srcIdx);
      } else {
        currentSet.add(srcIdx);
      }
      return { ...prev, [msgIdx]: currentSet };
    });
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  // Chat placeholder logic
  let inputPlaceholder = "Ask a question about this document... (Enter to send)";
  let isInputDisabled = sending;

  if (uploading) {
    inputPlaceholder = "Uploading PDF document...";
    isInputDisabled = true;
  } else if (!activeDoc) {
    inputPlaceholder = "Upload or select a PDF document from the sidebar to chat...";
    isInputDisabled = true;
  } else if (activeDoc.status === "processing") {
    inputPlaceholder = `Processing "${activeDoc.originalName}" (${activeDoc.chunkCount} chunks)... please wait`;
    isInputDisabled = true;
  } else if (activeDoc.status === "failed") {
    inputPlaceholder = `Processing failed for "${activeDoc.originalName}". Please re-upload or select another.`;
    isInputDisabled = true;
  }

  const exampleQuestions = [
    "What is a process?",
    "What is PCB?",
    "Explain process scheduling.",
    "What are the process states?",
  ];

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-dark-text overflow-hidden transition-colors duration-200">
      {/* ================= TOP NAVIGATION ================= */}
      <header className="h-14 border-b border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-card transition-colors"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-label="Toggle document sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-teal-400 text-white shadow-sm">
              <FileText className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white hidden sm:inline">
              PDF RAG Assistant
            </span>
          </div>

          {/* Active Document Indicator Pill in Header */}
          {activeDoc && (
            <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 dark:border-dark-border bg-slate-100/70 dark:bg-dark-card px-3 py-1 text-xs">
              <span
                className={`h-2 w-2 rounded-full ${
                  activeDoc.status === "ready"
                    ? "bg-emerald-500"
                    : activeDoc.status === "processing"
                    ? "bg-amber-500 animate-pulse"
                    : "bg-red-500"
                }`}
              />
              <span className="font-medium text-slate-700 dark:text-slate-200 max-w-[200px] truncate">
                {activeDoc.originalName}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                {activeDoc.status}
              </span>
            </div>
          )}
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-dark-border">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden lg:inline">
                  {user.name}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-dark-border px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Log out of your account"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ================= WORKSPACE BODY ================= */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ================= DOCUMENT SIDEBAR ================= */}
        <aside
          className={`${
            sidebarOpen ? "w-80 translate-x-0" : "-translate-x-full md:w-0"
          } fixed md:static inset-y-0 left-0 z-30 md:z-auto transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface flex flex-col justify-between shadow-xl md:shadow-none h-[calc(100vh-3.5rem)]`}
        >
          <div className="p-4 flex flex-col flex-1 overflow-hidden">
            {/* Sidebar Title */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Documents
                </h2>
                <span className="rounded-full bg-slate-100 dark:bg-dark-card px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  {documents.length}
                </span>
              </div>
            </div>

            {/* Upload Button */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 px-3 text-xs font-semibold text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 disabled:opacity-60 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              >
                {uploading ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Uploading &amp; Indexing...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    <span>Upload New PDF</span>
                  </>
                )}
              </button>
              {uploadError && (
                <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 p-2 text-[11px] text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingDocs ? (
                <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                  <span>Loading documents...</span>
                </div>
              ) : documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-dark-border p-6 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center">
                  <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    No documents yet
                  </p>
                  <p className="mt-1 text-[11px]">
                    Upload a PDF to start asking grounded questions.
                  </p>
                </div>
              ) : (
                documents.map((doc) => {
                  const isSelected = doc._id === selectedDocId;

                  return (
                    <div
                      key={doc._id}
                      onClick={() => setSelectedDocId(doc._id)}
                      className={`group relative rounded-xl border p-3 cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? "border-brand-500/80 bg-brand-50/50 dark:bg-brand-950/20 shadow-sm"
                          : "border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-slate-50 dark:hover:bg-dark-cardHover"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div
                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                              isSelected
                                ? "bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300"
                                : "bg-slate-100 dark:bg-dark-surface text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            <FileText className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`truncate text-xs font-semibold ${
                                isSelected
                                  ? "text-brand-900 dark:text-brand-200"
                                  : "text-slate-900 dark:text-white"
                              }`}
                              title={doc.originalName}
                            >
                              {doc.originalName}
                            </p>

                            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                              <span>
                                {(doc.fileSize / 1024).toFixed(0)} KB
                              </span>
                              {doc.pageCount > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{doc.pageCount} pgs</span>
                                </>
                              )}
                              {doc.chunkCount > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{doc.chunkCount} chunks</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex flex-col items-end gap-1">
                          {doc.status === "ready" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                              <CheckCircle2 className="h-3 w-3" />
                              Ready
                            </span>
                          )}
                          {doc.status === "processing" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                              <span className="inline-block h-2 w-2 animate-spin rounded-full border border-amber-800 dark:border-amber-300 border-t-transparent" />
                              Indexing
                            </span>
                          )}
                          {doc.status === "failed" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-100 dark:bg-red-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/40">
                              <AlertTriangle className="h-3 w-3" />
                              Failed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Action Row */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-dark-border/50 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {new Date(doc.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerDeletePrompt(doc);
                          }}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Delete document and its indexed data"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active selection summary footer */}
          <div className="border-t border-slate-200 dark:border-dark-border p-3.5 bg-slate-50 dark:bg-dark-card text-xs text-slate-500 dark:text-slate-400 shrink-0">
            {activeDoc ? (
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Target
                </span>
                <span className="truncate max-w-[180px] font-medium text-slate-900 dark:text-white">
                  {activeDoc.originalName}
                </span>
              </div>
            ) : (
              <p className="text-center text-[11px]">Select a document above</p>
            )}
          </div>
        </aside>

        {/* Mobile backdrop overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-black/40 md:hidden backdrop-blur-xs"
          />
        )}

        {/* ================= CHAT MAIN AREA ================= */}
        <main className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-bg overflow-hidden relative">
          {/* Active Document Top Sub-Banner */}
          <div className="border-b border-slate-200 dark:border-dark-border bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm px-6 py-2.5 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">Context:</span>
              {activeDoc ? (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {activeDoc.originalName}
                  </span>
                  {activeDoc.status === "processing" ? (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                      <span className="h-2 w-2 animate-spin rounded-full border border-amber-800 dark:border-amber-300 border-t-transparent" />
                      Indexing chunks ({activeDoc.chunkCount})
                    </span>
                  ) : activeDoc.status === "ready" ? (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] text-emerald-800 dark:text-emerald-300 font-medium">
                      Ready for questions
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-red-100 dark:bg-red-950/60 px-2 py-0.5 text-[10px] text-red-800 dark:text-red-300 font-medium">
                      Indexing Failed
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-slate-400 italic">No document selected</span>
              )}
            </div>

            {messages.length > 1 && (
              <button
                onClick={() =>
                  setMessages([
                    {
                      role: "assistant",
                      text: `Conversation cleared. Asking questions about **${
                        activeDoc?.originalName || "your document"
                      }**.`,
                    },
                  ])
                }
                className="flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs transition-colors"
                title="Reset conversation messages"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Clear Chat</span>
              </button>
            )}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                {/* Assistant Avatar */}
                {m.role === "assistant" && (
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-2xl rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-brand-600 text-white rounded-tr-xs"
                      : "border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-900 dark:text-dark-text rounded-tl-xs"
                  }`}
                >
                  {/* Markdown Content */}
                  <div className="markdown-body">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>

                  {/* ================= SOURCES CITATION UI ================= */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-dark-border/80">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                        <Layers className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                        <span>Sources ({m.sources.length})</span>
                      </div>

                      <div className="space-y-2">
                        {m.sources.map((src, srcIdx) => {
                          const isExpanded =
                            expandedSources[i] && expandedSources[i].has(srcIdx);

                          return (
                            <div
                              key={srcIdx}
                              className="rounded-xl border border-slate-200 dark:border-dark-border/80 bg-slate-50 dark:bg-dark-surface/90 p-3 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    Page {src.page}
                                  </span>
                                  {src.score !== null && (
                                    <span className="rounded-full bg-brand-100 dark:bg-brand-950/80 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/40">
                                      {(src.score * 100).toFixed(1)}% match
                                    </span>
                                  )}
                                </div>

                                {src.text && (
                                  <button
                                    onClick={() => toggleSnippet(i, srcIdx)}
                                    className="flex items-center gap-1 text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline focus:outline-none"
                                  >
                                    <span>
                                      {isExpanded ? "Hide excerpt" : "View excerpt"}
                                    </span>
                                    {isExpanded ? (
                                      <ChevronUp className="h-3 w-3" />
                                    ) : (
                                      <ChevronDown className="h-3 w-3" />
                                    )}
                                  </button>
                                )}
                              </div>

                              {isExpanded && src.text && (
                                <div className="mt-2.5 rounded-lg bg-white dark:bg-dark-card p-3 text-[11px] font-mono leading-relaxed text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-dark-border whitespace-pre-wrap">
                                  {src.text}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {m.role === "user" && (
                  <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-dark-card text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Searching Skeleton State */}
            {sending && (
              <div className="flex gap-3 justify-start animate-fade-in">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card px-5 py-4 text-xs text-slate-500 dark:text-slate-400 shadow-sm flex items-center gap-3">
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                  <span>
                    Searching document embeddings &amp; generating grounded answer...
                  </span>
                </div>
              </div>
            )}

            {/* Empty Chat State with Example Question Chips */}
            {messages.length === 1 && activeDoc?.status === "ready" && !sending && (
              <div className="my-8 max-w-lg mx-auto text-center animate-slide-up">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 mb-3 shadow-sm">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Ask anything about your document
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Select an example prompt below or type your own question:
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {exampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(null, q)}
                      className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-3 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50/40 dark:hover:bg-brand-950/20 transition-all text-left shadow-2xs"
                    >
                      &ldquo;{q}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ================= COMPOSER / INPUT BAR ================= */}
          <div className="border-t border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4 shrink-0">
            <div className="max-w-4xl mx-auto">
              {chatError && (
                <div
                  role="alert"
                  className="mb-2 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 animate-fade-in"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{chatError}</span>
                </div>
              )}

              <form onSubmit={(e) => handleSend(e)} className="relative flex items-center">
                <input
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={inputPlaceholder}
                  disabled={isInputDisabled}
                  className="w-full rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50/70 dark:bg-dark-card pl-4 pr-14 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:bg-white dark:focus:bg-dark-card focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                />

                <button
                  type="submit"
                  disabled={isInputDisabled || !input.trim()}
                  className="absolute right-2 top-2 bottom-2 rounded-xl bg-brand-600 px-3 flex items-center justify-center text-white hover:bg-brand-700 disabled:opacity-40 disabled:hover:bg-brand-600 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  aria-label="Send message"
                  title="Send message (Enter)"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-2">
                <span>
                  Grounded with Qwen2.5 3B &amp; MongoDB Atlas Vector Search
                </span>
                <span>Press Enter to send</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      <Modal
        isOpen={Boolean(deleteModalDoc)}
        onClose={() => setDeleteModalDoc(null)}
        onConfirm={confirmDeleteDocument}
        title="Delete document?"
        message={`Are you sure you want to delete "${deleteModalDoc?.originalName}"? This will permanently remove the document and its indexed vector embeddings.`}
        confirmText="Delete Document"
        cancelText="Keep"
        isDestructive={true}
        loading={deleting}
      />
    </div>
  );
}
