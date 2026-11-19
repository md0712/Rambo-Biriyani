import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import Pagination from '../../components/common/Pagination';

export const DataTable = ({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  actions = null,
  emptyMessage = 'No records found',
  pageSize = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);

  // Filter
  const filteredData = data.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    if (searchKeys.length > 0) {
      return searchKeys.some((k) => String(item[k] || '').toLowerCase().includes(q));
    }
    return Object.values(item).some((val) =>
      typeof val === 'string' || typeof val === 'number'
        ? String(val).toLowerCase().includes(q)
        : false
    );
  });

  // Sort
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    return sortOrder === 'asc'
      ? String(valA || '').localeCompare(String(valB || ''))
      : String(valB || '').localeCompare(String(valA || ''));
  });

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="table-card">
      {(searchable || actions) && (
        <div className="table-toolbar">
          {searchable ? (
            <div style={{ position: 'relative', width: '280px' }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="table-search-input"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                  borderRadius: '9999px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none',
                  color: '#0f172a',
                  minHeight: '42px',
                }}
              />
            </div>
          ) : <div />}

          {actions && <div>{actions}</div>}
        </div>
      )}

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{ cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>{col.header}</span>
                    {col.sortable && sortKey === col.key && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row.id || idx}>
                  {columns.map((col) => (
                    <td key={col.key || col.header}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '0 1.5rem' }}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredData.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};

export default DataTable;
