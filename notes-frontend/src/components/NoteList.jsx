import { useEffect, useState } from "react";
import api from "../api";
import NoteCard from "./NoteCard";

const NoteList = ({ refreshKey, search, canManage, currentUser, onDataChange }) => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    let isCurrent = true;
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await api.get("/notes", { params: { search: search.trim() } });
        if (isCurrent) {
          setNotes(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.error("Failed to fetch notes:", err);
        if (isCurrent) setError(err.response?.data?.message || "Failed to load notes.");
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }, 250);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeout);
    };
  }, [refreshKey, search]);

  const handleDelete = (id) => {
    setNotes((currentNotes) => currentNotes.filter((note) => note._id !== id));
    onDataChange?.();
  };

  const handleUpdate = (updatedNote) => {
    setNotes((currentNotes) => currentNotes.map((note) => (
      note._id === updatedNote._id ? updatedNote : note
    )));
    onDataChange?.();
  };

  const currentUserId = currentUser?._id || currentUser?.id;
  const visibleNotes = activeFilter === "mine"
    ? notes.filter((note) => String(note.uploadedBy?._id || note.uploadedBy || "") === String(currentUserId || ""))
    : notes;

  return (
    <div className="notes-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE LIBRARY</span>
          <h2>Study notes</h2>
        </div>
        <span className="note-count">{visibleNotes.length} {visibleNotes.length === 1 ? "note" : "notes"}</span>
      </div>
      <div className="note-filters" role="tablist" aria-label="Filter notes">
        <button
          className={`note-filter${activeFilter === "all" ? " note-filter-active" : ""}`}
          type="button"
          role="tab"
          aria-selected={activeFilter === "all"}
          onClick={() => setActiveFilter("all")}
        >
          All Notes
        </button>
        <button
          className={`note-filter${activeFilter === "mine" ? " note-filter-active" : ""}`}
          type="button"
          role="tab"
          aria-selected={activeFilter === "mine"}
          onClick={() => setActiveFilter("mine")}
        >
          My Uploads
        </button>
      </div>
      {isLoading ? (
        <p className="feedback-message" role="status">Finding notes...</p>
      ) : error ? (
        <p className="feedback-message form-error" role="alert">{error}</p>
      ) : visibleNotes.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">⌕</span>
          <h3>
            {activeFilter === "mine"
              ? "You haven't uploaded any notes yet."
              : search.trim()
                ? "No matching notes"
                : "No notes yet"}
          </h3>
          {activeFilter !== "mine" && (
            <p>{search.trim() ? "Try a different title, subject, or filename." : "Be the first to add a helpful study note."}</p>
          )}
        </div>
      ) : (
        <div className="note-grid">
        {visibleNotes.map((note) => (
          <NoteCard
            key={note._id || note.id}
            note={note}
            canManage={canManage}
            currentUser={currentUser}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))
        }
        </div>
      )}
    </div>
  );
};

export default NoteList;