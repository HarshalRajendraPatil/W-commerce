import React from 'react';

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
    <nav className="flex justify-center mt-8" aria-label="Pagination">
      <ul className="inline-flex items-center -space-x-px rounded-md shadow-sm">
        {/* Previous button */}
        <li>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-l-md ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-300'
            }`}
            aria-label="Previous"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </li>
        
        {/* Page numbers */}
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <li key={`ellipsis-${index}`}>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
                  &#8230;
                </span>
              </li>
            );
          }
          
          return (
            <li key={page}>
              <button
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                  currentPage === page
                    ? 'z-10 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border-gray-300'
                }`}
              >
                {page}
              </button>
            </li>
          );
        })}
        
        {/* Next button */}
        <li>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-r-md ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-300'
            }`}
            aria-label="Next"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination; 