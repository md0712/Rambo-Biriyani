import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Mail, Phone, Calendar, Clock, ShieldCheck, CheckCircle } from 'lucide-react';
import SEO from '../../../components/shared/SEO';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';
import userService from '../../../services/userService';

export const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getUserById(id)
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader text="Loading account details..." />;
  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>User not found</h3>
        <Link to="/admin/users">
          <Button variant="outline" size="sm" style={{ marginTop: '1rem' }}>
            Back to Users
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO title={`User: ${user.name}`} description="User details and security standing." />

      <div className="page-title-bar">
        <div>
          <Link to="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={14} /> Back to Users
          </Link>
          <h1 className="page-title">User Account Dossier</h1>
          <p className="page-subtitle">Security parameters, role permissions, and activity timeline.</p>
        </div>
        <Link to={`/admin/users/${user.id}/edit`}>
          <Button variant="primary" size="md" leftIcon={<Edit size={16} />}>
            Edit Account
          </Button>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Profile Card */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border-light)', textAlign: 'center' }}>
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
            alt={user.name}
            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1.25rem', border: '4px solid var(--primary-100)' }}
          />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem' }}>{user.name}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span className="badge badge-primary">{user.role}</span>
            <span className={`badge ${user.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
              {user.status}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Mail size={16} style={{ color: 'var(--text-muted)' }} />
              <span>{user.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Phone size={16} style={{ color: 'var(--text-muted)' }} />
              <span>{user.phone || 'No phone recorded'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
              <span>Joined: {user.joinedDate}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Clock size={16} style={{ color: 'var(--text-muted)' }} />
              <span>Last Active: {user.lastLogin}</span>
            </div>
          </div>
        </div>

        {/* Security and Permissions Detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} style={{ color: 'var(--primary-600)' }} />
              System Permissions & Entitlements
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Catalog Management</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {user.role === 'Customer' ? 'Read-only access' : 'Full Create, Update, Delete access'}
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Financial Analytics</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {user.role === 'Admin' ? 'Unrestricted access' : 'Restricted to Admin only'}
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>User Provisioning</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {user.role === 'Admin' ? 'Can manage and invite users' : 'No user management access'}
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Order Processing</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {user.role === 'Customer' ? 'Own order history only' : 'Manage all customer orders'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Recent Security Events</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                <span>Successful authentication from session</span>
                <span style={{ color: 'var(--text-muted)' }}>{user.lastLogin}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span>Profile synchronized with master database</span>
                <span style={{ color: 'var(--text-muted)' }}>{user.joinedDate}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetails;
