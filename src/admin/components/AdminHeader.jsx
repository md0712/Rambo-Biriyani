import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Plus, Moon, Sun, Shield, LogOut } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';

export const AdminHeader = ({ onToggleSidebar, theme = 'white', onToggleTheme }) => {
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [liveNotifs, setLiveNotifs] = useState([]);

  useEffect(() => {
    const notifsRef = collection(db, 'notifications');
    const unsub = onSnapshot(
      notifsRef,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        items.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });
        setLiveNotifs(items);
      },
      (err) => console.warn('[AdminHeader] Notifs listener warning:', err)
    );
    return () => unsub();
  }, []);

  const unreadCount = liveNotifs.filter((n) => !n.read).length;

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          onClick={onToggleSidebar}
          className="admin-mobile-toggle-btn"
          aria-label="Toggle Navigation"
          type="button"
        >
          <Menu size={22} />
        </button>

        <div className="admin-header-search">
          <div className="header-search-wrap">
            <Search size={16} className="header-search-icon" />
            <input
              type="text"
              placeholder="Search orders, customers, or SKUs..."
              className="header-search-input"
            />
          </div>
        </div>
      </div>

      <div className="admin-header-actions">
        {/* Quick Add Product */}
        <Link to="/admin/products/new" className="header-btn-new-product">
          <Plus size={16} />
          <span>New Product</span>
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'white' ? 'Dark Mode' : 'White Theme'}`}
          className="header-theme-toggle-btn"
          type="button"
        >
          {theme === 'white' ? (
            <>
              <Moon size={15} />
              <span>Dark Mode</span>
            </>
          ) : (
            <>
              <Sun size={15} />
              <span>White Theme</span>
            </>
          )}
        </button>

        {/* Notification Bell with Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="header-icon-btn"
            title="Notifications"
            type="button"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="badge-counter" />}
          </button>

          {notifOpen && (
            <div className="header-notif-dropdown">
              <div className="header-notif-dropdown-header">
                <strong>Recent Notifications</strong>
                <span className="badge-count-pill">{unreadCount} New</span>
              </div>
              <div className="header-notif-list">
                {liveNotifs.length === 0 ? (
                  <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                    No alerts at this time.
                  </div>
                ) : (
                  liveNotifs.slice(0, 5).map((n) => (
                    <div key={n.id} className="header-notif-item">
                      <div className="header-notif-title">{n.title}</div>
                      <div className="header-notif-desc">{n.desc}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="header-notif-footer">
                <Link
                  to="/admin/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="header-notif-link"
                >
                  View All Notifications &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <Link to="/admin/settings" className="header-avatar-link" title="Admin profile">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150'}
            alt={user?.name || 'Alexander Stone'}
            className="header-avatar-img"
          />
        </Link>
      </div>
    </header>
  );
};

export default AdminHeader;
