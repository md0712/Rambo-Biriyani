import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package, Image, Hash, Upload, X } from 'lucide-react';
import SEO from '../../../components/shared/SEO';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Loader from '../../../components/common/Loader';
import productService from '../../../services/productService';
import storageService from '../../../services/storageService';
import { compressImage } from '../../../utils/helpers';

export const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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

  const [categories, setCategories] = useState([]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      productService.getProductById(id),
      productService.getCategories(),
    ])
      .then(([productData, cats]) => {
        if (Array.isArray(cats)) {
          setCategories(cats);
        }
        setFormData({
          name: productData.name,
          sku: productData.sku,
          category: productData.category || '',
          price: productData.price,
          originalPrice: productData.originalPrice || '',
          stock: productData.stock,
          image: productData.image || '',
          description: productData.description || '',
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

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const compressedDataUrl = await compressImage(file, 800, 0.82);
      setFormData((prev) => ({ ...prev, image: compressedDataUrl }));

      storageService
        .uploadImage(file, 'products')
        .then((downloadUrl) => {
          if (downloadUrl) {
            setFormData((prev) => ({ ...prev, image: downloadUrl }));
          }
        })
        .catch((err) => {
          console.warn('[Firebase Storage upload Notice]', err.message);
        });
    } catch (err) {
      console.error('[Device Photo Error]', err);
      alert('Could not load image file. Please select a JPG, PNG, or WEBP photo.');
    } finally {
      setImageUploading(false);
    }
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
            {categories.length > 0 && !isCustomCategory ? (
              <Input
                type="select"
                label="Category"
                name="category"
                value={formData.category}
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    setIsCustomCategory(true);
                  } else {
                    handleChange(e);
                  }
                }}
                options={[
                  ...categories.map((c) => ({ value: c.name, label: c.name })),
                  { value: '__NEW__', label: '+ Type custom category...' },
                ]}
              />
            ) : (
              <Input
                label="Category"
                name="category"
                placeholder="e.g. Biriyanis"
                required
                value={formData.category}
                onChange={handleChange}
                helperText={
                  categories.length > 0 ? (
                    <span
                      style={{ color: 'var(--primary-600)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.75rem' }}
                      onClick={() => setIsCustomCategory(false)}
                    >
                      Choose existing category
                    </span>
                  ) : (
                    'Type category name for this product'
                  )
                }
              />
            )}

            <Input
              label="Price (₹)"
              name="price"
              type="number"
              step="1"
              required
              value={formData.price}
              onChange={handleChange}
              leftIcon={<span style={{ fontWeight: 700, fontSize: '0.9rem' }}>₹</span>}
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
            label="Original Price (₹)"
            name="originalPrice"
            type="number"
            step="1"
            value={formData.originalPrice}
            onChange={handleChange}
            leftIcon={<span style={{ fontWeight: 700, fontSize: '0.9rem' }}>₹</span>}
          />

          {/* Device Photo Upload Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Product Photo (Upload from Device)
            </label>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
