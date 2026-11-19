import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Mic,
  SlidersHorizontal,
  ArrowUpDown,
  Flame,
  CheckCircle2,
  ArrowUpRight,
  Eye,
  X,
  Check,
  Star,
} from 'lucide-react';
import SEO from '../../components/shared/SEO';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import productService from '../../services/productService';
import { formatCurrency } from '../../utils/helpers';

export const Products = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'All';
  const isBestsellerView =
    searchParams.get('type') === 'bestseller' ||
    searchParams.get('mode') === 'bestseller';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [sortBy, setSortBy] = useState('featured');
  const [sortOpen, setSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const sortRef = useRef(null);

  // Sync category changes from URL params
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Close sort menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy]);

  const loadProducts = async () => {
    setLoading(true);
    const categoryFilter =
      selectedCategory === 'All'
        ? undefined
        : selectedCategory === 'Biryanis'
        ? 'Biriyanis'
        : selectedCategory;

    const filters = {
      category: categoryFilter,
      sortBy: sortBy === 'featured' ? undefined : sortBy,
    };
    const data = await productService.getAllProducts(filters);
    setProducts(data);
    setLoading(false);
  };

  const categories = [
    { id: 'All', name: 'All', icon: '🍽️' },
    { id: 'Biriyanis', name: 'Biriyanis', icon: '🍛' },
    { id: 'Add Ons', name: 'Add Ons', icon: '🥗' },
    { id: 'Combos', name: 'Combos', icon: '🍱' },
    { id: 'Beverages', name: 'Beverages', icon: '🥤' },
    { id: 'Desserts', name: 'Desserts', icon: '🍰' },
  ];

  const sortOptions = [
    { id: 'featured', label: 'Best Sellers First' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'rating', label: 'Highest Rated' },
  ];

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
    if (catId === 'All') {
      searchParams.delete('category');
      searchParams.delete('type');
      setSearchParams(searchParams);
    } else {
      const next = { category: catId };
      if (isBestsellerView && catId === 'Biriyanis') {
        next.type = 'bestseller';
      }
      setSearchParams(next);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <SEO
        title="Explore Menu - Complete Food Menu"
        description="Explore Rambo Biriyani's legendary dum biriyanis, sides, combos, beverages, and authentic desserts."
      />

      <div className="menu-page-wrapper">
        <div className="menu-container">
          {/* 1. EXPLORE MENU HEADER */}
          <div className="explore-header">
            <div className="explore-header-left">
              <h1 className="explore-title">Explore Menu</h1>
              <p className="explore-subtitle">Find your favourite food</p>
            </div>

            <button
              type="button"
              onClick={() => setSortOpen(!sortOpen)}
              className="filter-toggle-btn"
              title="Filter &amp; Sort options"
              aria-label="Filter &amp; Sort options"
            >
              <SlidersHorizontal size={19} color="#FFFFFF" />
            </button>
          </div>

          {/* 2. SEARCH BAR WITH MIC */}
          <div className="search-bar-wrap">
            <Search size={19} className="search-icon-left" />
            <input
              type="text"
              className="search-input-field"
              placeholder="Search dishes, biryani, combos..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Search dishes"
            />
            {search ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
                className="search-action-btn"
                title="Clear Search"
                aria-label="Clear Search"
              >
                <X size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="search-action-btn"
                title="Voice Search"
                aria-label="Voice Search"
                onClick={() => {}}
              >
                <Mic size={18} />
              </button>
            )}
          </div>

          {/* 3. POPULAR CATEGORIES SECTION */}
          <div className="categories-section">
            <div className="categories-header-row">
              <h2 className="categories-heading">Popular Categories</h2>
              <button
                type="button"
                onClick={() => handleCategorySelect('All')}
                className="view-all-link"
              >
                View all &rarr;
              </button>
            </div>

            {/* Category Cards (2 Rows × 3 Columns matching reference) */}
            <div className="categories-grid">
              {categories.map((cat) => {
                const isSelected =
                  selectedCategory === cat.id ||
                  (cat.id === 'Biriyanis' && selectedCategory === 'Biryanis');

                return (
                  <div
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`category-card ${isSelected ? 'category-card-selected' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCategorySelect(cat.id);
                      }
                    }}
                  >
                    <span className="category-card-icon">{cat.icon}</span>
                    <span className="category-card-title">{cat.name}</span>
                    {isSelected && (
                      <span className="category-selected-pill">Selected</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. ALL DISHES HEADER ROW WITH SORT BUTTON */}
          <div className="dishes-header-row">
            <div className="dishes-header-left">
              <h2 className="dishes-heading">
                {isBestsellerView
                  ? 'Best Sellers • Trending Biriyanis'
                  : selectedCategory === 'All'
                  ? 'All Dishes'
                  : `${selectedCategory}`}
              </h2>
              <p className="dishes-subtitle">
                {isBestsellerView
                  ? 'Wood-fired dum biriyanis highly ordered by food warriors'
                  : 'Order online authentic wood-fired dum meals'}
              </p>
            </div>

            {/* Sort Dropdown Anchor */}
            <div className="sort-anchor" ref={sortRef}>
              <button
                type="button"
                onClick={() => setSortOpen(!sortOpen)}
                className="sort-trigger-btn"
                aria-expanded={sortOpen}
                aria-label="Sort dishes"
              >
                <ArrowUpDown size={15} color="#E51E25" strokeWidth={2.5} />
                <span>Sort</span>
              </button>

              {sortOpen && (
                <div className="sort-dropdown-menu">
                  <div className="sort-dropdown-header">Sort Dishes By</div>
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.id);
                        setSortOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`sort-option-item ${sortBy === opt.id ? 'sort-option-active' : ''}`}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.id && <Check size={14} color="#E51E25" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 5. FOOD DISHES CARDS GRID */}
          {loading ? (
            <div className="menu-loading-box">
              <Loader text="Opening fresh dum handis..." />
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="no-results-box">
              <Flame size={44} color="#E51E25" style={{ margin: '0 auto 12px' }} />
              <h3 className="no-results-title">No items match your search</h3>
              <p className="no-results-desc">
                Try searching for "Chicken", "Mutton", "Desserts" or "Combos".
              </p>
            </div>
          ) : (
            <>
              <div
                className={`dishes-cards-grid ${
                  isBestsellerView ? 'bestseller-grid-layout' : 'miy-grid-layout'
                }`}
              >
                {paginatedProducts.map((p, pIdx) => {
                  const tag =
                    p.heroTag ||
                    `0${pIdx} / ${p.category?.toUpperCase() || 'SPECIAL'}`;
                  const isHighlighted =
                    p.highlighted || (currentPage === 1 && pIdx === 1);

                  // ORDER ONLINE: "MAKE IT YOURS" Card Design (Matching uploaded reference image)
                  if (!isBestsellerView) {
                    return (
                      <div
                        key={`${p.id}-${pIdx}`}
                        className={`make-it-yours-card ${
                          isHighlighted ? 'card-highlighted-red' : ''
                        }`}
                        onClick={() => navigate(`/products/${p.id}`)}
                        role="button"
                        tabIndex={0}
                        title={`View ${p.name} details`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/products/${p.id}`);
                          }
                        }}
                      >
                        {/* Top Food Image Box with Preview Eye Button */}
                        <div className="miy-img-wrap">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="miy-img"
                            loading="lazy"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/products/${p.id}`);
                            }}
                            className="miy-preview-btn"
                            title="View Details"
                            aria-label={`View details of ${p.name}`}
                          >
                            <Eye size={15} />
                          </button>
                        </div>

                        {/* Content Body */}
                        <div className="miy-body">
                          <div className="miy-tag">{tag}</div>

                          <h3 className="miy-title">{p.name}</h3>

                          <p className="miy-desc">{p.description}</p>

                          <div className="miy-divider" />

                          <div className="miy-footer">
                            <div className="miy-cta-label">
                              <span>MAKE IT YOURS</span>
                              <span className="miy-price">
                                {formatCurrency(p.price)}
                              </span>
                            </div>
                            <div className="miy-arrow">
                              <ArrowUpRight size={18} strokeWidth={2.4} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // BEST SELLERS: 2-Column Swiggy/Trending Card Design
                  const nameLower = p.name.toLowerCase();
                  const catLower = (p.category || '').toLowerCase();

                  const isEgg = p.dietary === 'egg' || nameLower.includes('egg');
                  const isVeg =
                    p.dietary === 'veg' ||
                    catLower === 'desserts' ||
                    catLower === 'beverages' ||
                    nameLower.includes('veg') ||
                    nameLower.includes('kushka') ||
                    nameLower.includes('paneer') ||
                    nameLower.includes('gobi') ||
                    nameLower.includes('lime') ||
                    nameLower.includes('jamun');

                  const isBestseller =
                    p.bestseller ||
                    p.featured ||
                    nameLower.includes('egg') ||
                    nameLower.includes('chicken 65') ||
                    nameLower.includes('special') ||
                    pIdx === 1 ||
                    pIdx === 3;

                  const isTrending =
                    p.highlyOrdered !== false &&
                    (p.highlyOrdered || p.rating >= 4.8 || pIdx % 2 === 0);

                  const portionText =
                    p.portion ||
                    (isEgg
                      ? '1 Person'
                      : nameLower.includes('kushka')
                      ? 'without egg'
                      : '1 Person');

                  return (
                    <div
                      key={`${p.id}-${pIdx}`}
                      className="dish-food-card"
                      onClick={() => navigate(`/products/${p.id}`)}
                      role="button"
                      tabIndex={0}
                      title={`View ${p.name} details`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/products/${p.id}`);
                        }
                      }}
                    >
                      {/* Main Horizontal Section (Left Info + Right Image) */}
                      <div className="dish-food-main">
                        <div className="dish-food-info">
                          {/* Badges Row */}
                          <div className="dish-badges-row">
                            <span
                              className={`dietary-symbol-box ${
                                isVeg ? 'is-veg' : isEgg ? 'is-egg' : 'is-nonveg'
                              }`}
                              title={
                                isVeg
                                  ? 'Vegetarian'
                                  : isEgg
                                  ? 'Contains Egg'
                                  : 'Non-Vegetarian'
                              }
                            >
                              <span className="dietary-symbol-inner" />
                            </span>

                            {isBestseller && (
                              <span className="bestseller-badge">Bestseller</span>
                            )}
                          </div>

                          {/* Trending / Highly Ordered Row */}
                          {isTrending && (
                            <div className="trending-order-tag">
                              <ArrowUpRight
                                size={14}
                                strokeWidth={2.8}
                                className="trending-arrow-icon"
                              />
                              <span>Highly Ordered</span>
                            </div>
                          )}

                          {/* Dish Title */}
                          <h3 className="dish-food-title">{p.name}</h3>

                          {/* Dish Price */}
                          <div className="dish-food-price">
                            {formatCurrency(p.price)}
                          </div>

                          {/* Rating Stars */}
                          <div className="dish-food-rating">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={`star-icon ${
                                  i < Math.round(p.rating || 5)
                                    ? 'star-filled'
                                    : 'star-muted'
                                }`}
                                fill={
                                  i < Math.round(p.rating || 5)
                                    ? '#F59E0B'
                                    : 'none'
                                }
                              />
                            ))}
                          </div>

                          {/* Portion Subtitle */}
                          <div className="dish-food-portion">{portionText}</div>
                        </div>

                        {/* Right Food Dish Image */}
                        <div className="dish-food-thumb-wrap">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="dish-food-thumb"
                            loading="lazy"
                          />
                        </div>
                      </div>

                      {/* Bottom Full-Width Availability / Order Bar */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/products/${p.id}`);
                        }}
                        className="dish-food-bottom-btn"
                        title={`View ${p.name}`}
                      >
                        <span className="bottom-btn-text">
                          Next available at 11:00 am
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>

              <p className="menu-disclaimer-note">
                Menu availability and pricing may vary. Contact us for today's special dum handis.
              </p>

              {/* 6. PAGINATION */}
              <div className="pagination-wrap">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredProducts.length}
                  pageSize={pageSize}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        /* Master Theme Variables */
        :root {
          --rambo-bg: #090706;
          --rambo-card-bg: #171310;
          --rambo-primary: #E51E25;
          --rambo-gold: #C5A16A;
          --rambo-text: #FFFFFF;
          --rambo-border: #33251B;
        }

        /* Menu Page Wrapper - Smooth Native Touch Scrolling & Zero Horizontal Overflow */
        .menu-page-wrapper {
          background-color: var(--rambo-bg);
          min-height: 100vh;
          color: var(--rambo-text);
          padding: 24px 0 60px;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          width: 100%;
          max-width: 100vw;
          overflow-x: clip;
          overflow-y: visible;
          touch-action: pan-y;
          -webkit-overflow-scrolling: touch;
          box-sizing: border-box;
        }

        /* Custom Selection Highlight */
        .menu-page-wrapper ::selection {
          background-color: var(--rambo-primary);
          color: #FFFFFF;
        }

        .menu-page-wrapper ::-moz-selection {
          background-color: var(--rambo-primary);
          color: #FFFFFF;
        }

        /* Text Highlighting & Selection Allowed on All Informational Content */
        .explore-title,
        .explore-subtitle,
        .categories-heading,
        .dishes-heading,
        .dishes-subtitle,
        .category-card-title,
        .dish-card-tag,
        .dish-card-name,
        .dish-card-desc,
        .card-cta-price,
        .menu-disclaimer-note,
        .no-results-title,
        .no-results-desc {
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
          -webkit-touch-callout: default;
        }

        /* Interactive Controls: Prevent Blue Tap Flash & Accidental Text Selection */
        button,
        .filter-toggle-btn,
        .search-action-btn,
        .category-card,
        .sort-trigger-btn,
        .sort-option-item,
        .dish-card-preview-btn,
        .dish-card-item {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        /* Container - Flexible & Box Sized */
        .menu-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 20px;
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
        }

        /* 1. Explore Menu Header */
        .explore-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .explore-header-left {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .explore-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0 0 4px;
          line-height: 1.2;
        }

        .explore-subtitle {
          font-size: 0.92rem;
          color: #9ca3af;
          margin: 0;
        }

        .filter-toggle-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background-color: var(--rambo-card-bg);
          border: 1px solid var(--rambo-border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.15s ease, border-color 0.15s ease;
          flex-shrink: 0;
        }

        .filter-toggle-btn:hover {
          background-color: #241916;
          border-color: var(--rambo-primary);
        }

        /* 2. Search Bar with Mic */
        .search-bar-wrap {
          position: relative;
          width: 100%;
          margin-bottom: 24px;
          box-sizing: border-box;
        }

        .search-icon-left {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .search-input-field {
          width: 100%;
          height: 50px;
          padding: 0 48px 0 48px;
          border-radius: 14px;
          border: 1px solid var(--rambo-border);
          background-color: #140e0c;
          color: #FFFFFF;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.15s ease, background-color 0.15s ease;
          box-sizing: border-box;
        }

        .search-input-field:focus {
          border-color: var(--rambo-primary);
          background-color: #1a1210;
        }

        .search-input-field::placeholder {
          color: #6b7280;
        }

        .search-action-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: 50%;
          transition: color 0.15s ease;
        }

        .search-action-btn:hover {
          color: #FFFFFF;
        }

        /* 3. Popular Categories Section */
        .categories-section {
          margin-bottom: 28px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .categories-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .categories-heading {
          font-size: 1.25rem;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0;
        }

        .view-all-link {
          background: none;
          border: none;
          color: var(--rambo-primary);
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.15s ease;
          padding: 4px;
        }

        .view-all-link:hover {
          opacity: 0.85;
        }

        /* 3-Column × 2-Row Category Grid */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .category-card {
          background-color: var(--rambo-card-bg);
          border: 1px solid var(--rambo-border);
          border-radius: 14px;
          padding: 16px 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 6px;
          min-height: 94px;
          transition: all 0.15s ease;
          box-sizing: border-box;
          position: relative;
        }

        .category-card:hover {
          background-color: #201715;
          border-color: rgba(229, 30, 37, 0.4);
        }

        .category-card-selected {
          border: 1.5px solid var(--rambo-primary) !important;
          background: linear-gradient(180deg, #251614 0%, #19100e 100%) !important;
          box-shadow: 0 4px 18px rgba(229, 30, 37, 0.25);
        }

        .category-card-icon {
          font-size: 1.65rem;
          line-height: 1;
          display: block;
        }

        .category-card-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #FFFFFF;
          line-height: 1.2;
        }

        .category-selected-pill {
          font-size: 0.68rem;
          font-weight: 800;
          color: #ff4d4f;
          background-color: rgba(229, 30, 37, 0.18);
          padding: 2px 8px;
          border-radius: 10px;
          letter-spacing: 0.02em;
          margin-top: 2px;
        }

        /* 4. All Dishes Header & Sort */
        .dishes-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          padding-top: 10px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          position: relative;
        }

        .dishes-header-left {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .dishes-heading {
          font-size: 1.25rem;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0 0 2px;
        }

        .dishes-subtitle {
          font-size: 0.85rem;
          color: #9ca3af;
          margin: 0;
        }

        .sort-anchor {
          position: relative;
        }

        .sort-trigger-btn {
          height: 38px;
          padding: 0 14px;
          border-radius: 20px;
          background-color: var(--rambo-card-bg);
          border: 1px solid var(--rambo-border);
          color: #FFFFFF;
          font-size: 0.88rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background-color 0.15s ease, border-color 0.15s ease;
        }

        .sort-trigger-btn:hover {
          background-color: #241916;
          border-color: var(--rambo-primary);
        }

        .sort-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          z-index: 200;
          background-color: #171210;
          border: 1px solid var(--rambo-border);
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.85);
          width: 210px;
          padding: 6px 0;
          animation: sortFade 0.15s ease-out;
        }

        @keyframes sortFade {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .sort-dropdown-header {
          font-size: 0.72rem;
          font-weight: 800;
          color: #9ca3af;
          padding: 6px 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          margin-bottom: 4px;
        }

        .sort-option-item {
          width: 100%;
          text-align: left;
          padding: 8px 14px;
          background: transparent;
          border: none;
          color: #e5e7eb;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background-color 0.12s ease;
        }

        .sort-option-item:hover {
          background-color: #241816;
          color: #FFFFFF;
        }

        .sort-option-active {
          color: var(--rambo-primary) !important;
          font-weight: 800;
          background-color: rgba(229, 30, 37, 0.08);
        }

        /* 5. Dishes Cards Grids */
        .dishes-cards-grid {
          display: grid;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          margin-bottom: 24px;
        }

        .dishes-cards-grid.bestseller-grid-layout {
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .dishes-cards-grid.miy-grid-layout {
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        /* ORDER ONLINE: "MAKE IT YOURS" Card Design (Matching uploaded reference) */
        .make-it-yours-card {
          background-color: var(--rambo-card-bg);
          border: 1px solid var(--rambo-border);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          position: relative;
        }

        .make-it-yours-card:hover {
          transform: translateY(-3px);
          border-color: var(--rambo-primary);
          box-shadow: 0 8px 24px rgba(229, 30, 37, 0.22);
        }

        .make-it-yours-card.card-highlighted-red {
          border: 1.5px solid var(--rambo-primary) !important;
          box-shadow: 0 4px 18px rgba(229, 30, 37, 0.25);
        }

        .miy-img-wrap {
          position: relative;
          width: 100%;
          height: 185px;
          overflow: hidden;
          background-color: #120c0b;
        }

        .miy-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        .make-it-yours-card:hover .miy-img {
          transform: scale(1.05);
        }

        .miy-preview-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: rgba(20, 16, 14, 0.85);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.15s ease;
          z-index: 2;
        }

        .miy-preview-btn:hover {
          background-color: var(--rambo-primary);
        }

        .miy-body {
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
          box-sizing: border-box;
        }

        .miy-tag {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--rambo-gold);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .miy-title {
          font-family: 'Bebas Neue', 'Anton', 'Montserrat', sans-serif;
          font-size: 1.55rem;
          font-weight: 900;
          letter-spacing: 0.04em;
          color: #FFFFFF;
          text-transform: uppercase;
          line-height: 1.15;
          margin: 0 0 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .miy-desc {
          font-size: 0.85rem;
          color: #9ca3af;
          line-height: 1.45;
          margin: 0 0 14px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .miy-divider {
          width: 100%;
          height: 1px;
          background-color: var(--rambo-border);
          margin-top: auto;
          margin-bottom: 12px;
        }

        .miy-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .miy-cta-label {
          display: flex;
          align-items: baseline;
          gap: 8px;
          font-size: 0.75rem;
          font-weight: 800;
          color: #9ca3af;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .miy-price {
          font-size: 1.18rem;
          font-weight: 900;
          color: #FFFFFF;
        }

        .miy-arrow {
          color: var(--rambo-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease, color 0.15s ease;
        }

        .make-it-yours-card:hover .miy-arrow {
          transform: translate(2px, -2px);
          color: var(--rambo-primary);
        }

        /* BEST SELLERS: 2-Column Food Dish Cards */

        .dish-food-card {
          background-color: var(--rambo-card-bg);
          border: 1px solid var(--rambo-border);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 12px;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          position: relative;
        }

        .dish-food-card:hover {
          transform: translateY(-2px);
          border-color: var(--rambo-primary);
          box-shadow: 0 8px 24px rgba(229, 30, 37, 0.2);
        }

        .dish-food-main {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .dish-food-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .dish-badges-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        /* Dietary Symbol (Veg green, Egg amber, Non-Veg red) */
        .dietary-symbol-box {
          width: 17px;
          height: 17px;
          border-radius: 3px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          flex-shrink: 0;
        }

        .dietary-symbol-box.is-veg {
          border: 1.5px solid #16a34a;
        }
        .dietary-symbol-box.is-veg .dietary-symbol-inner {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #16a34a;
        }

        .dietary-symbol-box.is-egg {
          border: 1.5px solid #d97706;
        }
        .dietary-symbol-box.is-egg .dietary-symbol-inner {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #d97706;
        }

        .dietary-symbol-box.is-nonveg {
          border: 1.5px solid #dc2626;
        }
        .dietary-symbol-box.is-nonveg .dietary-symbol-inner {
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-bottom: 7px solid #dc2626;
          border-radius: 1px;
        }

        /* Bestseller Badge */
        .bestseller-badge {
          background-color: #fef08a;
          color: #713f12;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 4px;
          letter-spacing: 0.02em;
          line-height: 1.2;
        }

        /* Trending / Highly Ordered Row */
        .trending-order-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #f59e0b;
          font-size: 0.78rem;
          font-weight: 700;
          margin-bottom: 3px;
        }

        .trending-arrow-icon {
          color: #f59e0b;
          flex-shrink: 0;
        }

        .dish-food-title {
          font-size: 1.12rem;
          font-weight: 800;
          color: #FFFFFF;
          line-height: 1.3;
          margin: 0 0 5px;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .dish-food-price {
          font-size: 1.18rem;
          font-weight: 900;
          color: #FFFFFF;
          margin-bottom: 5px;
        }

        .dish-food-rating {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #F59E0B;
          margin-bottom: 5px;
        }

        .star-icon {
          flex-shrink: 0;
        }
        .star-filled {
          color: #F59E0B;
        }
        .star-muted {
          color: #4b5563;
        }

        .dish-food-portion {
          font-size: 0.78rem;
          color: #9ca3af;
          font-weight: 600;
        }

        /* Right Food Dish Image */
        .dish-food-thumb-wrap {
          width: 110px;
          height: 110px;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid var(--rambo-border);
          background-color: #120c0b;
          flex-shrink: 0;
        }

        .dish-food-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        .dish-food-card:hover .dish-food-thumb {
          transform: scale(1.04);
        }

        /* Bottom Full-Width Rounded Button (Next available at 11:00 am) */
        .dish-food-bottom-btn {
          width: 100%;
          height: 38px;
          border-radius: 10px;
          background-color: #211614;
          border: 1px solid rgba(229, 30, 37, 0.28);
          color: #ff4d4f;
          font-size: 0.86rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-sizing: border-box;
          margin-top: 2px;
        }

        .dish-food-bottom-btn:hover {
          background-color: var(--rambo-primary);
          color: #FFFFFF;
          border-color: var(--rambo-primary);
        }

        .menu-loading-box,
        .no-results-box {
          text-align: center;
          padding: 48px 16px;
          background-color: var(--rambo-card-bg);
          border-radius: 16px;
          border: 1px solid var(--rambo-border);
        }

        .no-results-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0 0 6px;
        }

        .no-results-desc {
          font-size: 0.9rem;
          color: #9ca3af;
          margin: 0;
        }

        .menu-disclaimer-note {
          text-align: center;
          font-size: 0.8rem;
          color: #6b7280;
          margin: 16px 0 24px;
        }

        .pagination-wrap {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        /* ==========================================================================
           RESPONSIVE BREAKPOINTS (Desktop, Tablet, Mobile)
           ========================================================================== */

        /* Desktop (min-width: 1024px) */
        @media (min-width: 1024px) {
          .dishes-cards-grid.bestseller-grid-layout {
            grid-template-columns: repeat(2, 1fr);
            gap: 22px;
          }
          .dishes-cards-grid.miy-grid-layout {
            grid-template-columns: repeat(3, 1fr);
            gap: 22px;
          }
          .category-card {
            min-height: 106px;
            padding: 18px 14px;
          }
          .category-card-icon {
            font-size: 1.85rem;
          }
        }

        /* Tablet (768px to 1023px) */
        @media (min-width: 768px) and (max-width: 1023px) {
          .menu-container {
            padding: 0 16px;
          }
          .dishes-cards-grid.bestseller-grid-layout,
          .dishes-cards-grid.miy-grid-layout {
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
          }
        }

        /* Mobile Devices (max-width: 767px) */
        @media (max-width: 767px) {
          .menu-page-wrapper {
            padding: 16px 0 48px;
          }
          .menu-container {
            padding: 0 12px;
          }
          .explore-title {
            font-size: 1.45rem;
          }
          .explore-subtitle {
            font-size: 0.825rem;
          }
          .filter-toggle-btn {
            width: 38px;
            height: 38px;
          }
          .search-input-field {
            height: 46px;
            font-size: 0.88rem;
          }

          /* Categories 3 columns on mobile */
          .categories-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }
          .category-card {
            padding: 12px 6px;
            min-height: 84px;
            border-radius: 12px;
          }
          .category-card-icon {
            font-size: 1.4rem;
          }
          .category-card-title {
            font-size: 0.825rem;
          }
          .category-selected-pill {
            font-size: 0.62rem;
            padding: 1px 6px;
          }

          .dishes-cards-grid {
            grid-template-columns: 1fr !important;
            gap: 14px;
          }
          .miy-img-wrap {
            height: 165px;
          }
          .miy-title {
            font-size: 1.35rem;
          }
          .dish-food-card {
            padding: 14px;
            gap: 10px;
          }
          .dish-food-thumb-wrap {
            width: 95px;
            height: 95px;
            border-radius: 12px;
          }
          .dish-food-title {
            font-size: 1.05rem;
          }
          .dish-food-bottom-btn {
            height: 38px;
            font-size: 0.825rem;
          }
        }

        /* Ultra-compact Phones (max-width: 360px) */
        @media (max-width: 360px) {
          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }
          .category-card {
            min-height: 76px;
          }
          .category-card-title {
            font-size: 0.78rem;
          }
          .miy-img-wrap {
            height: 150px;
          }
          .miy-title {
            font-size: 1.25rem;
          }
          .dish-food-thumb-wrap {
            width: 82px;
            height: 82px;
          }
          .dish-food-title {
            font-size: 0.95rem;
          }
          .dish-food-price {
            font-size: 1.05rem;
          }
          .dish-food-bottom-btn {
            height: 36px;
            font-size: 0.78rem;
          }
        }
      `}</style>
    </>
  );
};

export default Products;
