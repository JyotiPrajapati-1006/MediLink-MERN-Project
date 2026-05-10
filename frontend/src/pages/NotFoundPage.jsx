// src/pages/NotFoundPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)]">
      {/* 404 Error Code */}
      <h1 className="text-8xl md:text-9xl font-extrabold text-blue-600">404</h1>

      {/* Page Title */}
      <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-800">Page Not Found</h2>

      {/* Helper Text */}
      <p className="mt-2 text-base text-gray-500">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
    </div>
  );
};

export default NotFoundPage;