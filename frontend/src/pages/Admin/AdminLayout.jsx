// src/pages/Admin/AdminLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="flex bg-gray-100 dark:bg-primary-dark min-h-screen print:bg-white print:block">
      <AdminSidebar />
      <main className="flex-1 p-6 print:p-0 print:m-0">
        {/* Nested admin pages will be rendered here */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;