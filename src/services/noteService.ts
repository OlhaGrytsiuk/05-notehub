// src/services/noteService.ts
import axios, { AxiosError, type AxiosResponse } from 'axios';
import type { Note, NoteTag } from '../types/note';

// --------- База API ---------
const baseURL = 'https://notehub-public.goit.study/api';

// Один інстанс axios для всіх запитів
const api = axios.create({ baseURL });

// Підставляємо токен у кожен запит
api.interceptors.request.use((config) => {
  const token = import.meta.env.VITE_NOTEHUB_TOKEN as string | undefined;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// (опційно) лог помилок у DEV
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (import.meta.env.DEV) {
    
      console.error('[HTTP ERROR]', {
        url: err.config?.baseURL + (err.config?.url ?? ''),
        params: err.config?.params,
        status: err.response?.status,
        data: err.response?.data,
      });
    }
    return Promise.reject(err);
  }
);

// --------- Типи відповідей/параметрів ---------

export interface FetchNotesParams {
  page?: number;    // 1-based
  perPage?: number;
  search?: string;
}

export interface FetchNotesResponse {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  results: Note[];
}

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}

export interface DeleteNoteResponse {
  deleted: boolean;
  note: Note;
}

// Сирий тип елемента від API (може містити _id або id)
type ApiNote = Partial<
  Record<'id' | '_id' | 'title' | 'content' | 'tag' | 'createdAt' | 'updatedAt', unknown>
>;

// Деякі ендпоїнти можуть вертати { items: ApiNote[] } замість { results: ApiNote[] }
type RawFetchNotesResponse =
  | (Omit<FetchNotesResponse, 'results'> & { results: ApiNote[] })
  | (Omit<FetchNotesResponse, 'results'> & { items: ApiNote[] });

function hasItemsField(
  data: RawFetchNotesResponse
): data is Omit<FetchNotesResponse, 'results'> & { items: ApiNote[] } {
  return Object.prototype.hasOwnProperty.call(data, 'items');
}

// --------- Нормалізація даних ---------

function normalizeNotes(list: ApiNote[]): Note[] {
  return list.map((n) => {
    const id =
      (typeof n.id === 'string' && n.id) ||
      (typeof n._id === 'string' && n._id) ||
      '';
    const title = typeof n.title === 'string' ? n.title : '';
    const content = typeof n.content === 'string' ? n.content : '';
    const tag = (typeof n.tag === 'string' ? n.tag : 'Todo') as Note['tag'];
    const createdAt = typeof n.createdAt === 'string' ? n.createdAt : '';
    const updatedAt = typeof n.updatedAt === 'string' ? n.updatedAt : '';
    return { id, title, content, tag, createdAt, updatedAt };
  });
}

// --------- Функції ---------

/**
 * Отримати список нотаток (пагінація + пошук).
 */
export async function fetchNotes(
  { page = 1, perPage = 12, search }: FetchNotesParams
): Promise<FetchNotesResponse> {
  const safePage = Number.isFinite(page) && page >= 1 ? page : 1;
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? perPage : 12;

  const params: Record<string, number | string> = {
    page: safePage,
    perPage: safePerPage,
  };

  const trimmed = typeof search === 'string' ? search.trim() : '';
  if (trimmed.length > 0) {
    params.search = trimmed;
  }

  try {
    const { data }: AxiosResponse<RawFetchNotesResponse> = await api.get('/notes', { params });

    if (hasItemsField(data)) {
      const { items, ...rest } = data;
      return { ...(rest as Omit<FetchNotesResponse, 'results'>), results: normalizeNotes(items) };
    }

    const { results, ...rest } = data as Omit<FetchNotesResponse, 'results'> & { results: ApiNote[] };
    return { ...(rest as Omit<FetchNotesResponse, 'results'>), results: normalizeNotes(results) };
  } catch (err) {
    const e = err as AxiosError<{ message?: string }>;
    throw new Error(e.response?.data?.message || e.message || 'Failed to fetch notes');
  }
}

/**
 * Створити нову нотатку.
 */
export async function createNote(payload: CreateNoteParams): Promise<Note> {
  try {
    const { data }: AxiosResponse<ApiNote> = await api.post('/notes', payload);
    const [normalized] = normalizeNotes([data]);
    return normalized;
  } catch (err) {
    const e = err as AxiosError<{ message?: string }>;
    throw new Error(e.response?.data?.message || e.message || 'Failed to create note');
  }
}

/**
 * Видалити нотатку за id.
 */
export async function deleteNote(id: string): Promise<DeleteNoteResponse> {
  try {
    const { data }: AxiosResponse<{ deleted: boolean; note: ApiNote }> = await api.delete(
      `/notes/${id}`
    );
    const [normalized] = normalizeNotes([data.note]);
    return { deleted: data.deleted, note: normalized };
  } catch (err) {
    const e = err as AxiosError<{ message?: string }>;
    throw new Error(e.response?.data?.message || e.message || 'Failed to delete note');
  }
}
