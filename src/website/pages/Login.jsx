import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, LogIn, Flame, AlertCircle } from 'lucide-react';
import SEO from '../../components/shared/SEO';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Logo from '../../components/shared/Logo';
import { useAuth } from '../../hooks/useAuth';
import { validateLoginForm } from '../../utils/validators';

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
    if (authError) setAuthError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setAuthError('');
    try {
      const data = await login(formData.email, formData.password);
      if (from) {
        navigate(from, { replace: true });
      } else if (data.user.role === 'Admin' || data.user.role === 'Manager') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/account', { replace: true });
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO title="Warrior Sign In" description="Sign in to your Rambo Biriyani customer or staff portal." />

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
            maxWidth: '380px',
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
              CUSTOMER SIGN IN
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>
              Sign in to track live orders, view history & use vouchers
            </p>
          </div>

          {authError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.75rem 0.85rem',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger)',
                fontSize: '0.825rem',
                fontWeight: 600,
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Customer Email Address"
              name="email"
              type="email"
              placeholder="customer@domain.com"
              required
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail size={16} />}
              containerStyle={{ marginBottom: '0.65rem' }}
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              required
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<Lock size={16} />}
              containerStyle={{ marginBottom: '0.85rem' }}
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

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isLoading}
              style={{
                marginTop: '0.85rem',
                padding: '0.75rem 1.25rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                background: 'linear-gradient(135deg, #e51e25 0%, #b91c1c 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 18px rgba(229, 30, 37, 0.45)',
                whiteSpace: 'nowrap',
              }}
              rightIcon={<LogIn size={18} />}
            >
              Sign In as Customer
            </Button>
          </form>

          {/* Quick Demo Customer Helper */}
          <div
            style={{
              marginTop: '1rem',
              padding: '0.55rem 0.85rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px dashed rgba(197, 161, 106, 0.35)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
            }}
          >
            <span style={{ color: '#9ca3af' }}>Demo Customer:</span>
            <button
              type="button"
              onClick={() => {
                setFormData({ email: 'marcus@outlook.com', password: 'password123' });
                setErrors({});
                setAuthError('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#c5a16a',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Fill marcus@outlook.com
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: '#9ca3af' }}>
            New to Rambo Biriyani?{' '}
            <Link to="/register" style={{ fontWeight: 800, color: 'var(--rambo-red-bright)' }}>
              Create a Customer Account
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

export default Login;
