import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, ChevronDown, Package, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

export const Navbar = ({ cartCount = 0, onOpenCart, onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get('category');

  const isHome = location.pathname === '/';
  const isAbout = location.pathname === '/about';
  const isContact = location.pathname === '/contact';

  const isBestSellers =
    location.pathname === '/products' &&
    searchParams.get('type') === 'bestseller';

  const isOrderOnline =
    !isBestSellers &&
    (location.pathname === '/products' ||
      location.pathname.startsWith('/products/') ||
      location.pathname.startsWith('/product/'));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.rambo-user-menu-wrap')) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className={`rambo-navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="rambo-navbar-inner">
        {/* Brand Logo - Master Red & Gold Military Insignia */}
        <Link to="/" className="rambo-navbar-brand" aria-label="Rambo Biriyani Home">
          <div className="rambo-logo-text">RAMBO</div>
          <div className="rambo-logo-sub">
            <span className="logo-stripes">
              <span className="stripe-line stripe-long" />
              <span className="stripe-line stripe-short" />
            </span>
            <span className="logo-biriyani-txt">BIRIYANI</span>
            <span className="logo-stripes">
              <span className="stripe-line stripe-long" />
              <span className="stripe-line stripe-short" />
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className={`rambo-nav-links ${mobileMenuOpen ? 'mobile-show' : ''}`}>
          <Link
            to="/"
            className={`rambo-nav-item ${isHome ? 'is-active-pill' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>

          {/* Menu Dropdown */}
          <div
            className="rambo-dropdown-wrap"
            onMouseEnter={() => setMenuDropdownOpen(true)}
            onMouseLeave={() => setMenuDropdownOpen(false)}
          >
            <div
              className="rambo-nav-item rambo-dropdown-toggle"
              onClick={() => setMenuDropdownOpen(!menuDropdownOpen)}
            >
              <span>Menu</span>
              <ChevronDown
                size={14}
                strokeWidth={2.4}
                className={`chevron-icon ${menuDropdownOpen ? 'rotate' : ''}`}
              />
            </div>

            {menuDropdownOpen && (
              <div className="rambo-dropdown-panel">
                {['Biriyanis', 'Add Ons', 'Combos', 'Beverages'].map((cat) => (
                  <Link
                    key={cat}
                    to={`/products?category=${encodeURIComponent(cat)}`}
                    className="rambo-dropdown-link"
                    onClick={() => {
                      setMenuDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/about"
            className={`rambo-nav-item ${isAbout ? 'is-active-pill' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Our Story
          </Link>

          <Link
            to="/products?type=bestseller&category=Biriyanis"
            className={`rambo-nav-item ${isBestSellers ? 'is-active-pill' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Best Sellers
          </Link>

          <Link
            to="/products"
            className={`rambo-nav-item ${isOrderOnline ? 'is-active-pill' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Order Online
          </Link>

          <Link
            to="/contact"
            className={`rambo-nav-item ${isContact ? 'is-active-pill' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </Link>

          {isAuthenticated ? (
            <Link
              to="/account"
              className={`rambo-nav-item ${location.pathname === '/account' ? 'is-active-pill' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              My Account
            </Link>
          ) : (
            <Link
              to="/login"
              className="rambo-nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Right Navigation Actions */}
        <div className="rambo-nav-actions">
          {/* Search Button */}
          <button
            type="button"
            onClick={onOpenSearch || (() => navigate('/products'))}
            className="rambo-icon-btn"
            title="Search Menu"
            aria-label="Search Menu"
          >
            <Search size={20} strokeWidth={2} />
          </button>

          {/* User Account / Profile */}
          {isAuthenticated ? (
            <div className="rambo-user-menu-wrap" style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="rambo-icon-btn"
                title={user?.name || 'My Account'}
                aria-label="User Account Menu"
                style={{ cursor: 'pointer', background: 'transparent', border: 'none', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user?.name || 'User'}
                  className="rambo-avatar-img"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #c5a16a' }}
                />
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 14px)',
                    right: 0,
                    width: '240px',
                    backgroundColor: '#120b0a',
                    border: '1.5px solid rgba(197, 161, 106, 0.35)',
                    borderRadius: '14px',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.9), 0 0 20px rgba(229, 30, 37, 0.2)',
                    padding: '0.75rem 0',
                    zIndex: 1000,
                    animation: 'fadeIn 0.15s ease-out',
                  }}
                >
                  <div
                    style={{
                      padding: '0.5rem 1rem 0.75rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <div style={{ fontSize: '0.925rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.name || 'Customer'}
                    </div>
                    <div style={{ fontSize: '0.785rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.email}
                    </div>
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: '0.35rem',
                        background: isAdmin ? 'rgba(229, 30, 37, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: isAdmin ? '#e51e25' : '#f59e0b',
                        border: `1px solid ${isAdmin ? 'rgba(229, 30, 37, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {isAdmin ? 'Kitchen Admin' : 'Customer Account'}
                    </span>
                  </div>

                  <Link
                    to="/account"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.6rem 1rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      textDecoration: 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(229, 30, 37, 0.15)')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Package size={16} style={{ color: '#e51e25' }} />
                    <span>My Orders & Dashboard</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.6rem 1rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        textDecoration: 'none',
                        transition: 'background 0.15s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(229, 30, 37, 0.15)')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Shield size={16} style={{ color: '#f59e0b' }} />
                      <span>Admin Control Panel</span>
                    </Link>
                  )}

                  <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '0.35rem 0' }} />

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                      navigate('/');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.6rem 1rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#ef4444',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rambo-icon-btn"
              title="Sign In / Admin"
              aria-label="Sign In / Admin"
            >
              <User size={20} strokeWidth={2} />
            </Link>
          )}

          {/* Cart Icon with Counter Badge */}
          <button
            type="button"
            onClick={onOpenCart}
            className="rambo-icon-btn rambo-cart-btn"
            title="View Cart"
            aria-label="View Cart"
          >
            <ShoppingBag size={20} strokeWidth={2} />
            <span className="rambo-cart-counter">{cartCount}</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="rambo-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
