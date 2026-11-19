import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Shield, CheckCircle, XCircle } from 'lucide-react';
import SEO from '../../../components/shared/SEO';
import DataTable from '../../components/DataTable';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import Loader from '../../../components/common/Loader';
import userService from '../../../services/userService';

export const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await userService.getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleToggleStatus = async (id) => {
    await userService.toggleUserStatus(id);
    loadUsers();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await userService.deleteUser(deleteTarget.id);
    setDeleteTarget(null);
    loadUsers();
  };

  const columns = [
    {
      header: 'User',
      key: 'name',
      sortable: true,
      render: (u) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={u.name}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 700 }}>{u.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      key: 'role',
      sortable: true,
      render: (u) => (
        <span
          className={`badge ${
            u.role === 'Admin'
              ? 'badge-primary'
              : u.role === 'Manager'
              ? 'badge-info'
              : 'badge-secondary'
          }`}
          style={{ background: u.role === 'Customer' ? 'var(--bg-tertiary)' : undefined }}
        >
          {u.role}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (u) => (
        <button
          onClick={() => handleToggleStatus(u.id)}
          title="Click to toggle status"
          className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}`}
          style={{ cursor: 'pointer', border: 'none' }}
        >
          {u.status}
        </button>
      ),
    },
    {
      header: 'Joined Date',
      key: 'joinedDate',
      sortable: true,
    },
    {
      header: 'Last Login',
      key: 'lastLogin',
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (u) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link to={`/admin/users/${u.id}`} title="View Details">
            <Button size="sm" variant="ghost">
              <Eye size={15} />
            </Button>
          </Link>
          <Link to={`/admin/users/${u.id}/edit`} title="Edit User">
            <Button size="sm" variant="ghost">
              <Edit size={15} />
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            style={{ color: 'var(--danger)' }}
            onClick={() => setDeleteTarget(u)}
            title="Delete User"
          >
            <Trash2 size={15} />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loader text="Loading directory of registered users..." />;
  }

  return (
    <>
      <SEO title="Users Management" description="Manage platform user accounts, roles and status." />

      <div className="page-title-bar">
        <div>
          <h1 className="page-title">User Accounts</h1>
          <p className="page-subtitle">Inspect profiles, adjust security roles, and maintain user access.</p>
        </div>
        <Link to="/admin/users/new">
          <Button variant="primary" size="md" leftIcon={<Plus size={16} />}>
            Create User
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="Filter by name, email or role..."
        searchKeys={['name', 'email', 'role']}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm User Deletion"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Permanently Delete
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Are you sure you want to permanently delete user account <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email})? This action cannot be reversed.
        </p>
      </Modal>
    </>
  );
};

export default UserList;
