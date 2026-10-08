import { useState } from "react";
import api from "../api";
import { ACCEPTED_NOTE_FILE_TYPES, isSupportedNoteFile, MAX_NOTE_FILE_SIZE } from "../fileTypes";

function NoteCard({ note, canManage, currentUser, onDelete, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(note.title);
    const [subjectName, setSubjectName] = useState(note.subjectName || note.subjectCode || "");
    const [semester, setSemester] = useState(note.semester);
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");

    const fileType = note.fileType?.toUpperCase() || note.fileName?.split(".").pop()?.toUpperCase() || "FILE";
    const noteUploaderId = note.uploadedBy?._id || note.uploadedBy;
    const currentUserId = currentUser?._id || currentUser?.id;
    const canManageNote = canManage && (
        currentUser?.role === "admin"
        || (Boolean(currentUserId) && String(noteUploaderId) === String(currentUserId))
    );
    const downloadUrl = `${api.defaults.baseURL}/notes/${note._id}/download`;
    const fileBadgeClass = fileType === "PDF"
        ? "file-badge file-badge-pdf"
        : ["PPT", "PPTX"].includes(fileType)
            ? "file-badge file-badge-presentation"
            : "file-badge";
    const createdDate = note.createdAt
        ? new Date(note.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        })
        : "";

    async function handleDelete() {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this note?"
        );

        if (!confirmDelete) return;

        try {
            const response = await api.delete(`/notes/${note._id}`);
            onDelete(response.data.id || note._id);
        } catch (error) {
            console.error("Error deleting note:", error);
            if ([401, 403].includes(error.response?.status)) return;
            alert(error.response?.data?.message || "Failed to delete note.");
        }
    }

    async function handleSave(event) {
        event.preventDefault();
        if (file && !isSupportedNoteFile(file)) {
            setFileError("Only PDF (.pdf) and PowerPoint (.ppt, .pptx) files are permitted.");
            return;
        }
        if (file && file.size > MAX_NOTE_FILE_SIZE) {
            setFileError("Files must be 15 MB or smaller.");
            return;
        }
        try {
            const formData = new FormData();
            formData.append("title", title.trim());
            formData.append("subjectName", subjectName.trim());
            formData.append("semester", semester);
            if (file) formData.append("file", file);

            const response = await api.put(`/notes/${note._id}`, formData);

            onUpdate(response.data);
            setFile(null);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating note:", error);
            if ([401, 403].includes(error.response?.status)) return;
            alert(error.response?.data?.message || "Failed to update note.");
        }
    }

    function cancelEdit() {
        setTitle(note.title);
        setSubjectName(note.subjectName || note.subjectCode || "");
        setSemester(note.semester);
        setFile(null);
        setFileError("");
        setIsEditing(false);
    }

    return (
        <article className="note-card">
            {isEditing ? (
                <form className="stacked-form edit-form" onSubmit={handleSave}>
                    <label>Title<input type="text" required minLength={3} maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
                    <label>Subject name<input type="text" required value={subjectName} onChange={(event) => setSubjectName(event.target.value)} /></label>
                    <label>
                        Semester
                        <select required value={semester} onChange={(event) => setSemester(event.target.value)}>
                            {Array.from({ length: 8 }, (_, index) => index + 1).map((value) => (
                                <option key={value} value={value}>Semester {value}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Replace file
                        <input
                            type="file"
                            accept={ACCEPTED_NOTE_FILE_TYPES}
                            onChange={(event) => {
                                const selectedFile = event.target.files?.[0] || null;
                                setFileError(selectedFile && !isSupportedNoteFile(selectedFile)
                                    ? "Only PDF (.pdf) and PowerPoint (.ppt, .pptx) files are permitted."
                                    : selectedFile && selectedFile.size > MAX_NOTE_FILE_SIZE
                                        ? "Files must be 15 MB or smaller."
                                        : "");
                                setFile(selectedFile);
                            }}
                        />
                    </label>
                    {fileError && <p className="form-error" role="alert">{fileError}</p>}
                    <div className="card-actions">
                        <button className="button button-primary" type="submit">Save changes</button>
                        <button className="button button-muted" type="button" onClick={cancelEdit}>Cancel</button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="note-card-top">
                        <span className={fileBadgeClass}>{fileType}</span>
                        {createdDate && <time className="note-date" dateTime={note.createdAt}>{createdDate}</time>}
                    </div>
                    <h3>{note.title}</h3>
                    <p className="note-subject">{note.subjectName || note.subjectCode || "General notes"} <span>·</span> Semester {note.semester}</p>
                    <p className="note-uploader">
                        Uploaded by: {
                            note.uploadedBy?.name
                            || (String(noteUploaderId || "") === String(currentUserId || "") ? currentUser?.name : null)
                            || "Unknown uploader"
                        }
                    </p>
                    {note.fileUrl && (
                        <a className="file-link" href={downloadUrl} target="_blank" rel="noopener noreferrer">
                            <span aria-hidden="true">↗</span>
                            View File
                        </a>
                    )}
                    {note.fileUrl && (
                        <a className="file-link" href={`${downloadUrl}?download=true`}>
                            <span aria-hidden="true">↓</span>
                            Download Note
                        </a>
                    )}
                    {canManageNote && (
                        <div className="card-actions">
                            <button className="button button-muted" onClick={() => setIsEditing(true)}>Edit</button>
                            <button className="button button-danger-quiet" onClick={handleDelete}>Delete Note</button>
                        </div>
                    )}
                </>
            )}
        </article>
    );
}

export default NoteCard;