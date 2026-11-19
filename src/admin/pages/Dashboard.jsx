import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  ShoppingBag,
  Package,
  ArrowRight,
  Plus,
  Bike,
} from 'lucide-react';
import SEO from '../../components/shared/SEO';
import StatCard from '../components/StatCard';
import Loader from '../../components/common/Loader';
import orderService from '../../services/orderService';
import productService from '../../services/productService';
import userService from '../../services/userService';
import { formatCurrency } from '../../utils/helpers';

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    loadDashboardData();

    // Subscribe to real-time live orders stream from Firestore
    const unsubscribeOrders = orderService.subscribeOrders((liveOrders) => {
      setRecentOrders(liveOrders.slice(0, 5));
    });

    // Subscribe to real-time product stock changes from Firestore
    const unsubscribeProducts = productService.subscribeProducts((liveProducts) => {
      setTopProducts(liveProducts.slice(0, 3));
    });

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeProducts) unsubscribeProducts();
    };
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [orderStats, orders, products, users] = await Promise.all([
        orderService.getDashboardStats(),
        orderService.getAllOrders(),
        productService.getAllProducts(),
        userService.getAllUsers(),
      ]);

      setStats({
        ...orderStats,
        activeUsers: users.filter((u) => u.status === 'Active').length,
        totalInventory: 920,
      });
      setRecentOrders(orders.slice(0, 5));
      setTopProducts(products.slice(0, 3));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader text="Connecting to live kitchen telemetry..." />;
  }

  return (
    <>
      <SEO title="Kitchen Operations Dashboard" description="Live restaurant overview of Rambo Biriyani." />

      {/* Page Title Bar */}
      <div className="page-title-bar">
        <div>
          <div className="title-with-badge">
            <h1 className="page-title">Live Kitchen Command</h1>
            <span className="live-dum-badge">LIVE DUM FIRING</span>
          </div>
          <p className="page-subtitle">Real-time revenue, dum portion availability, and delivery dispatch.</p>
        </div>

        <div className="title-action-buttons">
          <Link to="/admin/orders" className="btn-order-stream">
            <span>Live Order Stream</span>
            <ArrowRight size={14} />
          </Link>
          <Link to="/admin/products/new" className="btn-add-item">
            <Plus size={15} />
            <span>Add Menu Item</span>
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="stat-cards-grid">
        <StatCard
          title="Today's Biriyani Sales"
          value="₹2,725"
          trend="22.4% vs yesterday"
          trendDirection="up"
          icon={<Flame size={20} />}
          iconBg="rgba(229, 30, 37, 0.08)"
          iconColor="#e51e25"
        />
        <StatCard
          title="Orders Processed"
          value="5"
          trend="Peak lunch surge"
          trendDirection="up"
          icon={<ShoppingBag size={20} />}
          iconBg="rgba(245, 158, 11, 0.12)"
          iconColor="#d97706"
        />
        <StatCard
          title="Dum Portions Ready"
          value="920"
          trend="Handi 3 & 4 Active"
          trendDirection="up"
          icon={<Package size={20} />}
          iconBg="rgba(16, 185, 129, 0.12)"
          iconColor="#059669"
        />
        <StatCard
          title="Riders On Road"
          value="12 Active"
          trend="Avg 28 mins delivery"
          trendDirection="up"
          icon={<Bike size={20} />}
          iconBg="rgba(14, 165, 233, 0.12)"
          iconColor="#0284c7"
        />
      </div>

      {/* Two Column Grid */}
      <div className="dashboard-two-col-grid">
        {/* Left Column: Live Kitchen Orders */}
        <div className="table-card">
          <div className="table-card-header">
            <h3 className="card-heading">Live Kitchen Orders</h3>
            <Link to="/admin/orders" className="card-header-link">
              Kitchen Dispatch &rarr;
            </Link>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => {
                  const status = (ord.status || '').toLowerCase();
                  const isDumGlow = status.includes('dum') || status.includes('prepar') || status.includes('placed') || status.includes('cook');
                  const isDelivered = status.includes('deliver');

                  return (
                    <tr key={ord.id}>
                      <td>
                        <Link to={`/admin/orders/${ord.id}`} className="order-id-link">
                          {ord.id}
                        </Link>
                      </td>
                      <td>
                        <div className="customer-name">{ord.customer}</div>
                        <div className="customer-phone">{ord.customerPhone || ord.customerEmail}</div>
                      </td>
                      <td className="order-time">{ord.date}</td>
                      <td className="order-amount">{formatCurrency(ord.total)}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            isDumGlow
                              ? 'status-pill-glow'
                              : isDelivered
                              ? 'status-pill-green'
                              : 'status-pill-gray'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Fastest Moving Dum SKUs */}
        <div className="table-card">
          <div className="table-card-header">
            <h3 className="card-heading">Fastest Moving Dum SKUs</h3>
            <Link to="/admin/products" className="card-header-link">
              Stock &rarr;
            </Link>
          </div>

          <div className="sku-list-body">
            {topProducts.map((p) => {
              const portionSubtitle =
                p.portion && p.portion !== 'Serves 1-2'
                  ? p.portion
                  : p.name.toLowerCase().includes('kushka')
                  ? 'without egg'
                  : '1 Person';

              return (
                <div key={p.id} className="sku-row-item">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="sku-thumb-img"
                  />
                  <div className="sku-info-col">
                    <div className="sku-portion-text">
                      {portionSubtitle} • {p.stock} portions left
                    </div>
                  </div>
                  <div className="sku-meta-col">
                    <div className="sku-price-text">
                      {formatCurrency(p.price)}
                    </div>
                    <span className="sku-ready-badge">
                      READY DUM
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
