import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Phone, Shield, Lock } from 'lucide-react';
import SEO from '../../../components/shared/SEO';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import userService from '../../../services/userService';
import { USER_ROLES } from '../../../utils/constants';
import { validateEmail, validateRequired } from '../../../utils/validators';

export const UserCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: USER_ROLES.CUSTOMER,
    status: 'Active',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const nameErr = validateRequired(formData.name, 'Full name');
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      await userService.createUser(formData);
      navigate('/admin/users');
    } catch (err) {
      setServerError(err.message || 'Failed to create user account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Create New User" description="Provision a new user account in Rambo." />

      <div className="page-title-bar">
        <div>
          <Link to="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={14} /> Back to Users
          </Link>
          <h1 className="page-title">Provision New User</h1>
          <p className="page-subtitle">Configure identity, contact information, and permission privileges.</p>
        </div>
      </div>

      <div style={{ maxWidth: '650px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        {serverError && (
          <div style={{ padding: '0.85rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            name="name"
            placeholder="Jane Doe"
            required
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            leftIcon={<User size={16} />}
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="jane.doe@company.com"
            required
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            leftIcon={<Mail size={16} />}
          />

          <Input
            label="Phone Number"
            name="phone"
            placeholder="+1 (555) 000-0000"
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

          <Input
            label="Initial Password"
            name="password"
            type="password"
            placeholder="Temporary setup password"
            value={formData.password}
            onChange={handleChange}
            leftIcon={<Lock size={16} />}
            helperText="The user will be prompted to rotate this password upon their first login."
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Link to="/admin/users">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" isLoading={loading} leftIcon={<Save size={16} />}>
              Create User Account
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default UserCreate;
