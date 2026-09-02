import { useEffect, useState } from "react";
import axios from "axios";
import NoteCard from "./NoteCard";
import SubjectFilter from "./SubjectFilter";

const NoteList = () => {
  const [notes, setNotes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("All");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/notes");
        setNotes(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
        setNotes([]);
      }
    };

    fetchNotes();
  }, []);

  const filteredNotes = selectedSubject === "All"
    ? notes
    : notes.filter((note) => note.subject === selectedSubject);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Notes</h2>
      <SubjectFilter
        selectedSubject={selectedSubject}
        onSelectSubject={setSelectedSubject}
      />
      
      {!filteredNotes || filteredNotes.length === 0 ? (
        <p style={{ marginLeft: "20px" }}>No notes found for the selected subject.</p>
      ) : (
        filteredNotes.map((note) => <NoteCard key={note._id || note.id} note={note} />)
      )}
    </div>
  );
};

export default NoteList;