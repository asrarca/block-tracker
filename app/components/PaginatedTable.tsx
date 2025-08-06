import React, { useState, useMemo } from 'react'

interface PaginatedTableProps<T> {
  data: T[];
  pageSize?: number;
  renderHeader: () => React.ReactNode;
  renderBody: (currentData: T[], startIndex: number, endIndex: number) => React.ReactNode;
  itemName?: string;
}

const PaginatedTable = <T,>({
  data,
  pageSize = 10,
  renderHeader,
  renderBody,
  itemName = 'items'
}: PaginatedTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination values
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);

  // Calculate which page numbers to show (5 pages centered around current page)
  const getPageNumbers = useMemo(() => {
    const pages: number[] = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Adjust if we're near the beginning or end
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + 4);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - 4);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  // Navigation functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToFirst = () => goToPage(1);
  const goToPrevious = () => goToPage(currentPage - 1);
  const goToNext = () => goToPage(currentPage + 1);
  const goToLast = () => goToPage(totalPages);

  return (
    <div className="overflow-x-auto">

      <table className="table table-zebra w-full">
        {renderHeader()}
        {renderBody(currentData, startIndex, endIndex)}
      </table>


      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-1">
          {/* First Button */}
          <button
            onClick={goToFirst}
            disabled={currentPage === 1}
            className={`btn btn-sm ${currentPage === 1 ? 'btn-disabled' : 'btn-outline'}`}
          >
            First
          </button>

          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            disabled={currentPage === 1}
            className={`btn btn-sm ${currentPage === 1 ? 'btn-disabled' : 'btn-outline'}`}
          >
            Previous
          </button>

          {/* Page Numbers */}
          {getPageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              disabled={pageNum === currentPage}
              className={`btn btn-sm ${
                pageNum === currentPage
                  ? 'btn-primary font-bold cursor-default'
                  : 'btn-outline'
              }`}
            >
              {pageNum}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className={`btn btn-sm ${currentPage === totalPages ? 'btn-disabled' : 'btn-outline'}`}
          >
            Next
          </button>

          {/* Last Button */}
          <button
            onClick={goToLast}
            disabled={currentPage === totalPages}
            className={`btn btn-sm ${currentPage === totalPages ? 'btn-disabled' : 'btn-outline'}`}
          >
            Last
          </button>
        </div>
      )}

      {/* Page Info */}
      {totalPages > 1 && (
        <div className="text-center mt-2 text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, data.length)} of {data.length} {itemName}
        </div>
      )}
    </div>
  )
}

export default PaginatedTable;
