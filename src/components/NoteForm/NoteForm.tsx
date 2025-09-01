import { Formik, Form, ErrorMessage as FormikErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNote } from '../../services/noteService';
import type { NoteTag } from '../../types/note';
import type { CreateNotePayload } from '../../services/noteService';
import css from './NoteForm.module.css';

const TAGS: NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];

export interface NoteFormProps {
  onCancel: () => void; 
}

const Schema = Yup.object({
  title: Yup.string().min(3, 'Min 3 characters').max(50, 'Max 50 characters').required('Title is required'),
  content: Yup.string().max(500, 'Max 500 characters'),
  tag: Yup.mixed<NoteTag>().oneOf(TAGS, 'Invalid tag').required('Tag is required'),
});

function NoteForm({ onCancel }: NoteFormProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateNotePayload) => createNote(payload),
    onSuccess: () => {
     
      void queryClient.invalidateQueries({ queryKey: ['notes'] });
      onCancel();
    },
  });

  return (
    <Formik<CreateNotePayload>
      initialValues={{ title: '', content: '', tag: 'Todo' }}
      validationSchema={Schema}
      onSubmit={async (values, helpers) => {
        await mutation.mutateAsync(values);
        helpers.resetForm();
      }}
    >
      {({ values, handleChange, handleBlur, isValid }) => (
        <Form className={css.form}>
          <div className={css.formGroup}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              name="title"
              className={css.input}
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormikErrorMessage name="title" component="span" className={css.error} />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              rows={8}
              className={css.textarea}
              value={values.content}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormikErrorMessage name="content" component="span" className={css.error} />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="tag">Tag</label>
            <select
              id="tag"
              name="tag"
              className={css.select}
              value={values.tag}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              {TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
            <FormikErrorMessage name="tag" component="span" className={css.error} />
          </div>

          <div className={css.actions}>
            <button type="button" className={css.cancelButton} onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className={css.submitButton}
              disabled={!isValid || mutation.isPending}
            >
              {mutation.isPending ? 'Creating…' : 'Create note'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default NoteForm;

