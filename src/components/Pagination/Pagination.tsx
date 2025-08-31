import ReactPaginate, { type ReactPaginateProps } from 'react-paginate';
import css from './Pagination.module.css';

export interface PaginationProps {
  pageCount: number;           
  currentPage: number;        
  onPageChange: (page: number) => void; 
}

function Pagination({ pageCount, currentPage, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  const handlePageChange: ReactPaginateProps['onPageChange'] = (e) => {
    onPageChange(e.selected + 1); 
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
        containerClassName={css.pagination} 
        activeClassName={css.active}        
        renderOnZeroPageCount={null}
      />
    </nav>
  );
}

export default Pagination;
