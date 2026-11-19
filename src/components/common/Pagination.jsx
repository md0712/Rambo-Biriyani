import React from 'react';
import Button from './Button';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  pageSize = 10,
  onPageSizeChange,
}) => {
  if (totalPages <= 1 && totalItems <= pageSize) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1rem 0',
        width: '100%',
      }}
    >
      {/* Summary */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        {totalItems > 0 ? (
          <>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{startItem}</strong> to{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{endItem}</strong> of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{totalItems}</strong> entries
          </>
        ) : (
          `Page ${currentPage} of ${totalPages}`
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>

        {pages.map((p, idx) =>
          p === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              style={{ padding: '0 0.5rem', color: 'var(--text-muted)' }}
            >
              ...
            </span>
          ) : (
            <button
              key={`page-${p}`}
              onClick={() => onPageChange(p)}
              style={{
                minWidth: '32px',
                height: '32px',
                padding: '0 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: p === currentPage ? 'none' : '1px solid var(--border-light)',
                backgroundColor: p === currentPage ? 'var(--primary-600)' : 'transparent',
                color: p === currentPage ? '#ffffff' : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {p}
            </button>
          )
        )}

        <Button
          size="sm"
          variant="outline"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
