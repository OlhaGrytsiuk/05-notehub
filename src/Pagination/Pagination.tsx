import ReactPaginate, { type ReactPaginateProps } from 'react-paginate';
import css from './Pagination.module.css';

export interface PaginationProps {
  /** Загальна кількість сторінок (>= 1) */
  pageCount: number;
  /** Поточна сторінка у 0-based індексації (для контролю ззовні) */
  forcePage?: number;
  /**
   * Колбек при зміні сторінки.
   * На вхід отримає 0-based індекс обраної сторінки.
   */
  onPageChange: (selected: number) => void;
}

export default function Pagination({
  pageCount,
  forcePage = 0,
  onPageChange,
}: PaginationProps) {
  if (pageCount <= 1) return null;

  const handleChange: ReactPaginateProps['onPageChange'] = (e) => {
    onPageChange(e.selected);
  };

  return (
    <nav className={css.wrapper} aria-label="Pagination Navigation">
      <ReactPaginate
        pageCount={pageCount}
        forcePage={forcePage}
        onPageChange={handleChange}
        previousLabel="<"
        nextLabel=">"
        breakLabel="…"
        // Класи зі стилів репозиторію
        containerClassName={css.container}
        pageClassName={css.page}
        activeClassName={css.active}
        previousClassName={css.prev}
        nextClassName={css.next}
        breakClassName={css.break}
        disabledClassName={css.disabled}
        // A11y
        ariaLabelBuilder={(page) => `Go to page ${page}`}
        previousAriaLabel="Go to previous page"
        nextAriaLabel="Go to next page"
      />
    </nav>
  );
}
