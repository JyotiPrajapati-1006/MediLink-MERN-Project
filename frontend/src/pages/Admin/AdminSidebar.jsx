// src/pages/Admin/AdminSidebar.jsx

import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaTachometerAlt,
  FaUsers,
  FaStore,
  FaBoxOpen,
  FaTags,
  FaRegCommentDots,
  FaSignOutAlt,
  FaBell,
  FaMoneyCheckAlt,
  FaChartBar
} from 'react-icons/fa';

// --- Reusable NavLink Component for consistency within the sidebar ---
const SidebarLink = ({ to, icon, children }) => {
  const linkClasses = "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-text-secondary hover:bg-gray-700 hover:text-white transition-colors duration-200";
  const activeLinkClasses = "bg-primary text-white shadow-lg";

  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
    >
      {icon}
      <span className="ml-3">{children}</span>
    </NavLink>
  );
};


const AdminSidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="print:hidden w-64 min-h-screen bg-secondary-dark flex flex-col border-r border-gray-700/50">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-700/50">
        <Link to="/" className="text-2xl font-bold text-primary">
          MediLink
        </Link>
        <p className="text-xs text-text-secondary mt-1">Admin Panel</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-4">
        <div>
          <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</h3>
          <SidebarLink to="/admin/dashboard" icon={<FaTachometerAlt />}>Dashboard</SidebarLink>
          <SidebarLink to="/admin/reports" icon={<FaChartBar />}>Reports & Analytics</SidebarLink>
        </div>
        <div>
          <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Management</h3>
          <SidebarLink to="/admin/users" icon={<FaUsers />}>Users</SidebarLink>
          <SidebarLink to="/admin/shops" icon={<FaStore />}>Shops</SidebarLink> {/* Corrected: Removed extra text */}
          <SidebarLink to="/admin/categories" icon={<FaTags />}>Categories</SidebarLink> {/* Corrected: Removed extra text */}
          <SidebarLink to="/admin/payouts" icon={<FaMoneyCheckAlt />}>Payouts</SidebarLink>
        </div>
        <div>
          <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Support</h3>
          <SidebarLink to="/admin/complaints" icon={<FaRegCommentDots />}>Review & Complaints </SidebarLink>
          <SidebarLink to="/admin/requests" icon={<FaBell />}>Role Requests</SidebarLink>
        </div>
      </nav>

      {/* Sidebar Footer (User Profile & Logout) */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="flex items-center">
          <div>
            <p className="font-semibold text-text-primary text-sm">{user?.name}</p>
            <p className="text-xs text-text-secondary">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center mt-4 px-4 py-2 text-sm font-medium rounded-lg text-text-secondary hover:bg-red-500/20 hover:text-red-300 transition-colors duration-200"
        >
          <FaSignOutAlt className="mr-2" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;