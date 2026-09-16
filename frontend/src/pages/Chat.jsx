import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import api from "../api/axios.js";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! Ask me anything about the loaded document.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || sending) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setSending(true);

    try {
      // This calls the stub /api/chat route.
      // Once you build the RAG pipeline, this same call will return real answers.
      const { data } = await api.post("/chat", { question });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer,
          sources: data.sources,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Something went wrong reaching the server. Check that the backend is running.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
        <div className="flex-1 space-y-4 overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-accent text-white"
                    : "border border-line bg-white text-ink"
                }`}
              >
                <p>{m.text}</p>
                {m.sources?.length > 0 && (
                  <p className="mt-1 text-xs opacity-70">
                    Sources: {m.sources.join(", ")}
                  </p>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something about the document..."
            className="flex-1 rounded-md border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={sending}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accentDark disabled:opacity-60"
          >
            {sending ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
