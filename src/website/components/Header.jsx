import React from 'react';
import { Phone, Mail, Flame, Bike } from 'lucide-react';
import { APP_CONFIG } from '../../utils/constants';

export const Header = () => {
  return (
    <div className="top-header">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Phone size={13} style={{ color: 'var(--rambo-red-bright)' }} />
            <span style={{ fontWeight: 600 }}>{APP_CONFIG.CONTACT_PHONE}</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Mail size={13} style={{ color: 'var(--rambo-red-bright)' }} />
            <span>{APP_CONFIG.CONTACT_EMAIL}</span>
          </span>
        </div>

        <div className="top-header-links">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Flame size={13} style={{ color: 'var(--spice-amber)' }} />
            <span style={{ color: '#fde047', fontWeight: 600 }}>Fresh Wood-Fired Dum Handis Ready Every 30 Mins</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Bike size={13} style={{ color: 'var(--rambo-red-bright)' }} />
            <span>Free Express Delivery over ₹499</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
