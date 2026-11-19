import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle, Truck, PackageCheck, AlertCircle, MapPin, CreditCard, User } from 'lucide-react';
import SEO from '../../../components/shared/SEO';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';
import orderService from '../../../services/orderService';
import { formatCurrency } from '../../../utils/helpers';
import { ORDER_STATUS } from '../../../utils/constants';

export const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getOrderById(id)
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    const updated = await orderService.updateOrderStatus(id, newStatus);
    setOrder(updated);
  };

  if (loading) return <Loader text="Loading order invoice..." />;
  if (!order) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>Order not found</h3>
        <Link to="/admin/orders">
          <Button variant="outline" size="sm" style={{ marginTop: '1rem' }}>
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const subtotal = order.total;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + tax;

  const steps = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
  ];

  const currentStepIndex = steps.indexOf(order.status);

  return (
    <>
      <SEO title={`Order ${order.id}`} description="Order fulfillment breakdown and customer invoice." />

      <div className="page-title-bar">
        <div>
          <Link to="/admin/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={14} /> Back to Orders
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className="page-title">Order {order.id}</h1>
            <span
              className={`badge ${
                order.status === 'Delivered'
                  ? 'badge-success'
                  : order.status === 'Shipped'
                  ? 'badge-info'
                  : order.status === 'Processing'
                  ? 'badge-warning'
                  : order.status === 'Cancelled'
                  ? 'badge-danger'
                  : 'badge-primary'
              }`}
            >
              {order.status}
            </span>
          </div>
          <p className="page-subtitle">Placed on {order.date} via {order.paymentMethod}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer size={15} />}
            onClick={() => window.print()}
          >
            Print Invoice
          </Button>
        </div>
      </div>

      {/* Fulfillment Status Progress Bar */}
      {order.status !== ORDER_STATUS.CANCELLED && (
        <div className="table-card" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', overflowX: 'auto' }}>
            {steps.map((st, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1, minWidth: '80px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: isCompleted ? '#e51e25' : '#f1f5f9',
                      color: isCompleted ? '#ffffff' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      marginBottom: '0.5rem',
                      border: isCurrent ? '3px solid rgba(229, 30, 37, 0.2)' : 'none',
                    }}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: isCompleted ? 700 : 500, color: isCompleted ? '#0f172a' : '#94a3b8', textAlign: 'center' }}>
                    {st}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two Column Layout: Customer Details & Order Items */}
      <div className="dashboard-two-col-grid">
        {/* Line Items Table */}
        <div className="table-card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Purchased Items</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {order.items?.length || 1} distinct items
            </span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || [
                  { productId: 'default', name: 'Product package items', price: order.total, quantity: 1 },
                ]).map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {item.productId}</div>
                    </td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{item.quantity || 1}</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency((item.price || 0) * (item.quantity || 1))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals */}
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)', backgroundColor: 'var(--bg-tertiary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Items Subtotal</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Estimated Shipping</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>Free (Tier Privilege)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>State & Local Taxes (8%)</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(tax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', fontSize: '1.2rem', fontWeight: 800 }}>
              <span>Total Invoiced</span>
              <span style={{ color: 'var(--primary-600)' }}>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Customer & Delivery Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} style={{ color: 'var(--primary-600)' }} /> Customer Overview
            </h4>
            <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700 }}>{order.customer}</div>
              <div style={{ color: 'var(--text-secondary)' }}>{order.customerEmail}</div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} style={{ color: 'var(--primary-600)' }} /> Shipping Destination
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {order.shippingAddress || '404 Silicon Alley, Austin, TX 78701'}
            </p>
          </div>

          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} style={{ color: 'var(--primary-600)' }} /> Payment Details
            </h4>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div>Method: <strong>{order.paymentMethod}</strong></div>
              <div style={{ marginTop: '0.35rem', color: 'var(--success)', fontWeight: 600 }}>Payment Captured & Cleared</div>
            </div>
          </div>

          {/* Update Order Status */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Change Order Status</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {Object.values(ORDER_STATUS).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--border-light)',
                    background: order.status === st ? 'var(--primary-600)' : 'var(--bg-tertiary)',
                    color: order.status === st ? '#ffffff' : 'var(--text-primary)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  Mark as {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetails;
