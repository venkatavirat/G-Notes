import { useEffect, useState } from "react";
import Auth from "./components/Auth";
import UploadForm from "./components/UploadForm";
import NoteList from "./components/NoteList";
import AnalyticsBanner from "./components/AnalyticsBanner";
import "./App.css";

function normalizeUser(user) {
  if (!user || typeof user !== "object") return null;
  const id = user._id || user.id;
  if (!id) return null;
  return { ...user, id: String(id), _id: String(id) };
}

function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    try {
      const user = normalizeUser(JSON.parse(localStorage.getItem("user") || "null"));
      return token && user ? { token, user } : { token: null, user: null };
    } catch {
      return { token: null, user: null };
    }
  });
  const [search, setSearch] = useState("");
  const [notesRefreshKey, setNotesRefreshKey] = useState(0);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const handleAuthExpired = () => {
      setAuth({ token: null, user: null });
      setNotification("Your session has expired. Please sign in again.");
    };
    window.addEventListener("auth:expired", handleAuthExpired);
    return () => window.removeEventListener("auth:expired", handleAuthExpired);
  }, []);

  useEffect(() => {
    if (!notification) return undefined;
    const timeout = window.setTimeout(() => setNotification(""), 5000);
    return () => window.clearTimeout(timeout);
  }, [notification]);

  const handleLogin = ({ token, user }) => {
    const normalizedUser = normalizeUser(user);
    if (!token || !normalizedUser) {
      setNotification("Sign-in succeeded without valid user details. Please try again.");
      return;
    }
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setAuth({ token, user: normalizedUser });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null });
  };

  return (
    <div className="app-shell">
      {notification && (
        <div className="session-notice" role="status" aria-live="polite">
          {notification}
          <button type="button" onClick={() => setNotification("")} aria-label="Dismiss notification">×</button>
        </div>
      )}
      <header className="site-header">
        <a className="brand" href="/" aria-label="G-NOTES home">
          <span className="brand-mark">G</span>
          <span>G-NOTES</span>
        </a>
        <label className="search-box">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search notes, subjects, or files..."
            aria-label="Search notes"
          />
          {search && (
            <button className="clear-search" type="button" onClick={() => setSearch("")} aria-label="Clear search">
              ×
            </button>
          )}
        </label>
        <div className="header-account">
          {auth.user ? (
            <>
              <span className="welcome-text">Hi, {auth.user.name}</span>
              <button className="button button-outline header-button" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <span className="guest-label">Guest access</span>
          )}
        </div>
      </header>

      <main className="page-content">
        <section className="hero">
          <span className="eyebrow">LEARN TOGETHER</span>
          <h1>Find your next <span>aha moment.</span></h1>
          <p>Search and share study notes, all in one place.</p>
        </section>

        <AnalyticsBanner refreshKey={notesRefreshKey} />

        <div className="workspace-grid">
          <section className="notes-section">
            <NoteList
              refreshKey={notesRefreshKey}
              search={search}
              canManage={Boolean(auth.token)}
              currentUser={auth.user}
              onDataChange={() => setNotesRefreshKey((key) => key + 1)}
            />
          </section>
          <aside className="sidebar">
            {auth.token ? (
              <UploadForm onUpload={() => setNotesRefreshKey((key) => key + 1)} />
            ) : (
              <Auth onLoginSuccess={handleLogin} />
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;