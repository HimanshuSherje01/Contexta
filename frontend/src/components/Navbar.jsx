import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-line px-6 py-4">
      <div>
        <h1 className="font-serif text-lg text-ink">PDF RAG Assistant</h1>
        <p className="text-xs text-slate">Ask questions, get answers from your document</p>
      </div>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate">{user.name}</span>
          <button
            onClick={handleLogout}
            className="rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:bg-line/40"
          >
            Log out
          </button>
        </div>
      )}
    </header>
  );
}
