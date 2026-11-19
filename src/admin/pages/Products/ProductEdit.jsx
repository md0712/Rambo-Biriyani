import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package, DollarSign, Image, Hash } from 'lucide-react';
import SEO from '../../../components/shared/SEO';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Loader from '../../../components/common/Loader';
import productService from '../../../services/productService';
import { PRODUCT_CATEGORIES } from '../../../utils/constants';

export const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: '',
    image: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    productService
      .getProductById(id)
      .then((data) => {
        setFormData({
          name: data.name,
          sku: data.sku,
          category: data.category,
          price: data.price,
          originalPrice: data.originalPrice || '',
          stock: data.stock,
          image: data.image,
          description: data.description || '',
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await productService.updateProduct(id, formData);
      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Retrieving product information..." />;

  return (
    <>
      <SEO title="Edit Product" description="Update product SKU information." />

      <div className="page-title-bar">
        <div>
          <Link to="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={14} /> Back to Products
          </Link>
          <h1 className="page-title">Edit Product Details</h1>
          <p className="page-subtitle">Update pricing, inventory levels, category classification, and assets.</p>
        </div>
      </div>

      <div style={{ maxWidth: '750px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        {error && (
          <div style={{ padding: '0.85rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <Input
              label="Product Title"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              leftIcon={<Package size={16} />}
            />
            <Input
              label="SKU"
              name="sku"
              required
              value={formData.sku}
              onChange={handleChange}
              leftIcon={<Hash size={16} />}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <Input
              type="select"
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />

            <Input
              label="Price ($)"
              name="price"
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={handleChange}
              leftIcon={<DollarSign size={16} />}
            />

            <Input
              label="Stock Units"
              name="stock"
              type="number"
              required
              value={formData.stock}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Original Price ($)"
            name="originalPrice"
            type="number"
            step="0.01"
            value={formData.originalPrice}
            onChange={handleChange}
            leftIcon={<DollarSign size={16} />}
          />

          <Input
            label="Product Image URL"
            name="image"
            value={formData.image}
            onChange={handleChange}
            leftIcon={<Image size={16} />}
          />

          <Input
            type="textarea"
            label="Product Description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Link to="/admin/products">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" isLoading={saving} leftIcon={<Save size={16} />}>
              Save Product Changes
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProductEdit;
