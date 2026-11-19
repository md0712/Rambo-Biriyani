import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, CheckCircle, Truck, Clock, AlertCircle } from 'lucide-react';
import SEO from '../../../components/shared/SEO';
import DataTable from '../../components/DataTable';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';
import orderService from '../../../services/orderService';
import { formatCurrency } from '../../../utils/helpers';
import { ORDER_STATUS } from '../../../utils/constants';

export const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadOrders();

    const unsubscribe = orderService.subscribeOrders(
      (liveOrders) => {
        setOrders(liveOrders);
        setLoading(false);
      },
      { status: statusFilter }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    const data = await orderService.getAllOrders({
      status: statusFilter === 'All' ? undefined : statusFilter,
    });
    setOrders(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    await orderService.updateOrderStatus(id, newStatus);
    loadOrders();
  };

  const columns = [
    {
      header: 'Order ID',
      key: 'id',
      sortable: true,
      render: (o) => (
        <Link to={`/admin/orders/${o.id}`} style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
          {o.id}
        </Link>
      ),
    },
    {
      header: 'Customer',
      key: 'customer',
      sortable: true,
      render: (o) => (
        <div>
          <div style={{ fontWeight: 600 }}>{o.customer}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customerEmail}</div>
        </div>
      ),
    },
    {
      header: 'Date Placed',
      key: 'date',
      sortable: true,
      render: (o) => <span style={{ fontSize: '0.85rem' }}>{o.date}</span>,
    },
    {
      header: 'Items',
      key: 'itemsCount',
      sortable: true,
      render: (o) => <span>{o.itemsCount} {o.itemsCount === 1 ? 'item' : 'items'}</span>,
    },
    {
      header: 'Total',
      key: 'total',
      sortable: true,
      render: (o) => <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(o.total)}</strong>,
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (o) => (
        <select
          value={o.status}
          onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
          style={{
            padding: '0.4rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: '1px solid #cbd5e1',
            backgroundColor:
              o.status === 'Delivered'
                ? '#ecfdf5'
                : o.status === 'Shipped'
                ? '#e0f2fe'
                : o.status === 'Processing' || o.status === 'Preparing in Dum'
                ? 'rgba(229, 30, 37, 0.06)'
                : o.status === 'Cancelled'
                ? '#fee2e2'
                : '#f8fafc',
            color:
              o.status === 'Delivered'
                ? '#059669'
                : o.status === 'Shipped'
                ? '#0284c7'
                : o.status === 'Processing' || o.status === 'Preparing in Dum'
                ? '#e51e25'
                : o.status === 'Cancelled'
                ? '#dc2626'
                : '#334155',
            minHeight: '36px',
          }}
        >
          {Object.values(ORDER_STATUS).map((st) => (
            <option key={st} value={st} style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
              {st}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (o) => (
        <Link to={`/admin/orders/${o.id}`}>
          <Button size="sm" variant="ghost" leftIcon={<Eye size={15} />}>
            Details
          </Button>
        </Link>
      ),
    },
  ];

  if (loading) return <Loader text="Retrieving orders stream..." />;

  return (
    <>
      <SEO title="Order Fulfillment" description="Track and manage customer orders." />

      <div className="page-title-bar">
        <div>
          <h1 className="page-title">Orders Management</h1>
          <p className="page-subtitle">Inspect customer purchases, track fulfillment states, and review invoices.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '6px' }}>
        {['All', ...Object.values(ORDER_STATUS)].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              minHeight: '44px',
              border: '1px solid',
              borderColor: statusFilter === status ? '#e51e25' : '#e2e8f0',
              background: statusFilter === status ? '#e51e25' : '#ffffff',
              color: statusFilter === status ? '#ffffff' : '#475569',
              cursor: 'pointer',
              boxShadow: statusFilter === status ? '0 4px 14px rgba(229, 30, 37, 0.35)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {status}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={orders}
        searchPlaceholder="Filter by order number, customer name or email..."
        searchKeys={['id', 'customer', 'customerEmail']}
      />
    </>
  );
};

export default OrderList;
