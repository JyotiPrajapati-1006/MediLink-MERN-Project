// src/components/common/Input.jsx

import React from 'react';

const Input = ({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  icon,
  error,
  className = '',
}) => {
  // Base classes for the input field
  const baseInputClasses =
    'w-full py-2.5 bg-secondary-dark border border-gray-600 rounded-md text-text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300';

  // Add padding if an icon is present
  const iconPaddingClass = icon ? 'pl-10' : 'px-3';

  // Change border color if there's an error
  const errorBorderClass = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600';

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text-primary mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`${baseInputClasses} ${iconPaddingClass} ${errorBorderClass}`}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;