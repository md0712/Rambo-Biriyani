import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  FolderTree,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  X,
} from 'lucide-react';
import Logo from '../../components/shared/Logo';
import { useAuth } from '../../hooks/useAuth';
import { ADMIN_NAV_LINKS } from '../../utils/constants';

const ICON_MAP = {
  LayoutDashboard: LayoutDashboard,
  Users: Users,
  Package: Package,
  ShoppingBag: ShoppingBag,
  FolderTree: FolderTree,
  BarChart3: BarChart3,
  Bell: Bell,
  Settings: Settings,
};

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <Logo size="sm" to="/admin" />
        <button
          onClick={onClose}
          className="mobile-menu-btn"
          style={{ padding: '0.25rem', color: 'var(--text-muted)' }}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-title">
          Administration
        </div>

        {ADMIN_NAV_LINKS.map((item) => {
          const IconComponent = ICON_MAP[item.icon] || LayoutDashboard;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <div className="sidebar-nav-icon">
                <IconComponent size={19} />
              </div>
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        <div className="sidebar-section-title" style={{ marginTop: '1.25rem' }}>
          Quick Links
        </div>

        <Link to="/" className="sidebar-nav-item" target="_blank" rel="noreferrer">
          <div className="sidebar-nav-icon">
            <ExternalLink size={19} />
          </div>
          <span>Live Storefront</span>
        </Link>
      </nav>

      {/* User Footer Profile */}
      <div className="sidebar-footer">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150'}
          alt={user?.name || 'Alexander Stone'}
          className="user-avatar-mini"
        />
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">
            {user?.name ? user.name.replace(/\s*\(.*?\)/g, '') : 'Alexander Stone'}
          </div>
          <div className="sidebar-user-role">
            {user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) : 'Admin'}
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="sidebar-logout-btn"
          type="button"
          aria-label="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
