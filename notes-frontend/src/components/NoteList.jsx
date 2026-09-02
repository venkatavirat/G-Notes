import NoteCard from "./NoteCard";

function NoteList({ notes, onDelete, onUpdate }) {
    if (notes.length === 0) {
        return <p>No notes found for this subject.</p>;
    }

    return (
        <div>
            {notes.map((note) => (
                <NoteCard
                    key={note._id}
                    note={note}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                />
            ))}
        </div>
    );
}

export default NoteList;