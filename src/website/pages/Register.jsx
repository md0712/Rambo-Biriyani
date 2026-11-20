import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, Flame, Phone } from 'lucide-react';
import SEO from '../../components/shared/SEO';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Logo from '../../components/shared/Logo';
import { useAuth } from '../../hooks/useAuth';
import { validateRegisterForm } from '../../utils/validators';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [regError, setRegError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
    if (regError) setRegError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setRegError('');
    try {
      await register(formData.name, formData.email, formData.password, formData.phone);
      navigate('/account');
    } catch (err) {
      setRegError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO title="Join Food Warriors" description="Register an account for quick biriyani re-ordering." />

      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          position: 'relative',
          backgroundColor: '#060404',
          backgroundImage: `
            radial-gradient(circle at center, rgba(14, 8, 7, 0.78) 0%, rgba(6, 4, 4, 0.94) 100%),
            url('/images/rambo-bg.jpg')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: '400px',
            background: 'rgba(18, 11, 10, 0.90)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '16px',
            padding: '1.75rem 1.5rem',
            border: '1.5px solid rgba(197, 161, 106, 0.35)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 25px rgba(225, 29, 36, 0.15)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <Logo size="md" />
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                fontFamily: "'Michroma', sans-serif",
                marginTop: '0.85rem',
                marginBottom: '0.25rem',
                color: '#ffffff',
                letterSpacing: '0.06em',
              }}
            >
              CREATE CUSTOMER ACCOUNT
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>
              Join Rambo Biriyani customers for fast checkout & live order tracking
            </p>
          </div>

          {regError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger)',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{regError}</span>
              {regError.includes('already exists') && (
                <Link
                  to="/login"
                  style={{
                    marginLeft: 'auto',
                    color: '#ffffff',
                    background: '#e51e25',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.785rem',
                    textDecoration: 'none',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  Sign In &rarr;
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Customer Full Name"
              name="name"
              placeholder="e.g. Vikramaditya S."
              required
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              leftIcon={<User size={16} />}
              containerStyle={{ marginBottom: '0.6rem' }}
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="customer@domain.com"
              required
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail size={16} />}
              containerStyle={{ marginBottom: '0.6rem' }}
            />

            <Input
              label="Phone Number (for Delivery Updates)"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              leftIcon={<Phone size={16} />}
              containerStyle={{ marginBottom: '0.6rem' }}
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
              required
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<Lock size={16} />}
              containerStyle={{ marginBottom: '0.6rem' }}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ color: '#9ca3af', display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              leftIcon={<Lock size={16} />}
              containerStyle={{ marginBottom: '0.75rem' }}
            />

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.785rem', color: '#9ca3af' }}>
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  style={{ marginTop: '3px' }}
                />
                <span>
                  I accept the <Link to="/about" style={{ color: 'var(--rambo-red-bright)', fontWeight: 700 }}>Terms</Link> and{' '}
                  <Link to="/about" style={{ color: 'var(--rambo-red-bright)', fontWeight: 700 }}>Privacy</Link>.
                </span>
              </label>
              {errors.terms && (
                <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                  {errors.terms}
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isLoading}
              style={{
                marginTop: '0.4rem',
                padding: '0.75rem 1.25rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                background: 'linear-gradient(135deg, #e51e25 0%, #b91c1c 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 18px rgba(229, 30, 37, 0.45)',
                whiteSpace: 'nowrap',
              }}
              rightIcon={<UserPlus size={18} />}
            >
              Create Customer Account
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.15rem', fontSize: '0.8rem', color: '#9ca3af' }}>
            Already have a Customer Account?{' '}
            <Link to="/login" style={{ fontWeight: 800, color: 'var(--rambo-red-bright)' }}>
              Sign In
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '0.85rem' }}>
            <Link
              to="/"
              style={{ color: '#9ca3af', fontSize: '0.785rem', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#9ca3af')}
            >
              ← Back to Store
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Register;
