import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package, Image, Hash } from 'lucide-react';
import SEO from '../../../components/shared/SEO';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import productService from '../../../services/productService';
import { PRODUCT_CATEGORIES } from '../../../utils/constants';
import { validateRequired, validateNumber } from '../../../utils/validators';

export const ProductCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    sku: `RMB-PRD-${Math.floor(100 + Math.random() * 900)}`,
    category: PRODUCT_CATEGORIES[0] || 'Biriyanis',
    price: '',
    originalPrice: '',
    stock: '',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600',
    description: '',
    featured: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const newErrors = {};

    const nameErr = validateRequired(formData.name, 'Product name');
    if (nameErr) newErrors.name = nameErr;

    const skuErr = validateRequired(formData.sku, 'Product SKU');
    if (skuErr) newErrors.sku = skuErr;

    const priceErr = validateNumber(formData.price, 'Price', 0.01);
    if (priceErr) newErrors.price = priceErr;

    const stockErr = validateNumber(formData.stock, 'Stock units', 0);
    if (stockErr) newErrors.stock = stockErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await productService.createProduct(formData);
      navigate('/admin/products');
    } catch (err) {
      console.error('[ProductCreate Submit Error]', err);
      setSubmitError(err.message || 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Add New Product" description="Publish a new product SKU into the catalog." />

      <div className="page-title-bar">
        <div>
          <Link to="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={14} /> Back to Inventory
          </Link>
          <h1 className="page-title">Add New Product</h1>
          <p className="page-subtitle">Publish a new SKU into the digital catalog and distribution center.</p>
        </div>
      </div>

      <div style={{ maxWidth: '750px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        {submitError && (
          <div style={{ padding: '0.85rem 1rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <Input
              label="Product Title"
              name="name"
              placeholder="e.g. Chicken Dum Biriyani (Single)"
              required
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              leftIcon={<Package size={16} />}
            />
            <Input
              label="Stock Keeping Unit (SKU)"
              name="sku"
              required
              value={formData.sku}
              onChange={handleChange}
              error={errors.sku}
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
              label="Selling Price (₹)"
              name="price"
              type="number"
              step="1"
              placeholder="220"
              required
              value={formData.price}
              onChange={handleChange}
              error={errors.price}
              leftIcon={<span style={{ fontWeight: 700, fontSize: '0.9rem' }}>₹</span>}
            />

            <Input
              label="Inventory Units"
              name="stock"
              type="number"
              placeholder="50"
              required
              value={formData.stock}
              onChange={handleChange}
              error={errors.stock}
            />
          </div>

          <Input
            label="Original / Compare Price (₹)"
            name="originalPrice"
            type="number"
            step="1"
            placeholder="250"
            value={formData.originalPrice}
            onChange={handleChange}
            helperText="Optional: used to display discount badges on the storefront."
            leftIcon={<span style={{ fontWeight: 700, fontSize: '0.9rem' }}>₹</span>}
          />

          <Input
            label="Primary Image URL"
            name="image"
            placeholder="https://images.unsplash.com/..."
            value={formData.image}
            onChange={handleChange}
            leftIcon={<Image size={16} />}
          />

          <Input
            type="textarea"
            label="Product Description"
            name="description"
            rows={4}
            placeholder="Aromatic spices, slow-cooked firewood dum..."
            value={formData.description}
            onChange={handleChange}
          />

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
              />
              <span>Highlight this product on the Homepage Featured Carousel</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Link to="/admin/products">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" isLoading={loading} leftIcon={<Save size={16} />}>
              Publish Product SKU
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProductCreate;
