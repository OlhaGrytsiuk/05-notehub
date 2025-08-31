import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { createNote, deleteNote, fetchNotes } from '../services/noteService';
import type { CreateNotePayload, FetchNotesResponse } from '../services/noteService';
import type { Note } from '../types/note';
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
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => ['notes', { page, perPage: PER_PAGE, search: debouncedSearch }] as const,
    [page, debouncedSearch]
  );

  // ✔ v5: використовуємо placeholderData: keepPreviousData
  const { data, isPending, isError, error } = useQuery<FetchNotesResponse, Error>({
    queryKey,
    queryFn: () => fetchNotes({ page, perPage: PER_PAGE, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateNotePayload) => createNote(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notes'] });
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
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

      {notes.length > 0 && (
        <NoteList notes={notes} onDelete={(id) => deleteMutation.mutate(id)} />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <NoteForm
          onCancel={() => setIsModalOpen(false)}
          onSubmit={async (values: CreateNotePayload) => {
            await createMutation.mutateAsync(values);
          }}
          isSubmitting={createMutation.isPending}
        />
      </Modal>
    </div>
  );
}

export default App;
