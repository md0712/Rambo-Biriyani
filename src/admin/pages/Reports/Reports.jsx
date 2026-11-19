import React, { useState } from 'react';
import { Download, Calendar, TrendingUp, DollarSign, Percent, BarChart2, PieChart } from 'lucide-react';
import SEO from '../../../components/shared/SEO';
import Button from '../../../components/common/Button';
import StatCard from '../../components/StatCard';
import { formatCurrency } from '../../../utils/helpers';

export const Reports = () => {
  const [period, setPeriod] = useState('30d');
  const [exportNotice, setExportNotice] = useState(false);

  const categoryBreakdown = [
    { name: 'Electronics', share: 44, amount: 24800, color: 'var(--primary-600)' },
    { name: 'Accessories', share: 22, amount: 12400, color: 'var(--secondary-500)' },
    { name: 'Fitness & Sports', share: 18, amount: 10100, color: 'var(--success)' },
    { name: 'Home & Living', share: 11, amount: 6200, color: 'var(--warning)' },
    { name: 'Software & Cloud', share: 5, amount: 2800, color: 'var(--info)' },
  ];

  const monthlyGrowth = [
    { month: 'November 2026', orders: 482, revenue: 56300, growth: '+14.2%' },
    { month: 'October 2026', orders: 421, revenue: 49300, growth: '+9.8%' },
    { month: 'September 2026', orders: 384, revenue: 44900, growth: '+12.1%' },
    { month: 'August 2026', orders: 342, revenue: 40050, growth: '+6.4%' },
  ];

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <>
      <SEO title="Financial & Sales Reports" description="Comprehensive revenue and sales analytics." />

      <div className="page-title-bar">
        <div>
          <h1 className="page-title">Analytics & Intelligence</h1>
          <p className="page-subtitle">Examine unit economics, sales trajectories, and catalog performance.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last Quarter</option>
            <option value="ytd">Year to Date (2026)</option>
          </select>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<Download size={15} />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {exportNotice && (
        <div style={{ padding: '0.85rem 1.25rem', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', color: 'var(--success)', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
          ✓ Export generated: `rambo_sales_report_${period}.csv` has been prepared for download.
        </div>
      )}

      {/* KPI Cards */}
      <div className="stat-cards-grid">
        <StatCard
          title="Gross Merchandise Value"
          value={formatCurrency(56300)}
          trend="+14.2% vs previous period"
          trendDirection="up"
          icon={<DollarSign size={20} />}
          iconBg="var(--primary-100)"
          iconColor="var(--primary-600)"
        />
        <StatCard
          title="Average Order Value (AOV)"
          value={formatCurrency(116.8)}
          trend="+5.4% expansion"
          trendDirection="up"
          icon={<TrendingUp size={20} />}
          iconBg="var(--success-bg)"
          iconColor="var(--success)"
        />
        <StatCard
          title="Checkout Conversion Rate"
          value="3.42%"
          trend="+0.6% baseline"
          trendDirection="up"
          icon={<Percent size={20} />}
          iconBg="var(--secondary-100)"
          iconColor="var(--secondary-600)"
        />
        <StatCard
          title="Return Rate"
          value="1.24%"
          trend="-0.3% lower"
          trendDirection="down"
          icon={<BarChart2 size={20} />}
          iconBg="var(--info-bg)"
          iconColor="var(--info)"
        />
      </div>

      {/* Category Share & Monthly Breakdown */}
      <div className="dashboard-two-col-grid" style={{ marginBottom: '2rem' }}>
        {/* Category Share Distribution */}
        <div className="table-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Revenue by Merchandise Category</h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Contribution percentage across top product groups</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {categoryBreakdown.map((cat) => (
              <div key={cat.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600 }}>{cat.name}</span>
                  <span style={{ fontWeight: 700 }}>{formatCurrency(cat.amount)} ({cat.share}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${cat.share}%`, height: '100%', background: cat.color, borderRadius: 'var(--radius-full)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Performance Table */}
        <div className="table-card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Monthly Run-Rate Summary</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total Orders</th>
                  <th>Net Revenue</th>
                  <th>Growth Rate</th>
                </tr>
              </thead>
              <tbody>
                {monthlyGrowth.map((row) => (
                  <tr key={row.month}>
                    <td style={{ fontWeight: 600 }}>{row.month}</td>
                    <td>{row.orders} orders</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(row.revenue)}</td>
                    <td>
                      <span className="badge badge-success">{row.growth}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;
