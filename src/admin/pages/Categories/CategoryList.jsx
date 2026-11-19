import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FolderTree, Tag } from 'lucide-react';
import SEO from '../../../components/shared/SEO';
import DataTable from '../../components/DataTable';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Loader from '../../../components/common/Loader';
import productService from '../../../services/productService';

export const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const data = await productService.getCategories();
    setCategories(data);
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) {
      setError('Category name is required');
      return;
    }

    await productService.createCategory(newCat);
    setNewCat({ name: '', description: '' });
    setError('');
    setModalOpen(false);
    loadCategories();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await productService.deleteCategory(id);
      loadCategories();
    }
  };

  const columns = [
    {
      header: 'Category Name',
      key: 'name',
      sortable: true,
      render: (c) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderTree size={16} />
          </div>
          <div>
            <strong style={{ fontSize: '0.95rem' }}>{c.name}</strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/{c.slug}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Description',
      key: 'description',
      render: (c) => <span style={{ color: 'var(--text-secondary)' }}>{c.description || 'No description'}</span>,
    },
    {
      header: 'Assigned Products',
      key: 'productsCount',
      sortable: true,
      render: (c) => <span className="badge badge-primary">{c.productsCount} items</span>,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (c) => (
        <Button
          size="sm"
          variant="ghost"
          style={{ color: 'var(--danger)' }}
          onClick={() => handleDelete(c.id)}
          title="Delete Category"
        >
          <Trash2 size={15} />
        </Button>
      ),
    },
  ];

  if (loading) return <Loader text="Loading product taxonomy..." />;

  return (
    <>
      <SEO title="Categories Management" description="Organize products into hierarchical taxonomies." />

      <div className="page-title-bar">
        <div>
          <h1 className="page-title">Taxonomy & Categories</h1>
          <p className="page-subtitle">Structure your product catalog into intuitive shopper collections.</p>
        </div>
        <Button variant="primary" size="md" leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Create Category
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        searchPlaceholder="Filter categories by name or slug..."
        searchKeys={['name', 'slug', 'description']}
      />

      {/* Create Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Category"
        subtitle="Group your SKUs into a cohesive merchandise group"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              Save Category
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate}>
          <Input
            label="Category Name"
            name="name"
            placeholder="e.g. Smart Home & Robotics"
            required
            value={newCat.name}
            onChange={(e) => {
              setNewCat({ ...newCat, name: e.target.value });
              if (error) setError('');
            }}
            error={error}
          />
          <Input
            type="textarea"
            label="Description"
            name="description"
            rows={3}
            placeholder="Summary for internal categorization and SEO landing pages..."
            value={newCat.description}
            onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
          />
        </form>
      </Modal>
    </>
  );
};

export default CategoryList;
