import { type PropsWithChildren, useEffect } from 'react';
import { createPortal } from 'react-dom';
import css from './Modal.module.css';

export interface ModalProps extends PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
}

function Modal({ isOpen, onClose, children }: ModalProps) {

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = (
    <div className={css.backdrop} role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className={css.modal}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  const root = document.getElementById('modal-root');
  return root ? createPortal(content, root) : createPortal(content, document.body);
}

export default Modal;
