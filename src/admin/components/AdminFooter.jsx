import React from 'react';
import { APP_CONFIG } from '../../utils/constants';

export const AdminFooter = () => {
  return (
    <footer className="admin-footer">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span>
          {APP_CONFIG.NAME} Management OS v{APP_CONFIG.VERSION}
        </span>
        <span>•</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--success)' }} />
          Cluster Online
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <a href="#docs" onClick={(e) => e.preventDefault()} style={{ color: 'var(--text-muted)' }}>
          Documentation
        </a>
        <a href="#support" onClick={(e) => e.preventDefault()} style={{ color: 'var(--text-muted)' }}>
          API Status
        </a>
      </div>
    </footer>
  );
};

export default AdminFooter;
