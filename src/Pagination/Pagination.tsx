import ReactPaginate, { type ReactPaginateProps } from 'react-paginate';
import css from './Pagination.module.css';

export interface PaginationProps {
  pageCount: number;           // загальна кількість сторінок
  currentPage: number;         // поточна сторінка (1-based)
  onPageChange: (page: number) => void; // повертаємо 1-based
}

function Pagination({ pageCount, currentPage, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  const handlePageChange: ReactPaginateProps['onPageChange'] = (e) => {
    onPageChange(e.selected + 1); // react-paginate -> 0-based
  };

  return (
    <nav aria-label="Notes pagination">
      <ReactPaginate
        pageCount={pageCount}
        forcePage={Math.max(0, currentPage - 1)}
        onPageChange={handlePageChange}
        previousLabel="‹"
        nextLabel="›"
        breakLabel="…"
        marginPagesDisplayed={1}
        pageRangeDisplayed={2}
        // ⚠️ головне — ці два класи збігаються з твоїм CSS-модулем
        containerClassName={css.pagination} // застосує .pagination до <ul>
        activeClassName={css.active}        // застосує .active до <li>
        renderOnZeroPageCount={null}
      />
    </nav>
  );
}

export default Pagination;
