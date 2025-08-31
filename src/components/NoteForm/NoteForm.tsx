import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import type { NoteTag } from '../../types/note';
import type { CreateNotePayload } from '../../services/noteService';
import css from './NoteForm.module.css';

const TAGS: NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];

export interface NoteFormProps {
  onSubmit: (values: CreateNotePayload) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const Schema = Yup.object({
  title: Yup.string().min(3, 'Min 3 characters').max(50, 'Max 50 characters').required('Title is required'),
  content: Yup.string().max(500, 'Max 500 characters'),
  tag: Yup.mixed<NoteTag>().oneOf(TAGS, 'Invalid tag').required('Tag is required'),
});

function NoteForm({ onSubmit, onCancel, isSubmitting }: NoteFormProps) {
  return (
    <Formik<CreateNotePayload>
      initialValues={{ title: '', content: '', tag: 'Todo' }}
      validationSchema={Schema}
      onSubmit={async (values, helpers) => {
        await onSubmit(values);
        helpers.resetForm();
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, isValid }) => (
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
            <span data-name="title" className={css.error} aria-live="polite">
              {touched.title && errors.title}
            </span>
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
            <span data-name="content" className={css.error} aria-live="polite">
              {touched.content && errors.content}
            </span>
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
            <span data-name="tag" className={css.error} aria-live="polite">
              {touched.tag && errors.tag}
            </span>
          </div>

          <div className={css.actions}>
            <button type="button" className={css.cancelButton} onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className={css.submitButton} disabled={!isValid || !!isSubmitting}>
              Create note
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default NoteForm;
