import React from 'react';
import './NoteCard.css';

const NoteCard = ({ title, content, subjects }) => {
    return (
        <div className="note-card">
            <h3 className="note-title">{title}</h3>
            <p className="note-content">{content}</p>
            <div className="subject-badges">
                {subjects.map((subject, index) => (
                    <span key={index} className="subject-badge">{subject}</span>
                ))}
            </div>
        </div>
    );
};

export default NoteCard;