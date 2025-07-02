import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  siblingCount = 1 
}) => {
  // Early return if there's only 1 page
  if (totalPages <= 1) return null;

  // Helper function to create a range array
  const range = (start, end) => {
    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
  };

  // Generate array of page numbers to show
  const generatePagination = () => {
    // Minimum 5 pages (first, last, current, and two siblings)
    const totalPageNumbers = siblingCount * 2 + 3;
    
    // Case 1: If number of pages is less than the page numbers we want to show
    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages);
    }
    
    // Calculate left and right sibling index
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    
    // Determine whether to show dots
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;
    
    // Case 2: No left dots to show, but right dots to show
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      
      return [...leftRange, '...', totalPages];
    }
    
    // Case 3: No right dots to show, but left dots to show
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      
      return [1, '...', ...rightRange];
    }
    
    // Case 4: Both left and right dots to show
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      
      return [1, '...', ...middleRange, '...', totalPages];
    }
  };
  
  const pages = generatePagination();

  return (
    <nav className="flex justify-center items-center" aria-label="Pagination">
      <div className="inline-flex items-center bg-white shadow-sm rounded-lg border border-gray-200">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`flex items-center justify-center h-10 px-4 rounded-l-lg transition-colors ${
            currentPage === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset'
          }`}
          aria-label="Previous page"
        >
          <FiChevronLeft className="h-5 w-5" />
          <span className="sr-only md:not-sr-only md:ml-2 text-sm font-medium">Previous</span>
        </button>
        
        {/* Page numbers - only show on medium screens and up */}
        <div className="hidden md:flex border-l border-r border-gray-200">
          {pages.map((page, index) => {
            if (page === '...') {
              return (
                <span 
                  key={`ellipsis-${index}`}
                  className="flex items-center justify-center w-10 h-10 text-gray-400"
                >
                  &#8230;
                </span>
              );
            }
            
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`flex items-center justify-center w-10 h-10 text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>
        
        {/* Current page indicator for small screens */}
        <div className="flex md:hidden items-center justify-center px-4 h-10 text-sm font-medium text-gray-700">
          Page {currentPage} of {totalPages}
        </div>
        
        {/* Next button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center h-10 px-4 rounded-r-lg transition-colors ${
            currentPage === totalPages
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset'
          }`}
          aria-label="Next page"
        >
          <span className="sr-only md:not-sr-only md:mr-2 text-sm font-medium">Next</span>
          <FiChevronRight className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination; 