import { useState } from "react";
import axios from "axios";

function UploadForm({ onUpload }) {
  const [title, setTitle] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [semester, setSemester] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title || !subjectCode || !semester) {
      alert("Please fill in all text fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subjectCode", subjectCode);
    formData.append("semester", semester);
    if (file) {
      formData.append("file", file);
    }

    try {
      setIsUploading(true);
      await axios.post("http://localhost:5000/api/notes", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Note uploaded successfully!");
      setTitle("");
      setSubjectCode("");
      setSemester("");
      setFile(null);
      onUpload();
    } catch (error) {
      console.error("Error uploading note:", error);
      alert("Failed to upload note.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Upload a Note</h2>

      <input
        type="text"
        placeholder="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <select
        value={subjectCode}
        onChange={(e) => setSubjectCode(e.target.value)}
      >
        <option value="">Select subject</option>
        <option value="24CSEN2041">24CSEN2041</option>
        <option value="24CSEN2131">24CSEN2131</option>
        <option value="24CSEN2051">24CSEN2051</option>
        <option value="24CSEN2011">24CSEN2011</option>
        <option value="24CSEN2061">24CSEN2061</option>
      </select>

      <input
        type="number"
        placeholder="Semester"
        value={semester}
        onChange={(e) => setSemester(e.target.value)}
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button type="submit" disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}

export default UploadForm;