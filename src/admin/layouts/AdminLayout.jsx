import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import '../styles/admin.css';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem('rambo_admin_theme') || 'white'
  );

  useEffect(() => {
    localStorage.setItem('rambo_admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'white' ? 'dark' : 'white'));
  };

  return (
    <div className={`admin-layout ${theme === 'white' ? 'admin-white-theme' : 'admin-dark-theme'}`}>
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="admin-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} theme={theme} />

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <main className="admin-page-content">
          <Outlet context={{ theme, toggleTheme }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
