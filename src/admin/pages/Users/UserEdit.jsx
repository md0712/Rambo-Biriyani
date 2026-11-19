import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Phone, Shield } from 'lucide-react';
import SEO from '../../../components/shared/SEO';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Loader from '../../../components/common/Loader';
import userService from '../../../services/userService';
import { USER_ROLES } from '../../../utils/constants';

export const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    status: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    userService
      .getUserById(id)
      .then((data) => {
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          role: data.role,
          status: data.status,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.updateUser(id, formData);
      navigate('/admin/users');
    } catch (err) {
      setError(err.message || 'Failed to update user profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader text="Loading user profile..." />;
  }

  return (
    <>
      <SEO title="Edit User" description="Modify user details and account status." />

      <div className="page-title-bar">
        <div>
          <Link to="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={14} /> Back to Users
          </Link>
          <h1 className="page-title">Edit User Account</h1>
          <p className="page-subtitle">Update contact details, role privileges, and active standing.</p>
        </div>
      </div>

      <div style={{ maxWidth: '650px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        {error && (
          <div style={{ padding: '0.85rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            leftIcon={<User size={16} />}
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            leftIcon={<Mail size={16} />}
          />

          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            leftIcon={<Phone size={16} />}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              type="select"
              label="Assigned Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: USER_ROLES.CUSTOMER, label: 'Customer' },
                { value: USER_ROLES.MANAGER, label: 'Manager' },
                { value: USER_ROLES.ADMIN, label: 'Admin (Full Privileges)' },
              ]}
            />

            <Input
              type="select"
              label="Account Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive / Suspended' },
              ]}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Link to="/admin/users">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" isLoading={saving} leftIcon={<Save size={16} />}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default UserEdit;
