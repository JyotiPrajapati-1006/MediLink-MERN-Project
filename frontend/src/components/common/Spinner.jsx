// src/components/common/Spinner.jsx

import React from 'react';

const Spinner = ({ size = 'md', className = '' }) => {
  // Map size prop to corresponding Tailwind CSS classes
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-16 w-16 border-4',
  };

  const baseClasses =
    'rounded-full animate-spin';

  // A modern spinner with a solid track and a colored spinning part
  const colorClasses =
    'border-gray-700 border-t-primary';

  return (
    <div
      className={`${baseClasses} ${sizes[size]} ${colorClasses} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;