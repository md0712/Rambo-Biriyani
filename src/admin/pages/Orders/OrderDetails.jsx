import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  CheckCircle,
  Truck,
  PackageCheck,
  AlertCircle,
  MapPin,
  CreditCard,
  User,
  Mail,
  Copy,
  Check,
  Send,
  Sparkles,
} from 'lucide-react';
import SEO from '../../../components/shared/SEO';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import Loader from '../../../components/common/Loader';
import orderService from '../../../services/orderService';
import { formatCurrency, copyToClipboard } from '../../../utils/helpers';
import { ORDER_STATUS } from '../../../utils/constants';
import {
  generateCustomerEbillText,
  generateCustomerEbillHtml,
  sendCustomerEbillEmail,
} from '../../../services/emailService';

export const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // E-Bill Modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [sentNotice, setSentNotice] = useState(false);

  useEffect(() => {
    orderService
      .getOrderById(id)
      .then((data) => {
        setOrder(data);
        if (data) {
          setTargetEmail(data.customerEmail || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    const updated = await orderService.updateOrderStatus(id, newStatus);
    setOrder(updated);
  };

  const handleSendEmail = () => {
    if (!order) return;
    sendCustomerEbillEmail(order, targetEmail);
    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 4000);
  };

  const handleCopyEbill = async () => {
    if (!order) return;
    const text = generateCustomerEbillText(order);
    await copyToClipboard(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
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

  const subtotal = Number(order.total) || 0;
  const tax = subtotal * 0.05; // 5% GST
  const grandTotal = subtotal;

  const steps = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
  ];

  const currentStepIndex = steps.indexOf(order.status);
  const ebillText = generateCustomerEbillText(order);

  return (
    <>
      <SEO title={`Order ${order.id}`} description="Order fulfillment breakdown and customer invoice." />

      <div className="page-title-bar">
        <div>
          <Link to="/admin/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={14} /> Back to Orders
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className="page-title">Order #{order.id}</h1>
            <span
              className={`badge ${
                order.status === 'Delivered'
                  ? 'badge-success'
                  : order.status === 'Shipped' || order.status === 'Out for Delivery'
                  ? 'badge-info'
                  : order.status === 'Cooking on Dum' || order.status === 'Processing'
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

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Mail size={15} />}
            onClick={() => setEmailModalOpen(true)}
          >
            Send E-Bill Email
          </Button>
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

      {/* Two Column Order Details Layout */}
      <div className="dashboard-two-col-grid" style={{ alignItems: 'start' }}>
        {/* Left Column: Order Items & Pricing */}
        <div className="table-card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Ordered Dum Delicacies</h3>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{item.quantity || 1}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 1))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={{ fontWeight: 600 }}>Dum Biriyani Combo Special</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>1</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(order.total)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pricing Breakdown */}
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '240px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '240px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee:</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '240px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>GST (Included):</span>
              <span>5%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '240px', fontSize: '1.15rem', fontWeight: 800, borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
              <span>Grand Total:</span>
              <span style={{ color: 'var(--primary-600)' }}>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Customer Summary Card */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} style={{ color: 'var(--primary-600)' }} /> Customer Information
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.9rem' }}>
              <div style={{ fontWeight: 700 }}>{order.customer}</div>
              <div style={{ color: 'var(--text-secondary)' }}>{order.customerEmail || 'No email registered'}</div>
              <div style={{ color: 'var(--text-secondary)' }}>{order.customerPhone || 'No phone registered'}</div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} style={{ color: 'var(--primary-600)' }} /> Delivery Destination
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {order.shippingAddress || 'Counter Pickup (Takeaway)'}
            </p>
          </div>

          {/* Payment Method Card */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} style={{ color: 'var(--primary-600)' }} /> Payment Details
            </h4>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div>Method: <strong>{order.paymentMethod}</strong></div>
              <div style={{ marginTop: '0.35rem', color: 'var(--success)', fontWeight: 600 }}>Payment Captured & Cleared</div>
            </div>
          </div>

          {/* Change Order Status */}
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

      {/* Customer Congratulatory E-Bill Modal */}
      {emailModalOpen && (
        <Modal
          isOpen={emailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          title="Customer E-Bill & Congratulation Email"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {sentNotice && (
              <div style={{ padding: '0.85rem 1rem', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem' }}>
                ✓ Mail client opened with pre-filled congratulatory E-Bill for {order.customer}!
              </div>
            )}

            {/* Congratulation Header Banner */}
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: '#059669', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={18} />
              </div>
              <div>
                <strong style={{ color: '#065f46', fontSize: '0.95rem' }}>
                  Congratulations {order.customer}!
                </strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#047857' }}>
                  Order #{order.id} has been placed successfully. A full E-Bill copy is ready to send to the customer.
                </p>
              </div>
            </div>

            {/* Recipient Email Input */}
            <Input
              label="Recipient Customer Email"
              type="email"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              placeholder="customer@example.com"
              leftIcon={<Mail size={16} />}
              helperText="You can send this directly via your email client or copy the message below."
            />

            {/* Live E-Bill Plaintext Preview */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                E-Bill Message Preview:
              </label>
              <pre
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'monospace',
                  fontSize: '0.775rem',
                  lineHeight: '1.45',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-light)',
                  whiteSpace: 'pre-wrap',
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                {ebillText}
              </pre>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <Button
                variant="outline"
                onClick={handleCopyEbill}
                leftIcon={copiedText ? <Check size={16} /> : <Copy size={16} />}
              >
                {copiedText ? 'Copied to Clipboard!' : 'Copy Bill Text'}
              </Button>
              <Button
                variant="primary"
                onClick={handleSendEmail}
                leftIcon={<Send size={16} />}
              >
                Send via Email (Mail Client)
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default OrderDetails;
