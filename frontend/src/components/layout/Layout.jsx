// src/components/layout/Layout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    // Main wrapper with a flex column layout and minimum screen height
    // The background color is set to our primary dark theme color
    <div className="flex flex-col min-h-screen bg-primary-dark">
      <Header />

      {/* Main content area that grows to fill available space */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* The Outlet component renders the active nested route's element */}
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;