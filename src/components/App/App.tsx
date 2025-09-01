import { useEffect, useMemo, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { fetchNotes } from '../../services/noteService';
import type { FetchNotesResponse } from '../../services/noteService';
import type { Note } from '../../types/note';

import NoteList from '../NoteList/NoteList';
import Pagination from '../Pagination/Pagination';
import SearchBox from '../SearchBox/SearchBox';
import Modal from '../Modal/Modal';
import NoteForm from '../NoteForm/NoteForm';

import css from './App.module.css';

const PER_PAGE = 12;

function App() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const queryKey = useMemo(
    () => ['notes', { page, perPage: PER_PAGE, search: debouncedSearch }] as const,
    [page, debouncedSearch]
  );

  const { data, isPending, isError, error } = useQuery<FetchNotesResponse, Error>({
    queryKey,
    queryFn: () => fetchNotes({ page, perPage: PER_PAGE, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

 
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const notes: Note[] = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={setSearch} />

        {totalPages > 1 && (
          <Pagination
            pageCount={totalPages}
            currentPage={page}
            onPageChange={(selected) => setPage(selected)}
          />
        )}

        <button className={css.button} type="button" onClick={() => setIsModalOpen(true)}>
          Create note +
        </button>
      </header>

      {isPending && <p>Loading...</p>}
      {isError && <p style={{ color: 'tomato' }}>{(error as Error)?.message ?? 'Error'}</p>}

      {!isPending && notes.length === 0 && <p>No notes found.</p>}
      {notes.length > 0 && <NoteList notes={notes} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <NoteForm onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}

export default App;
