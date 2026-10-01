import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import Navbar from "../components/Navbar.jsx";
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
  getDocumentById,
} from "../api/documents.js";
import { sendChatMessage } from "../api/chat.js";

export default function Chat() {
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
      text: "Welcome to PDF RAG Assistant! Please upload or select a PDF document from the sidebar to begin asking questions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");

  // Expandable sources tracker: map of messageIndex -> Set of expanded source indices
  const [expandedSources, setExpandedSources] = useState({});

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
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

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
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

  // Handle document deletion
  async function handleDeleteDocument(docId, docName) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${docName}" and all of its indexed chunks?`
    );
    if (!confirmDelete) return;

    try {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));

      if (selectedDocId === docId) {
        const remaining = documents.filter((d) => d._id !== docId);
        const nextDoc = remaining.find((d) => d.status === "ready") || remaining[0] || null;
        setSelectedDocId(nextDoc ? nextDoc._id : null);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `🗑️ Document **${docName}** and its embeddings have been deleted.`,
        },
      ]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete document");
    }
  }

  // Handle sending a chat message
  async function handleSend(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || sending) return;

    if (!activeDoc) {
      setChatError("Please select an uploaded document first.");
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

  // Chat placeholder logic
  let inputPlaceholder = "Ask something about the document...";
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

  return (
    <div className="flex h-screen flex-col bg-paper">
      <Navbar />

      {/* Main Container: Sidebar + Chat Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* ================= Document Sidebar ================= */}
        <aside className="w-80 border-r border-line bg-white flex flex-col justify-between">
          <div className="p-4 flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-base font-semibold text-ink">
                Documents
              </h2>
              <span className="text-xs text-slate">
                {documents.length} {documents.length === 1 ? "file" : "files"}
              </span>
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
                className="w-full flex items-center justify-center gap-2 rounded-md bg-accent py-2 text-sm font-medium text-white hover:bg-accentDark disabled:opacity-60 transition-colors"
              >
                {uploading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg leading-none">+</span>
                    <span>Upload PDF</span>
                  </>
                )}
              </button>
              {uploadError && (
                <p className="mt-2 text-xs text-red-600">{uploadError}</p>
              )}
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingDocs ? (
                <p className="text-xs text-slate text-center py-4">
                  Loading documents...
                </p>
              ) : documents.length === 0 ? (
                <div className="rounded-md border border-dashed border-line p-6 text-center text-xs text-slate">
                  <p>No documents uploaded yet.</p>
                  <p className="mt-1">Upload a PDF to start asking questions.</p>
                </div>
              ) : (
                documents.map((doc) => {
                  const isSelected = doc._id === selectedDocId;

                  return (
                    <div
                      key={doc._id}
                      onClick={() => setSelectedDocId(doc._id)}
                      className={`group relative rounded-lg border p-3 cursor-pointer transition-all ${
                        isSelected
                          ? "border-accent bg-accent/5 shadow-sm"
                          : "border-line bg-white hover:bg-paper/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p
                            className={`truncate text-sm font-medium ${
                              isSelected ? "text-accentDark font-semibold" : "text-ink"
                            }`}
                            title={doc.originalName}
                          >
                            {doc.originalName}
                          </p>

                          <div className="mt-1 flex items-center gap-2 text-xs text-slate">
                            <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                            {doc.pageCount > 0 && (
                              <>
                                <span>•</span>
                                <span>{doc.pageCount} pages</span>
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

                        {/* Status Badge */}
                        <div className="flex flex-col items-end gap-1">
                          {doc.status === "ready" && (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
                              Ready
                            </span>
                          )}
                          {doc.status === "processing" && (
                            <span className="flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                              <span className="inline-block h-2 w-2 animate-spin rounded-full border border-amber-800 border-t-transparent" />
                              Indexing
                            </span>
                          )}
                          {doc.status === "failed" && (
                            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
                              Failed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDocument(doc._id, doc.originalName);
                        }}
                        className="mt-2 text-[11px] text-slate/70 hover:text-red-600 transition-colors"
                        title="Delete document"
                      >
                        Delete
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active selection summary footer */}
          <div className="border-t border-line p-3 bg-paper/40 text-xs text-slate">
            {activeDoc ? (
              <p className="truncate">
                Active: <span className="font-semibold text-ink">{activeDoc.originalName}</span>
              </p>
            ) : (
              <p>Select a document above</p>
            )}
          </div>
        </aside>

        {/* ================= Chat Area ================= */}
        <main className="flex-1 flex flex-col bg-paper overflow-hidden">
          {/* Active Document Top Banner */}
          <div className="border-b border-line bg-white/70 backdrop-blur-sm px-6 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate">Target Document:</span>
              {activeDoc ? (
                <span className="font-medium text-ink flex items-center gap-1.5">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      activeDoc.status === "ready"
                        ? "bg-emerald-500"
                        : activeDoc.status === "processing"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-red-500"
                    }`}
                  />
                  {activeDoc.originalName}
                  {activeDoc.status === "processing" && " (processing chunks...)"}
                </span>
              ) : (
                <span className="text-slate/70 italic">None selected</span>
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
                className="text-slate hover:text-ink text-[11px] underline"
              >
                Clear Chat
              </button>
            )}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-accent text-white"
                      : "border border-line bg-white text-ink"
                  }`}
                >
                  {/* Message Content: Markdown support */}
                  <div className="prose prose-sm max-w-none text-inherit">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>

                  {/* Structured Sources Section */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-3 border-t border-line/60 pt-2 text-xs">
                      <p className="font-semibold text-slate mb-1">
                        Sources ({m.sources.length}):
                      </p>
                      <div className="space-y-1.5">
                        {m.sources.map((src, srcIdx) => {
                          const isExpanded =
                            expandedSources[i] && expandedSources[i].has(srcIdx);

                          return (
                            <div
                              key={srcIdx}
                              className="rounded border border-line/60 bg-paper/60 p-2 text-slate"
                            >
                              <div className="flex items-center justify-between font-medium text-ink">
                                <span>Page {src.page}</span>
                                {src.score !== null && (
                                  <span className="text-[11px] text-accentDark font-normal">
                                    {(src.score * 100).toFixed(1)}% match
                                  </span>
                                )}
                              </div>

                              {src.text && (
                                <div className="mt-1">
                                  <button
                                    onClick={() => toggleSnippet(i, srcIdx)}
                                    className="text-[11px] text-accent hover:underline focus:outline-none"
                                  >
                                    {isExpanded ? "▲ Hide excerpt" : "▼ View excerpt"}
                                  </button>

                                  {isExpanded && (
                                    <p className="mt-1 rounded bg-white p-2 text-[11px] font-mono leading-normal text-slate border border-line whitespace-pre-wrap">
                                      {src.text}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking / Generating Bubble */}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-lg border border-line bg-white px-4 py-3 text-xs text-slate shadow-sm flex items-center gap-2">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  <span>Searching document and generating grounded answer...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="border-t border-line bg-white p-4">
            {chatError && (
              <p className="mb-2 text-xs text-red-600 px-1">{chatError}</p>
            )}

            <form onSubmit={handleSend} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={inputPlaceholder}
                disabled={isInputDisabled}
                className="flex-1 rounded-md border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:bg-paper disabled:text-slate/60"
              />
              <button
                type="submit"
                disabled={isInputDisabled || !input.trim()}
                className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accentDark disabled:opacity-50 transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
