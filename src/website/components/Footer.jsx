import React from 'react';
import { Link } from 'react-router-dom';
import { Bike, ShoppingBag, MapPin, Clock, MessageCircle, Phone, Mail, Award, Flame } from 'lucide-react';
import Logo from '../../components/shared/Logo';
import { APP_CONFIG, PRODUCT_CATEGORIES } from '../../utils/constants';
import { getWhatsAppOrderLink } from '../../utils/helpers';

export const Footer = () => {
  return (
    <>
      {/* Bottom Quick Order & Location Bar (from Design) */}
      <section className="bottom-outlet-bar">
        <div className="container">
          <div className="bottom-bar-grid">
            {/* WhatsApp Order CTA */}
            <a
              href={getWhatsAppOrderLink(APP_CONFIG.WHATSAPP_NUMBER, 'Hi Rambo Biriyani, I would like to order fresh hot biriyani!')}
              target="_blank"
              rel="noreferrer"
              className="whatsapp-order-btn"
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <MessageCircle size={22} fill="#ffffff" color="#25D366" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.9 }}>Order on WhatsApp</div>
                <div style={{ fontSize: '1rem', fontWeight: 900 }}>{APP_CONFIG.CONTACT_PHONE}</div>
              </div>
            </a>

            {/* Home Delivery */}
            <div className="outlet-stat-item">
              <div className="outlet-stat-icon">
                <Bike size={26} />
              </div>
              <div>
                <div className="outlet-stat-value">Home Delivery</div>
                <div className="outlet-stat-label">Quick & Reliable</div>
              </div>
            </div>

            {/* Takeaway */}
            <div className="outlet-stat-item">
              <div className="outlet-stat-icon">
                <ShoppingBag size={26} />
              </div>
              <div>
                <div className="outlet-stat-value">Takeaway</div>
                <div className="outlet-stat-label">Order & Pick Up</div>
              </div>
            </div>

            {/* Location */}
            <div className="outlet-stat-item">
              <div className="outlet-stat-icon">
                <MapPin size={26} />
              </div>
              <div>
                <div className="outlet-stat-value">Our Location</div>
                <div className="outlet-stat-label">{APP_CONFIG.ADDRESS}</div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="outlet-stat-item">
              <div className="outlet-stat-icon">
                <Clock size={26} />
              </div>
              <div>
                <div className="outlet-stat-value">Opening Hours</div>
                <div className="outlet-stat-label">{APP_CONFIG.OPENING_HOURS}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer Links */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            {/* Col 1 */}
            <div>
              <Logo size="md" />
              <p
                style={{
                  color: '#9ca3af',
                  fontSize: '0.9rem',
                  margin: '1.25rem 0',
                  lineHeight: 1.6,
                  maxWidth: '340px',
                }}
              >
                Born from a passion for legendary biriyani, Rambo Biriyani brings you bold, traditional firewood dum flavours with a fierce warrior spirit.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                  ★ 4.9 Rated by 50,000+ Foodies
                </span>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="footer-heading">Menu Highlights</h4>
              <ul className="footer-link-list">
                <li><Link to="/products?category=Biriyanis">Chicken Dum Biriyani</Link></li>
                <li><Link to="/products?category=Biriyanis">Tender Mutton Biriyani</Link></li>
                <li><Link to="/products?category=Biriyanis">Signature Beef Biriyani</Link></li>
                <li><Link to="/products?category=Biriyanis">Chef's Special Biriyani</Link></li>
                <li><Link to="/products?category=Add+Ons">Chicken 65 & Chukka</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="footer-heading">Experience</h4>
              <ul className="footer-link-list">
                <li><Link to="/about">Our Story & Heritage</Link></li>
                <li><Link to="/services">Party Orders & Catering</Link></li>
                <li><Link to="/products">Online Ordering</Link></li>
                <li><Link to="/contact">Visit Our Kitchens</Link></li>
                <li><Link to="/admin">Staff Kitchen Portal</Link></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="footer-heading">Central Kitchen</h4>
              <ul className="footer-link-list" style={{ gap: '0.85rem' }}>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: '#9ca3af', fontSize: '0.875rem' }}>
                  <MapPin size={18} style={{ color: 'var(--rambo-red-bright)', flexShrink: 0, marginTop: '2px' }} />
                  <span>{APP_CONFIG.ADDRESS}</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
                  <Phone size={16} style={{ color: 'var(--rambo-red-bright)', flexShrink: 0 }} />
                  <span>Direct Hotline: {APP_CONFIG.CONTACT_PHONE}</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
                  <Mail size={16} style={{ color: 'var(--rambo-red-bright)', flexShrink: 0 }} />
                  <span>{APP_CONFIG.CONTACT_EMAIL}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div>
              &copy; {new Date().getFullYear()} {APP_CONFIG.NAME}. All rights reserved. Crafted for True Food Warriors.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                Kitchen Dum Firing Live
              </span>
              <Link to="/about">FSSAI Certified</Link>
              <Link to="/about">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
