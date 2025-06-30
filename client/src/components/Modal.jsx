import { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const modalRef = useRef(null);
  
  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  // Define modal sizes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-full mx-4'
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl overflow-hidden w-full ${sizeClasses[size] || sizeClasses.md}`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 