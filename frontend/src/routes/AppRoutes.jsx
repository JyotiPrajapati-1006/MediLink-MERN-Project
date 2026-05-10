// src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';

// --- Layout Imports ---
import Layout from '../components/layout/Layout';
import AdminLayout from '../pages/Admin/AdminLayout';
import ShopOwnerLayout from '../pages/ShopOwner/ShopOwnerLayout';

// --- Page Imports ---
// Public & Customer
import HomePage from '../pages/Customer/HomePage';
import VisitorPage from '../pages/Customer/VisitorPage';
import ProductDetailsPage from '../pages/Customer/ProductDetailsPage';
import CartPage from '../pages/Customer/CartPage';
import ProfilePage from '../pages/Customer/ProfilePage';

// Auth
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';

// Admin
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminLogin from '../pages/Admin/AdminLogin';
import AdminReportsPage from '../pages/Admin/AdminReportsPage';

// Shop Owner
import ManageOrdersPage from '../pages/ShopOwner/ManageOrdersPage';
import ShoapLogin from '../pages/ShopOwner/ShoapLogin';

// Delivery
import DeliveryDashboard from '../pages/Delivery/DeliveryDashboard';
import DeliveryLogin from '../pages/Delivery/DeliveryLogin';

// Other
import PrivateRoute from './PrivateRoute';
import ShopsListPage from '../pages/Customer/ShopsListPage';
import OrderHistoryPage from '../pages/Customer/OrderHistoryPage';
import ManageUsersPage from '../pages/Admin/ManageUsersPage';
import ManageShopsPage from '../pages/Admin/ManageShopsPage';
import ManageCategoriesPage from '../pages/Admin/ManageCategoriesPage';
import ShopDashboard from '../pages/ShopOwner/ShopDashboard';
import CreateShopPage from '../pages/ShopOwner/CreateShopPage';
import ManageProductsPage from '../pages/ShopOwner/ManageProductsPage';
import ManagePrescriptionsPage from '../pages/ShopOwner/ManagePrescriptionsPage';
import ShopProfilePage from '../pages/ShopOwner/ShopProfilePage';
import ShopCoupons from '../pages/ShopOwner/ShopCoupons';
import ShopReportsPage from '../pages/ShopOwner/ShopReportsPage';
import AboutUsPage from '../pages/Customer/AboutUsPage';
import ShopDetailsPage from '../pages/Customer/ShopDetailsPage';
import MyPrescriptionsPage from '../pages/Customer/MyPrescriptionsPage';
import WishlistPage from '../pages/Customer/WishlistPage';
import SupportPage from '../pages/Customer/SupportPage';
import CheckoutPage from '../pages/Customer/CheckoutPage';
import OrderDetailsPage from '../pages/Customer/OrderDetailsPage';
import ContactUsPage from '../pages/Customer/ContactUsPage';
import VerifyOtpPage from '../pages/Auth/VerifyOtpPage';
import ManageComplaintsPage from '../pages/Admin/ManageComplaintsPage';
import BecomePartnerPage from '../pages/Customer/BecomePartnerPage';
import ManageRequestsPage from '../pages/Admin/ManageRequestsPage';
import ForgotPasswordPage from '../pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/Auth/ResetPasswordPage';
import AdminPayoutsPage from '../pages/Admin/AdminPayoutsPage';



const AppRoutes = () => {

  const user = JSON.parse(localStorage.getItem('userInfo'));

  console.log(user);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/shop/login" element={<ShoapLogin />} />
      <Route path="/delivery/login" element={<DeliveryLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      {/* --- Main Layout for Public and Customer Routes --- */}
      <Route element={<Layout />}>
        {/* Public Visitor Page or Home Page if logged in */}
        <Route path="/" element={user ? <HomePage /> : <VisitorPage />} />

        {/* Protected Customer Routes */}
        {user &&
          <>
            {/* HomePage is now handled by the conditional route above */}
            <Route path="/shops" element={<ShopsListPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path='/orders' element={<PrivateRoute><OrderHistoryPage /></PrivateRoute>} />
            <Route path="/product/:slug" element={<ProductDetailsPage />} />
            <Route path="/shops/:id" element={<ShopDetailsPage />} />
            <Route path="/prescriptions" element={<PrivateRoute><MyPrescriptionsPage /></PrivateRoute>} />
            <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
            <Route path="/support" element={<SupportPage />} />
            <Route path='/checkout' element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
            <Route path='/orders/:id' element={<PrivateRoute><OrderDetailsPage /></PrivateRoute>} />
            <Route path="/contact" element={<ContactUsPage />} />

            <Route path="/become-a-partner" element={<PrivateRoute allowedRoles={['customer']}><BecomePartnerPage /></PrivateRoute>} />

            {/* Customer Protected */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          </>
        }
        {/* Delivery Staff Dashboard uses the main layout */}

        <Route
          path="/delivery/dashboard"
          element={<PrivateRoute allowedRoles={['delivery-staff']}><DeliveryDashboard /></PrivateRoute>}
        />
      </Route>

      {/* --- Admin Dashboard Layout --- */}

      <Route
        path="/admin"
        element={<PrivateRoute allowedRoles={['admin']}><AdminLayout /></PrivateRoute>}
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsersPage />} />
        <Route path="shops" element={<ManageShopsPage />} />
        <Route path='categories' element={<ManageCategoriesPage />} />
        <Route path='complaints' element={<ManageComplaintsPage />} />
        <Route path="requests" element={<ManageRequestsPage />} />
        <Route path="payouts" element={<AdminPayoutsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      {/* --- Shop Owner Dashboard Layout --- */}

      <Route
        path="/shop-owner"
        element={<PrivateRoute allowedRoles={['shop-owner']}><ShopOwnerLayout /></PrivateRoute>}
      >
        <Route path="dashboard" element={<ShopDashboard />} />
        <Route path="create-shop" element={<CreateShopPage />} />
        <Route path="orders" element={<ManageOrdersPage />} />
        <Route path="products" element={<ManageProductsPage />} />
        <Route path="prescriptions" element={<ManagePrescriptionsPage />} />
        <Route path="profile" element={<ShopProfilePage />} />
        <Route path="coupons" element={<ShopCoupons />} />
        <Route path="reports" element={<ShopReportsPage />} />
        {/* Add other shop owner routes here, e.g., /shop-owner/products */}
      </Route>


    </Routes>
  );
};

export default AppRoutes;