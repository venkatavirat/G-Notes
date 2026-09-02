import axios from "axios";
import { useState } from "react";

function NoteCard({ note, onDelete, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(note.title);
    const [subjectCode, setSubjectCode] = useState(note.subjectCode);
    const [semester, setSemester] = useState(note.semester);

    async function handleDelete() {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this note?"
        );

        if (!confirmDelete) return;

        try {
            await axios.delete(
                `http://localhost:5000/api/notes/${note._id}`
            );
            onDelete(note._id);
        } catch (error) {
            console.error("Error deleting note:", error);
            alert("Failed to delete note.");
        }
    }

    async function handleSave() {
        try {
            const response = await axios.put(
                `http://localhost:5000/api/notes/${note._id}`,
                { title, subjectCode, semester }
            );

            onUpdate(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating note:", error);
            alert("Failed to update note.");
        }
    }

    return (
        <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
            {isEditing ? (
                <div>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <input
                        value={subjectCode}
                        onChange={(e) => setSubjectCode(e.target.value)}
                    />
                    <input
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                    />
                    <button onClick={handleSave}>Save</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            ) : (
                <div>
                    <h3>{note.title}</h3>
                    <p>Subject: {note.subjectCode}</p>
                    <p>Semester: {note.semester}</p>
                    {note.fileUrl && (
                        <p>
                            📄 Attachment:{" "}
                            <a href={note.fileUrl} target="_blank" rel="noopener noreferrer">
                                {note.fileName || "View / Download File"}
                            </a>
                        </p>
                    )}

                    <button onClick={() => setIsEditing(true)}>Edit</button>
                    <button onClick={handleDelete}>Delete</button>
                </div>
            )}
        </div>
    );
}

export default NoteCard;