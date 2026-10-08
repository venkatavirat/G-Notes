import { useRef, useState } from "react";
import api from "../api";
import { ACCEPTED_NOTE_FILE_TYPES, isSupportedNoteFile, MAX_NOTE_FILE_SIZE } from "../fileTypes";

function UploadForm({ onUpload }) {
  const [title, setTitle] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [semester, setSemester] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef(null);
  const titleLength = title.trim().length;
  const isTitleLengthValid = titleLength >= 3 && titleLength <= 100;

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError("");
    if (!title.trim() || !subjectName.trim() || !semester || !file) {
      setFormError("Please complete all fields and select a file.");
      return;
    }

    if (!isSupportedNoteFile(file)) {
      setFormError("Only PDF (.pdf) and PowerPoint (.ppt, .pptx) files are permitted.");
      return;
    }
    if (file.size > MAX_NOTE_FILE_SIZE) {
      setFormError("Files must be 15 MB or smaller.");
      return;
    }
    if (title.trim().length < 3 || title.trim().length > 100) {
      setFormError("Note titles must be between 3 and 100 characters.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("subjectName", subjectName.trim());
    formData.append("semester", semester);
    formData.append("file", file);
    const token = localStorage.getItem("token");
    if (!token) {
      setFormError("Sign in before uploading a note.");
      return;
    }

    try {
      setIsUploading(true);

      await api.post("/notes", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFormError("");
      setTitle("");
      setSubjectName("");
      setSemester("");
      setFile(null);
      setFileError("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onUpload?.();
    } catch (error) {
      console.error("Error uploading note:", error);
      if ([401, 403].includes(error.response?.status)) return;
      setFormError(error.response?.data?.error || error.response?.data?.message || "Failed to upload note.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="panel upload-panel">
      <div className="panel-heading">
        <span className="eyebrow">CONTRIBUTE</span>
        <h2>Share a note</h2>
        <p>Help someone else get one step closer.</p>
      </div>
      <form className="stacked-form" onSubmit={handleSubmit}>

        <label>
          Note title
          <input
            type="text"
            placeholder="e.g. Introduction to algorithms"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            minLength={3}
            maxLength={100}
            required
          />
          <span className={`validation-badge ${isTitleLengthValid ? "validation-badge-valid" : "validation-badge-invalid"}`}>
            {isTitleLengthValid
              ? `${titleLength}/100 characters`
              : titleLength < 3
                ? `${titleLength}/3 minimum characters`
                : `${titleLength}/100 maximum characters`}
          </span>
        </label>

        <label>
          Subject name
          <input
            type="text"
            placeholder="e.g. Data Structures"
            value={subjectName}
            onChange={(event) => setSubjectName(event.target.value)}
            required
          />
        </label>

        <label>
          Semester
          <select value={semester} onChange={(event) => setSemester(event.target.value)} required>
            <option value="">Choose a semester</option>
            {Array.from({ length: 8 }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>Semester {value}</option>
            ))}
          </select>
        </label>

        <label>
          Choose a file
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_NOTE_FILE_TYPES}
            onChange={(event) => {
              const selectedFile = event.target.files?.[0] || null;
              const message = selectedFile && !isSupportedNoteFile(selectedFile)
                ? "Only PDF (.pdf) and PowerPoint (.ppt, .pptx) files are permitted."
                : selectedFile && selectedFile.size > MAX_NOTE_FILE_SIZE
                  ? "Files must be 15 MB or smaller."
                : "";
              setFile(selectedFile);
              setFileError(message);
              setFormError(message);
            }}
            required
          />
        </label>

        {fileError && <p className="form-error" role="alert">{fileError}</p>}
        {formError && !fileError && <p className="form-error" role="alert">{formError}</p>}

        <button className="button button-primary button-wide" type="submit" disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </section>
  );
}

export default UploadForm;