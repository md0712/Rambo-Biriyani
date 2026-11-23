import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package, Image, Hash, Upload, X } from 'lucide-react';
import SEO from '../../../components/shared/SEO';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import productService from '../../../services/productService';
import storageService from '../../../services/storageService';
import { PRODUCT_CATEGORIES } from '../../../utils/constants';
import { validateRequired, validateNumber } from '../../../utils/validators';
import { compressImage } from '../../../utils/helpers';

export const ProductCreate = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: `RMB-PRD-${Math.floor(100 + Math.random() * 900)}`,
    category: PRODUCT_CATEGORIES[0] || 'Biriyanis',
    price: '',
    originalPrice: '',
    stock: '',
    image: '',
    description: '',
    featured: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      // 1. Immediately read and compress photo from local device
      const compressedDataUrl = await compressImage(file, 800, 0.82);
      setFormData((prev) => ({ ...prev, image: compressedDataUrl }));

      // 2. Background upload to Firebase Storage if available
      storageService
        .uploadImage(file, 'products')
        .then((downloadUrl) => {
          if (downloadUrl) {
            setFormData((prev) => ({ ...prev, image: downloadUrl }));
          }
        })
        .catch((err) => {
          console.warn('[Firebase Storage upload Notice] Retaining local device image:', err.message);
        });
    } catch (err) {
      console.error('[Device Photo Error]', err);
      alert('Could not load that image file. Please choose a JPG, PNG, or WEBP photo.');
    } finally {
      setImageUploading(false);
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
      const finalImage = formData.image || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600';
      await productService.createProduct({
        ...formData,
        image: finalImage,
      });
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
              placeholder="e.g. Special Dum Chicken Biriyani"
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

          {/* Device Photo Upload Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Product Photo (Upload from Device)
            </label>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Photo Preview */}
              {formData.image ? (
                <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px solid var(--primary-500)', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                  <img
                    src={formData.image}
                    alt="Product preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, image: '' }));
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(0,0,0,0.7)',
                      border: 'none',
                      borderRadius: '50%',
                      color: '#fff',
                      width: '22px',
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title="Remove photo"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : null}

              {/* Upload Button */}
              <div style={{ flex: 1, minWidth: '220px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.65rem',
                    padding: '0.85rem 1.25rem',
                    border: '2px dashed var(--border-medium)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    background: 'var(--bg-tertiary)',
                    transition: 'all 0.2s',
                  }}
                >
                  <Upload size={18} color="var(--primary-500)" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {imageUploading ? 'Processing photo...' : 'Choose Photo From My Device'}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageFileChange}
                  />
                </label>
              </div>
            </div>

            {/* URL input fallback */}
            <div style={{ marginTop: '0.75rem' }}>
              <Input
                label="Or enter Image URL"
                name="image"
                placeholder="https://... or choose from your device above"
                value={formData.image.startsWith('data:') ? '(Selected photo from device)' : formData.image}
                onChange={(e) => {
                  if (!e.target.value.startsWith('(Selected')) {
                    handleChange(e);
                  }
                }}
                leftIcon={<Image size={16} />}
              />
            </div>
          </div>

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
