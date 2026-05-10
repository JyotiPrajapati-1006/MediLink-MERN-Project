import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaPlus, FaSignOutAlt, FaTachometerAlt, FaClipboardList, FaPills, FaFilePrescription, FaStoreAlt, FaTags, FaChartBar } from 'react-icons/fa';
import Button from '../../components/common/Button';

const SidebarSkeleton = () => (
  <div className="p-4 space-y-4 animate-pulse">
    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
    <div className="h-8 bg-gray-700 rounded w-full mt-4"></div>
    <div className="h-8 bg-gray-700 rounded w-full"></div>
    <div className="h-8 bg-gray-700 rounded w-full"></div>
  </div>
);

const SidebarLink = ({ to, icon, children }) => {
  const linkClasses = "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-text-secondary hover:bg-gray-700 hover:text-white transition-colors duration-200";
  const activeLinkClasses = "bg-primary text-white shadow-lg";

  return (
    <NavLink to={to} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
      {icon}
      <span className="ml-3">{children}</span>
    </NavLink>
  );
};

const ShopOwnerSidebar = ({ shop, loading }) => {
  const { user, logout } = useAuth();

  return (
    <aside className="print:hidden w-64 min-h-screen bg-secondary-dark flex flex-col border-r border-gray-700/50">
      <div className="p-4 border-b border-gray-700/50">
        <Link to="/" className="text-2xl font-bold text-primary">MediLink</Link>
        <p className="text-xs text-text-secondary mt-1">Shop Owner Panel</p>
      </div>

      <div className="flex-1 flex flex-col">
        {loading ? (
          <SidebarSkeleton />
        ) : shop ? shop.status==="Rejected" ? (
          <div className="flex-1 flex flex-col justify-center items-center p-4 text-center">
            <h3 className="text-lg font-semibold text-text-primary">Welcome, {user?.name}!</h3>
            <p className="text-text-secondary text-sm mt-2">To get started, please create your shop profile.</p>
            <Link to="/shop-owner/create-shop" className="w-full mt-6">
              <Button className="w-full"><FaPlus className="mr-2" />Create Your Shop</Button>
            </Link>
            <button onClick={logout} className="w-full mt-4 text-sm text-text-secondary hover:text-primary">
              Logout
            </button>
          </div>
        ):(
       <>     
            <nav className="flex-1 px-4 py-4 space-y-4">
              <div>
                <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</h3>
                <SidebarLink to="/shop-owner/dashboard" icon={<FaTachometerAlt />}>Dashboard</SidebarLink>
                <SidebarLink to="/shop-owner/reports" icon={<FaChartBar />}>Reports</SidebarLink>
              </div>
              <div>
                <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Management</h3>
                <SidebarLink to="/shop-owner/orders" icon={<FaClipboardList />}>Manage Orders</SidebarLink>
                <SidebarLink to="/shop-owner/products" icon={<FaPills />}>Manage Products</SidebarLink>
                <SidebarLink to="/shop-owner/prescriptions" icon={<FaFilePrescription />}>Prescriptions</SidebarLink>
                <SidebarLink to="/shop-owner/coupons" icon={<FaTags />}>Coupons</SidebarLink>
              </div>
              <div>
                <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Shop</h3>
                <SidebarLink to="/shop-owner/profile" icon={<FaStoreAlt />}>Shop Profile</SidebarLink>
              </div>
            </nav>
            <div className="p-4 border-t border-gray-700/50">
              <p className="font-semibold text-text-primary text-sm">{user?.name}</p>
              <button onClick={logout} className="w-full flex items-center justify-center mt-4 px-4 py-2 text-sm font-medium rounded-lg text-text-secondary hover:bg-red-500/20 hover:text-red-300">
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          </>):( <div className="flex-1 flex flex-col justify-center items-center p-4 text-center">
            <h3 className="text-lg font-semibold text-text-primary">Welcome, {user?.name}!</h3>
            <p className="text-text-secondary text-sm mt-2">To get started, please create your shop profile.</p>
            <Link to="/shop-owner/create-shop" className="w-full mt-6">
              <Button className="w-full"><FaPlus className="mr-2" />Create Your Shop</Button>
            </Link>
            <button onClick={logout} className="w-full mt-4 text-sm text-text-secondary hover:text-primary">
              Logout
            </button>
          </div>)
          }
      </div>
    </aside>
  );
};

export default ShopOwnerSidebar;