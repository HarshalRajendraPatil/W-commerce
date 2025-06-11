import React, { useRef, useEffect, useState } from 'react';
import { ArcElement } from 'chart.js';
import { Chart as ChartJS } from 'chart.js/auto';

// Register ArcElement to ensure pie/doughnut charts work
ChartJS.register(ArcElement);

// Error boundary for Chart components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Chart error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100 rounded-md p-4">
          <p className="text-gray-500">Chart could not be displayed</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const ChartWrapper = ({ children, id = "chart" }) => {
  const chartContainerRef = useRef(null);
  const [key, setKey] = useState(Date.now());
  
  // Reset chart when it mounts to prevent canvas reuse issues
  useEffect(() => {
    const currentRef = chartContainerRef.current;
    
    return () => {
      // Clean up on unmount
      if (currentRef) {
        const canvas = currentRef.querySelector('canvas');
        if (canvas) {
          // Force canvas cleanup
          const context = canvas.getContext('2d');
          if (context) {
            context.restore();
          }
        }
      }
    };
  }, []);
  
  // Handle potential errors
  try {
    return (
      <ErrorBoundary>
        <div 
          ref={chartContainerRef} 
          className="w-full h-full" 
          key={`chart-container-${key}`}
        >
          {children}
        </div>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("Error rendering chart:", error);
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-md p-4">
        <p className="text-gray-500">Chart could not be displayed</p>
      </div>
    );
  }
};

export default ChartWrapper; 