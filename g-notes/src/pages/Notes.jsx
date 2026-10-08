import React from 'react';
import NoteCard from '../components/NoteCard/NoteCard';
import './Notes.css';

const Notes = ({ notes }) => {
    return (
        <div className="notes-container">
            <h1 className="notes-title">Your Notes</h1>
            <div className="notes-grid">
                {notes.map(note => (
                    <NoteCard key={note.id} note={note} />
                ))}
            </div>
        </div>
    );
};

export default Notes;