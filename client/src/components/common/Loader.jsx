import React from 'react';

const Loader = ({ size = 'medium', text = 'Loading...', fullScreen = false, overlay = false }) => {
  // Size classes
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-10 w-10 border-3',
    large: 'h-16 w-16 border-4'
  };

  // Spinner element
  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`${sizeClasses[size]} rounded-full border-t-indigo-600 border-r-indigo-600 border-b-indigo-200 border-l-indigo-200 animate-spin`}
      ></div>
      {text && <p className="mt-3 text-gray-600 font-medium">{text}</p>}
    </div>
  );
  
  // For fullscreen loading
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
        {spinner}
      </div>
    );
  }
  
  // For overlay loading (container relative, overlay absolute)
  if (overlay) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
        {spinner}
      </div>
    );
  }
  
  // Regular inline loading
  return (
    <div className="flex justify-center py-6">
      {spinner}
    </div>
  );
};

export default Loader; 