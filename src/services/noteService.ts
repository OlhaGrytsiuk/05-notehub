
import axios, { type AxiosInstance } from 'axios';

import type { Note, NoteTag } from '../types/note';

const API_URL = 'https://notehub-public.goit.study/api';
const TOKEN = import.meta.env.VITE_NOTEHUB_TOKEN as string | undefined;

if (!TOKEN) {
  throw new Error('VITE_NOTEHUB_TOKEN is missing. Add it to your environment variables.');
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
  },
});

export interface CreateNotePayload {
  title: string;
  content: string;
  tag: NoteTag;
}

export interface FetchNotesParams {
  page?: number;     // 1-based
  perPage?: number;
  search?: string;
}

export interface FetchNotesResponse {
  items: Note[];     // <-- важливо: items, а не notes
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export const fetchNotes = async (params: FetchNotesParams): Promise<FetchNotesResponse> => {
  const { page = 1, perPage = 12, search } = params;

  // не передавати search, якщо він порожній/пробіли
  const cleanedParams: Record<string, unknown> = { page, perPage };
  if (typeof search === 'string' && search.trim()) {
    cleanedParams.search = search.trim();
  }

  // бекенд може вертати items або notes
  type RawBase = { page: number; perPage: number; totalItems: number; totalPages: number };
  type RawResponse = RawBase & ({ items: Note[] } | { notes: Note[] });

  const { data } = await api.get<RawResponse>('/notes', { params: cleanedParams });

  const items = 'items' in data ? data.items : (data as any).notes;

  return {
    items,
    page: data.page,
    perPage: data.perPage,
    totalItems: data.totalItems,
    totalPages: data.totalPages,
  };
};


export const createNote = async (payload: CreateNotePayload): Promise<Note> => {
  const { data } = await api.post<Note>('/notes', payload);
  return data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const { data } = await api.delete<Note>(`/notes/${id}`);
  return data;
};