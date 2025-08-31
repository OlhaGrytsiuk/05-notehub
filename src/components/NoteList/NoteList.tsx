import type React from 'react';
import type { Note } from '../../types/note';
import css from './NoteList.module.css';

export interface NoteListProps {
  notes: Note[];
  onDelete: (id: string) => void;
}

function NoteList({ notes, onDelete }: NoteListProps) {
  if (!notes.length) return null;

  return (
    <ul className={css.list}>
      {notes.map((note) => (
        <li key={note.id} className={css.listItem}>
          <h2 className={css.title}>{note.title}</h2>
          <p className={css.content}>{note.content}</p>

          <div className={css.footer}>
            <span className={css.tag}>{note.tag}</span>
            <button
              className={css.button}
              type="button"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                onDelete(note.id);
              }}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default NoteList;
