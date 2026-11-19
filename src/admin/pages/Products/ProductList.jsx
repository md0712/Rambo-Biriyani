import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, Star, AlertTriangle } from 'lucide-react';
import SEO from '../../../components/shared/SEO';
import DataTable from '../../components/DataTable';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import Loader from '../../../components/common/Loader';
import productService from '../../../services/productService';
import { formatCurrency } from '../../../utils/helpers';

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadProducts();

    const unsubscribe = productService.subscribeProducts((liveProducts) => {
      setProducts(liveProducts);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await productService.getAllProducts();
    setProducts(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await productService.deleteProduct(deleteTarget.id);
    setDeleteTarget(null);
    loadProducts();
  };

  const columns = [
    {
      header: 'Product',
      key: 'name',
      sortable: true,
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <img
            src={p.image}
            alt={p.name}
            style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 700 }}>{p.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{p.sku}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category',
      sortable: true,
      render: (p) => <span className="badge badge-primary">{p.category}</span>,
    },
    {
      header: 'Price',
      key: 'price',
      sortable: true,
      render: (p) => <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(p.price)}</strong>,
    },
    {
      header: 'Stock',
      key: 'stock',
      sortable: true,
      render: (p) => <span>{p.stock} units</span>,
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (p) => (
        <span
          className={`badge ${
            p.stock > 10
              ? 'badge-success'
              : p.stock > 0
              ? 'badge-warning'
              : 'badge-danger'
          }`}
        >
          {p.status}
        </span>
      ),
    },
    {
      header: 'Rating',
      key: 'rating',
      sortable: true,
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
          <Star size={13} fill="#f59e0b" color="#f59e0b" />
          <span>{p.rating}</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link to={`/admin/products/${p.id}/edit`} title="Edit Product">
            <Button size="sm" variant="ghost">
              <Edit size={15} />
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            style={{ color: 'var(--danger)' }}
            onClick={() => setDeleteTarget(p)}
            title="Delete Product"
          >
            <Trash2 size={15} />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loader text="Loading catalog inventory..." />;
  }

  return (
    <>
      <SEO title="Product Catalog Management" description="Inventory and SKU control in Rambo admin." />

      <div className="page-title-bar">
        <div>
          <h1 className="page-title">Products Inventory</h1>
          <p className="page-subtitle">Track stock units, pricing, product descriptions, and category tags.</p>
        </div>
        <Link to="/admin/products/new">
          <Button variant="primary" size="md" leftIcon={<Plus size={16} />}>
            Add New Product
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder="Filter products by name, category or SKU..."
        searchKeys={['name', 'category', 'sku']}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Product Deletion"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Product
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Are you sure you want to delete product <strong>{deleteTarget?.name}</strong> (SKU: {deleteTarget?.sku})? This product will be immediately removed from the customer catalog.
        </p>
      </Modal>
    </>
  );
};

export default ProductList;
