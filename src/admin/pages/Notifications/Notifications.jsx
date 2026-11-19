import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, ShoppingBag, AlertTriangle, User, Shield, BarChart3 } from 'lucide-react';
import { collection, doc, onSnapshot, updateDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import SEO from '../../../components/shared/SEO';
import Button from '../../../components/common/Button';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  useEffect(() => {
    const notifsRef = collection(db, 'notifications');
    const unsubscribe = onSnapshot(
      notifsRef,
      (snapshot) => {
        const notifs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        notifs.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });
        setNotifications(notifs);
      },
      (err) => console.warn('[Notifications] Firestore subscription error:', err)
    );

    return () => unsubscribe();
  }, []);

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications.filter((n) => !n.read).forEach((n) => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('[Notifications] Error marking all as read:', err);
    }
  };

  const markSingleAsRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error('[Notifications] Error marking single as read:', err);
    }
  };

  const clearAll = async () => {
    try {
      const batch = writeBatch(db);
      notifications.forEach((n) => {
        batch.delete(doc(db, 'notifications', n.id));
      });
      await batch.commit();
    } catch (err) {
      console.error('[Notifications] Error clearing notifications:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingBag size={18} style={{ color: 'var(--primary-600)' }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />;
      case 'user':
        return <User size={18} style={{ color: 'var(--info)' }} />;
      case 'security':
        return <Shield size={18} style={{ color: 'var(--danger)' }} />;
      case 'report':
        return <BarChart3 size={18} style={{ color: 'var(--success)' }} />;
      default:
        return <Bell size={18} />;
    }
  };

  const filteredList = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <>
      <SEO title="System Notifications" description="Alerts, order updates, and inventory notices." />

      <div className="page-title-bar">
        <div>
          <h1 className="page-title">Notification Center</h1>
          <p className="page-subtitle">Platform alerts, real-time inventory thresholds, and administrative triggers.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<CheckCheck size={16} />}
            onClick={markAllAsRead}
            disabled={notifications.every((n) => n.read)}
          >
            Mark All as Read
          </Button>
          <Button
            size="sm"
            variant="ghost"
            style={{ color: 'var(--danger)' }}
            leftIcon={<Trash2 size={16} />}
            onClick={clearAll}
            disabled={notifications.length === 0}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 600,
            minHeight: '44px',
            border: '1px solid',
            borderColor: filter === 'all' ? '#e51e25' : '#e2e8f0',
            background: filter === 'all' ? '#e51e25' : '#ffffff',
            color: filter === 'all' ? '#ffffff' : '#334155',
            boxShadow: filter === 'all' ? '0 4px 14px rgba(229, 30, 37, 0.35)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 600,
            minHeight: '44px',
            border: '1px solid',
            borderColor: filter === 'unread' ? '#e51e25' : '#e2e8f0',
            background: filter === 'unread' ? '#e51e25' : '#ffffff',
            color: filter === 'unread' ? '#ffffff' : '#334155',
            boxShadow: filter === 'unread' ? '0 4px 14px rgba(229, 30, 37, 0.35)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredList.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', background: '#ffffff', border: '1px solid #eef2f6', borderRadius: '16px', color: '#64748b' }}>
            <Bell size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>No notifications at this time</h4>
            <p style={{ fontSize: '0.85rem' }}>You're all caught up with orders and operational alerts.</p>
          </div>
        ) : (
          filteredList.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markSingleAsRead(notif.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1.25rem 1.5rem',
                borderRadius: '16px',
                border: notif.read ? '1px solid #eef2f6' : '1px solid rgba(229, 30, 37, 0.25)',
                background: notif.read ? '#ffffff' : 'rgba(229, 30, 37, 0.03)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {getIcon(notif.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: notif.read ? 600 : 800, margin: 0, color: 'var(--text-primary)' }}>
                    {notif.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notif.time}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {notif.message}
                </p>
              </div>

              {!notif.read && (
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--primary-600)',
                    flexShrink: 0,
                    alignSelf: 'center',
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Notifications;
