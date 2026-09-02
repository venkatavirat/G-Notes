import { useEffect, useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import NoteList from "./components/NoteList";
import SubjectFilter from "./components/SubjectFilter";
import UploadForm from "./components/UploadForm";

import axios from "axios";

function App() {
    const [notes, setNotes] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("All");

    function fetchNotes() {
        axios
            .get("http://localhost:5000/api/notes")
            .then((response) => {
                setNotes(response.data);
            })
            .catch((error) => {
                console.error("Error fetching notes:", error);
            });
    }

    useEffect(() => {
        fetchNotes();
    }, []); 

    const filteredNotes =
        selectedSubject === "All"
            ? notes
            : notes.filter((note) => note.subjectCode === selectedSubject);

    return (
        <>
            <Navbar />

            <main>
                <UploadForm onUpload={fetchNotes} />

                <SubjectFilter
                    selectedSubject={selectedSubject}
                    setSelectedSubject={setSelectedSubject}
                />

                <NoteList
                    notes={filteredNotes}
                    onDelete={(id) => {
                        setNotes((currentNotes) =>
                            currentNotes.filter(
                                (note) => note._id !== id
                            )
                        );
                    }}
                    onUpdate={(updatedNote) => {
                        setNotes((currentNotes) =>
                            currentNotes.map((note) =>
                                note._id === updatedNote._id
                                    ? updatedNote
                                    : note
                            )
                        );
                    }}
                />
            </main>
        </>
    );
}

export default App;