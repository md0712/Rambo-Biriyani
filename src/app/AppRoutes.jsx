import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Website Components
import WebsiteLayout from '../website/layouts/WebsiteLayout';
import Home from '../website/pages/Home';
import About from '../website/pages/About';
import Services from '../website/pages/Services';
import Products from '../website/pages/Products';
import ProductDetail from '../website/pages/ProductDetail';
import Contact from '../website/pages/Contact';
import Login from '../website/pages/Login';
import Register from '../website/pages/Register';
import UserDashboard from '../website/pages/UserDashboard';
import NotFound from '../website/pages/NotFound';

// Admin Components
import AdminLayout from '../admin/layouts/AdminLayout';
import Dashboard from '../admin/pages/Dashboard';
import UserList from '../admin/pages/Users/UserList';
import UserCreate from '../admin/pages/Users/UserCreate';
import UserEdit from '../admin/pages/Users/UserEdit';
import UserDetails from '../admin/pages/Users/UserDetails';
import ProductList from '../admin/pages/Products/ProductList';
import ProductCreate from '../admin/pages/Products/ProductCreate';
import ProductEdit from '../admin/pages/Products/ProductEdit';
import OrderList from '../admin/pages/Orders/OrderList';
import OrderDetails from '../admin/pages/Orders/OrderDetails';
import CategoryList from '../admin/pages/Categories/CategoryList';
import Reports from '../admin/pages/Reports/Reports';
import Notifications from '../admin/pages/Notifications/Notifications';
import Settings from '../admin/pages/Settings/Settings';

// Security Guard
import ProtectedRoute from '../auth/ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Storefront Routes */}
      <Route element={<WebsiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Protected Back-Office Administration Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        
        {/* Users */}
        <Route path="users" element={<UserList />} />
        <Route path="users/new" element={<UserCreate />} />
        <Route path="users/:id" element={<UserDetails />} />
        <Route path="users/:id/edit" element={<UserEdit />} />

        {/* Products */}
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductCreate />} />
        <Route path="products/:id/edit" element={<ProductEdit />} />

        {/* Orders */}
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:id" element={<OrderDetails />} />

        {/* Categories */}
        <Route path="categories" element={<CategoryList />} />

        {/* Reports */}
        <Route path="reports" element={<Reports />} />

        {/* Notifications */}
        <Route path="notifications" element={<Notifications />} />

        {/* Settings */}
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 404 Fallback */}
      <Route element={<WebsiteLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
