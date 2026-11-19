import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  trend,
  trendDirection = 'up',
  icon,
  iconBg = 'var(--primary-100)',
  iconColor = 'var(--primary-600)',
  subtitle,
}) => {
  const isUp = trendDirection === 'up';

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-title">{title}</span>
        {icon && (
          <div
            className="stat-icon-wrapper"
            style={{ backgroundColor: iconBg, color: iconColor }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-footer">
        {trend && (
          <span className={`stat-trend ${isUp ? 'trend-up' : 'trend-down'}`}>
            {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trend}</span>
          </span>
        )}
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
      </div>
    </div>
  );
};

export default StatCard;
