import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Check,
  ArrowLeft,
  Heart,
  Plus,
  Minus,
  ShoppingCart,
  Flame,
} from 'lucide-react';
import SEO from '../../components/shared/SEO';
import Loader from '../../components/common/Loader';
import productService from '../../services/productService';
import { formatCurrency } from '../../utils/helpers';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedPackIndex, setSelectedPackIndex] = useState(0);
  const [addedToast, setAddedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem('rambo_cart');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const syncCart = () => {
    try {
      const raw = localStorage.getItem('rambo_cart');
      setCart(raw ? JSON.parse(raw) : []);
    } catch {
      setCart([]);
    }
  };

  useEffect(() => {
    window.addEventListener('cartUpdated', syncCart);
    return () => window.removeEventListener('cartUpdated', syncCart);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadProductData();
  }, [id]);

  const loadProductData = async () => {
    setLoading(true);
    try {
      const data = await productService.getProductById(id);
      setProduct(data);
      setSelectedImage(data.image);
      setSelectedPackIndex(0);
      setQuantity(1);

      // Fetch related items in same category
      const related = await productService.getAllProducts({ category: data.category });
      setRelatedProducts(related.filter((p) => p.id !== data.id).slice(0, 4));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090706' }}>
        <Loader text="Opening fresh dum handi..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '60vh', textAlign: 'center', padding: '5rem 1rem', background: '#090706', color: '#FFFFFF' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Product Not Found</h2>
        <p style={{ color: '#9ca3af', margin: '1rem 0 2rem' }}>The requested biriyani or side item could not be found.</p>
        <Link to="/products" className="btn-order-online" style={{ display: 'inline-flex', padding: '0.75rem 2rem' }}>
          Back to Menu
        </Link>
      </div>
    );
  }

  const basePrice = product.price || 249;
  const category = product.category || 'Biriyanis';

  const isVeg =
    category === 'Desserts' ||
    category === 'Beverages' ||
    product.name.toLowerCase().includes('veg') ||
    product.name.toLowerCase().includes('paneer') ||
    product.name.toLowerCase().includes('gobi') ||
    product.name.toLowerCase().includes('lime') ||
    product.name.toLowerCase().includes('rose milk') ||
    product.name.toLowerCase().includes('jamun') ||
    product.name.toLowerCase().includes('payasam');

  const gallery = [
    product.image || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600',
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600',
    'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600',
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600',
  ];

  // Portions with clear serving sizes
  const getPacks = () => {
    if (category === 'Biriyanis') {
      return [
        {
          id: 'pack-full',
          size: 'Full Plate',
          portionName: '1 Person Eat',
          price: basePrice,
          mrp: Math.round(basePrice * 1.2),
          discount: 17,
          image: gallery[0],
        },
        {
          id: 'pack-half',
          size: 'Half Plate',
          portionName: 'Light Meal',
          price: Math.round(basePrice * 0.6),
          mrp: Math.round(basePrice * 0.75),
          discount: 20,
          image: gallery[1] || gallery[0],
        },
        {
          id: 'pack-family',
          size: 'Family Pack',
          portionName: '2-3 Persons Eat',
          price: Math.round(basePrice * 2.0),
          mrp: Math.round(basePrice * 2.4),
          discount: 17,
          image: gallery[2] || gallery[0],
        },
      ];
    }

    if (category === 'Beverages') {
      return [
        {
          id: 'pack-regular',
          size: 'Regular',
          portionName: '1 Person Drink',
          price: basePrice,
          mrp: Math.round(basePrice * 1.2),
          discount: 17,
          image: gallery[0],
        },
        {
          id: 'pack-large',
          size: 'Large',
          portionName: '2 Persons Drink',
          price: Math.round(basePrice * 1.8),
          mrp: Math.round(basePrice * 2.2),
          discount: 18,
          image: gallery[1] || gallery[0],
        },
      ];
    }

    if (category === 'Desserts') {
      return [
        {
          id: 'pack-single',
          size: 'Single Plate',
          portionName: '1 Person Eat',
          price: basePrice,
          mrp: Math.round(basePrice * 1.2),
          discount: 17,
          image: gallery[0],
        },
        {
          id: 'pack-double',
          size: 'Double Plate',
          portionName: '2 Persons Eat',
          price: Math.round(basePrice * 1.8),
          mrp: Math.round(basePrice * 2.2),
          discount: 18,
          image: gallery[1] || gallery[0],
        },
      ];
    }

    // Default for Starters / Add Ons / Combos
    return [
      {
        id: 'pack-full',
        size: 'Full Plate',
        portionName: '1 Person Eat',
        price: basePrice,
        mrp: Math.round(basePrice * 1.2),
        discount: 17,
        image: gallery[0],
      },
      {
        id: 'pack-half',
        size: 'Half Plate',
        portionName: 'Light Meal',
        price: Math.round(basePrice * 0.6),
        mrp: Math.round(basePrice * 0.75),
        discount: 20,
        image: gallery[1] || gallery[0],
      },
      {
        id: 'pack-family',
        size: 'Family Pack',
        portionName: '2-3 Persons Eat',
        price: Math.round(basePrice * 2.0),
        mrp: Math.round(basePrice * 2.4),
        discount: 17,
        image: gallery[2] || gallery[0],
      },
    ];
  };

  const packOptions = getPacks();
  const activePack = packOptions[selectedPackIndex] || packOptions[0];
  const currentItemId = `${product.id}-${activePack.id}`;
  const existingCartItem = cart.find((c) => c.id === currentItemId);
  const currentQuantityInCart = existingCartItem ? existingCartItem.quantity : 0;

  const activeImageIndex = gallery.findIndex((img) => img === selectedImage);
  const safeActiveIndex = activeImageIndex >= 0 ? activeImageIndex : 0;

  const showToast = (msg) => {
    setToastMessage(msg);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      setToastMessage('');
    }, 2200);
  };

  const updateCartQuantity = (newQty) => {
    const safeQty = Math.max(0, Math.min(15, newQty));
    const currentCart = JSON.parse(localStorage.getItem('rambo_cart') || '[]');
    const existingIndex = currentCart.findIndex((c) => c.id === currentItemId);

    if (safeQty === 0) {
      if (existingIndex > -1) {
        currentCart.splice(existingIndex, 1);
      }
    } else {
      const itemToAdd = {
        ...product,
        id: currentItemId,
        name: `${product.name} (${activePack.size})`,
        price: activePack.price,
        selectedPack: activePack.size,
        quantity: safeQty,
      };

      if (existingIndex > -1) {
        currentCart[existingIndex].quantity = safeQty;
      } else {
        currentCart.push(itemToAdd);
      }
    }

    localStorage.setItem('rambo_cart', JSON.stringify(currentCart));
    setCart(currentCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleInitialAdd = () => {
    updateCartQuantity(1);
    showToast(`Added 1 × ${activePack.size} to Basket!`);
  };

  const handleIncreaseInCart = () => {
    if (currentQuantityInCart < 15) {
      updateCartQuantity(currentQuantityInCart + 1);
    }
  };

  const handleDecreaseInCart = () => {
    if (currentQuantityInCart > 0) {
      const next = currentQuantityInCart - 1;
      updateCartQuantity(next);
      if (next === 0) {
        showToast('Removed from Basket');
      }
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted((prev) => !prev);
    showToast(!isWishlisted ? 'Added to favorites!' : 'Removed from favorites');
  };

  return (
    <>
      <SEO
        title={`${product.name} - ${activePack.size}`}
        description={`${product.description} Order authentic wood-fired dum biriyani online from Rambo Biriyani.`}
      />

      <div className="product-page-wrapper">
        <div className="product-container">
          <div className="product-main-grid">
            {/* PRODUCT IMAGE GALLERY & THUMBNAILS */}
            <div className="product-gallery-block">
              {/* Main Food Image Box with Responsive Ratio */}
              <div className="hero-img-box">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="hero-img"
                />

                {/* Floating Back button inside image on top-left */}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="floating-action-btn back-btn"
                  title="Back"
                  aria-label="Back"
                >
                  <ArrowLeft size={18} strokeWidth={2.5} />
                </button>

                {/* Floating Wishlist button inside image on top-right */}
                <button
                  type="button"
                  onClick={toggleWishlist}
                  className="floating-action-btn wishlist-btn"
                  title="Wishlist"
                  aria-label="Wishlist"
                >
                  <Heart
                    size={18}
                    strokeWidth={2.2}
                    fill={isWishlisted ? '#E51E25' : 'none'}
                    color={isWishlisted ? '#E51E25' : '#FFFFFF'}
                  />
                </button>

                {/* Dietary badge (Non-veg / Veg) inside image at bottom-left */}
                <div
                  className="dietary-badge"
                  style={{
                    borderColor: isVeg ? '#16a34a' : '#E51E25',
                  }}
                  title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                >
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: isVeg ? '50%' : '2px',
                      backgroundColor: isVeg ? '#16a34a' : '#E51E25',
                    }}
                  />
                </div>

                {/* Dot Pagination Indicator at Bottom */}
                <div className="hero-dots-indicator">
                  {gallery.map((_, idx) => (
                    <span
                      key={idx}
                      className={`dot-pill ${safeActiveIndex === idx ? 'dot-active' : ''}`}
                      onClick={() => setSelectedImage(gallery[idx])}
                      role="button"
                      tabIndex={0}
                      aria-label={`View image ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Product Thumbnails horizontally below main image */}
              <div className="thumbnails-wrapper">
                <div className="thumbnails-scroll-row">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`thumb-btn ${selectedImage === img ? 'thumb-active' : ''}`}
                      aria-label={`Thumbnail ${idx + 1}`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PRODUCT INFORMATION */}
            <div className="product-info-block">
              <h1 className="dish-title">{product.name}</h1>

              {/* Pricing line: Current price, Strikethrough MRP, Red discount badge */}
              <div className="price-row">
                <span className="current-price">{formatCurrency(activePack.price)}</span>
                <span className="mrp-price">{formatCurrency(activePack.mrp)}</span>
                <span className="discount-pill">{activePack.discount}% OFF</span>
              </div>

              {/* Product Description - Wrapped, never clipped */}
              <p className="dish-description">{product.description}</p>

              {/* Dum Authenticity Tag */}
              <div className="dum-authenticity-tag">
                <Flame size={15} color="#E51E25" />
                <span>Wood-Fired Dum Kitchen • 100% Pure Desi Ghee</span>
              </div>

              {/* Thin Divider */}
              <div className="section-divider" />

              {/* Portion Selection Section */}
              <div className="portion-section">
                <div className="portion-header">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#E51E25"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 4a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v1" />
                    <path d="M4 18h16" />
                    <path d="M4 18a8 8 0 0 1 16 0" />
                    <line x1="2" y1="20" x2="22" y2="20" />
                  </svg>
                  <span>Select Portion</span>
                </div>

                <div className="portion-cards-scroll">
                  {packOptions.map((pack, idx) => {
                    const isSelected = selectedPackIndex === idx;

                    return (
                      <div
                        key={pack.id}
                        onClick={() => setSelectedPackIndex(idx)}
                        className={`portion-card ${isSelected ? 'portion-card-selected' : ''}`}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedPackIndex(idx);
                          }
                        }}
                      >
                        {isSelected && (
                          <div className="portion-check-badge">
                            <Check size={11} strokeWidth={3.5} color="#FFFFFF" />
                          </div>
                        )}

                        <div className="portion-info-left">
                          <div className="portion-name">{pack.size}</div>
                          <div className="portion-price">{formatCurrency(pack.price)}</div>
                          <div className="portion-subtitle">{pack.portionName}</div>
                        </div>

                        <div className="portion-img-thumb">
                          <img src={pack.image} alt={pack.size} loading="lazy" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Desktop-only action area */}
              <div className="desktop-action-bar">
                {currentQuantityInCart === 0 ? (
                  <button
                    type="button"
                    onClick={handleInitialAdd}
                    className="add-to-basket-btn add-to-basket-full"
                  >
                    <ShoppingCart size={20} />
                    <span>Add to Basket • {formatCurrency(activePack.price)}</span>
                  </button>
                ) : (
                  <div className="active-basket-row">
                    <div className="stepper-wrap">
                      <button
                        type="button"
                        onClick={handleDecreaseInCart}
                        className="stepper-circle-btn"
                        title="Decrease quantity"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={18} strokeWidth={2.5} />
                      </button>

                      <span className="stepper-count">{currentQuantityInCart}</span>

                      <button
                        type="button"
                        onClick={handleIncreaseInCart}
                        disabled={currentQuantityInCart >= 15}
                        className="stepper-circle-btn"
                        title="Increase quantity (Max 15)"
                        aria-label="Increase quantity"
                      >
                        <Plus size={18} strokeWidth={2.5} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate('/cart')}
                      className="view-basket-btn"
                      title="View Basket"
                    >
                      <ShoppingCart size={20} />
                      <span>
                        View Basket ({currentQuantityInCart}) • {formatCurrency(activePack.price * currentQuantityInCart)} &rarr;
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="related-section">
              <h2 className="related-title">FREQUENTLY ORDERED TOGETHER</h2>

              <div className="related-grid">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => navigate(`/products/${rel.id}`)}
                    className="related-card"
                  >
                    <div className="related-card-img">
                      <img src={rel.image} alt={rel.name} loading="lazy" />
                    </div>
                    <div className="related-card-body">
                      <div className="related-brand">RAMBO BIRIYANI</div>
                      <div className="related-name">{rel.name}</div>
                      <div className="related-card-footer">
                        <span className="related-price">{formatCurrency(rel.price)}</span>
                        <span className="related-cta">Order Now &rarr;</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* STICKY FIXED BOTTOM SHOPPING BAR (Mobile-First) */}
        <div className="sticky-basket-bar">
          <div className="sticky-basket-inner">
            {currentQuantityInCart === 0 ? (
              <button
                type="button"
                onClick={handleInitialAdd}
                className="add-to-basket-btn add-to-basket-full"
              >
                <ShoppingCart size={20} />
                <span>Add to Basket • {formatCurrency(activePack.price)}</span>
              </button>
            ) : (
              <div className="active-basket-row">
                <div className="stepper-wrap">
                  <button
                    type="button"
                    onClick={handleDecreaseInCart}
                    className="stepper-circle-btn"
                    title="Decrease quantity"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={17} strokeWidth={2.8} />
                  </button>

                  <span className="stepper-count">{currentQuantityInCart}</span>

                  <button
                    type="button"
                    onClick={handleIncreaseInCart}
                    disabled={currentQuantityInCart >= 15}
                    className="stepper-circle-btn"
                    title="Increase quantity (Max 15)"
                    aria-label="Increase quantity"
                  >
                    <Plus size={17} strokeWidth={2.8} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="view-basket-btn"
                  title="View Basket"
                >
                  <ShoppingCart size={19} />
                  <span>
                    View Basket ({currentQuantityInCart}) • {formatCurrency(activePack.price * currentQuantityInCart)}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Floating Toast Notification */}
        {addedToast && (
          <div className="floating-toast">
            <Check size={18} strokeWidth={3} />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      <style>{`
        /* Master Theme Palette */
        :root {
          --rambo-bg: #090706;
          --rambo-card-bg: #171310;
          --rambo-primary: #E51E25;
          --rambo-gold: #C5A16A;
          --rambo-text: #FFFFFF;
          --rambo-border: #33251B;
        }

        /* Base Page Wrapper - Zero Horizontal Trapping, Smooth Touch Momentum */
        .product-page-wrapper {
          background-color: var(--rambo-bg);
          min-height: 100vh;
          color: var(--rambo-text);
          padding-bottom: calc(115px + env(safe-area-inset-bottom, 0px));
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          width: 100%;
          max-width: 100vw;
          overflow-x: clip;
          overflow-y: visible;
          touch-action: pan-y;
          -webkit-overflow-scrolling: touch;
          box-sizing: border-box;
        }

        /* Custom Selection Colors */
        .product-page-wrapper ::selection {
          background-color: var(--rambo-primary);
          color: #FFFFFF;
        }

        .product-page-wrapper ::-moz-selection {
          background-color: var(--rambo-primary);
          color: #FFFFFF;
        }

        /* Text Highlighting, Selection & Copying Across All Devices */
        .dish-title,
        .price-row,
        .current-price,
        .mrp-price,
        .discount-pill,
        .dish-description,
        .dum-authenticity-tag,
        .portion-header,
        .portion-name,
        .portion-price,
        .portion-subtitle,
        .related-title,
        .related-name,
        .related-price {
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
          -webkit-touch-callout: default;
        }

        /* Controls & Clickable Elements: Prevent Blue Tap Box and Accidental Highlight on Tap */
        button,
        .floating-action-btn,
        .dot-pill,
        .thumb-btn,
        .portion-card,
        .stepper-wrap,
        .stepper-circle-btn,
        .stepper-count,
        .add-to-basket-btn,
        .related-card {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        /* Container - Flexible & Box Sized */
        .product-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 20px 24px;
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
        }

        /* Desktop & Tablet Main 2-Column Grid with Safe Min-Width Tracks */
        .product-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
          gap: 36px;
          align-items: start;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        /* Product Gallery Block */
        .product-gallery-block {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .hero-img-box {
          position: relative;
          width: 100%;
          height: 480px;
          border-radius: 20px;
          overflow: hidden;
          background-color: var(--rambo-card-bg);
          border: 1px solid var(--rambo-border);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.7);
          box-sizing: border-box;
        }

        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Floating Circular Buttons Inside Image */
        .floating-action-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: rgba(23, 19, 16, 0.78);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 5;
          transition: background-color 0.15s ease, transform 0.15s ease;
        }

        .floating-action-btn:hover {
          background-color: rgba(35, 20, 18, 0.95);
          transform: scale(1.05);
        }

        .floating-action-btn.back-btn {
          position: absolute;
          top: 12px;
          left: 12px;
        }

        .floating-action-btn.wishlist-btn {
          position: absolute;
          top: 12px;
          right: 12px;
        }

        /* Dietary Indicator Badge */
        .dietary-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          width: 20px;
          height: 20px;
          border-width: 2px;
          border-style: solid;
          border-radius: 4px;
          background: rgba(9, 7, 6, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
        }

        /* Hero Image Dots Indicator at Bottom */
        .hero-dots-indicator {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 5;
          background: rgba(9, 7, 6, 0.65);
          backdrop-filter: blur(6px);
          padding: 3px 8px;
          border-radius: 12px;
        }

        .dot-pill {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .dot-pill.dot-active {
          width: 16px;
          border-radius: 3px;
          background: var(--rambo-primary);
        }

        /* Thumbnails Strip - Smooth Native Horizontal Scrolling */
        .thumbnails-wrapper {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          overflow: hidden;
          margin-top: 10px;
          box-sizing: border-box;
        }

        .thumbnails-scroll-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          touch-action: pan-x pan-y;
          overscroll-behavior-x: contain;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 2px 2px 6px 2px;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .thumbnails-scroll-row::-webkit-scrollbar {
          display: none;
        }

        .thumb-btn {
          flex: 0 0 58px;
          height: 44px;
          border-radius: 10px;
          overflow: hidden;
          background: var(--rambo-card-bg);
          border: 1.5px solid var(--rambo-border);
          cursor: pointer;
          padding: 0;
          transition: border-color 0.15s ease, transform 0.15s ease;
          box-sizing: border-box;
        }

        .thumb-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .thumb-btn.thumb-active {
          border: 2px solid var(--rambo-primary);
          box-shadow: 0 0 10px rgba(229, 30, 37, 0.5);
        }

        /* Product Information Block */
        .product-info-block {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .dish-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--rambo-text);
          margin: 0 0 8px;
          line-height: 1.25;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
        }

        .price-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .current-price {
          font-size: 1.85rem;
          font-weight: 900;
          color: var(--rambo-text);
        }

        .mrp-price {
          font-size: 1.15rem;
          text-decoration: line-through;
          color: #71717a;
        }

        .discount-pill {
          background-color: var(--rambo-primary);
          color: #FFFFFF;
          font-weight: 800;
          font-size: 0.8rem;
          padding: 3px 10px;
          border-radius: 14px;
          letter-spacing: 0.02em;
        }

        /* Product Description - Wraps naturally, never overflows */
        .dish-description {
          font-size: 0.95rem;
          color: #9ca3af;
          line-height: 1.55;
          margin: 0 0 12px;
          max-width: 100%;
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: normal;
          white-space: normal;
        }

        .dum-authenticity-tag {
          background-color: #1a1210;
          border: 1px solid rgba(229, 30, 37, 0.25);
          color: #fde047;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.825rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          max-width: 100%;
          box-sizing: border-box;
          word-break: break-word;
        }

        .section-divider {
          width: 100%;
          height: 1px;
          background-color: var(--rambo-border);
          margin-bottom: 16px;
        }

        /* Portion Section */
        .portion-section {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          margin-top: 4px;
        }

        .portion-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--rambo-text);
        }

        /* Portion Horizontal Scroll - Allows Vertical Page Scroll over it */
        .portion-cards-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          touch-action: pan-x pan-y;
          overscroll-behavior-x: contain;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 4px 2px 10px 2px;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .portion-cards-scroll::-webkit-scrollbar {
          display: none;
        }

        .portion-card {
          flex: 0 0 auto;
          width: clamp(146px, 42vw, 185px);
          min-width: 142px;
          position: relative;
          background-color: var(--rambo-card-bg);
          border: 1px solid var(--rambo-border);
          border-radius: 14px;
          padding: 12px 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          transition: all 0.15s ease;
          box-sizing: border-box;
        }

        .portion-card:hover {
          background-color: #201815;
        }

        .portion-card-selected {
          border: 1.5px solid var(--rambo-primary) !important;
          background-color: #241613 !important;
          box-shadow: 0 4px 16px rgba(229, 30, 37, 0.25);
        }

        .portion-check-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: var(--rambo-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .portion-info-left {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;
        }

        .portion-name {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--rambo-text);
          line-height: 1.25;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .portion-price {
          font-size: 1.05rem;
          font-weight: 900;
          color: var(--rambo-text);
          margin-top: 3px;
        }

        .portion-subtitle {
          font-size: 0.72rem;
          color: #C5A16A;
          font-weight: 700;
          margin-top: 2px;
          line-height: 1.2;
          word-break: break-word;
        }

        .portion-img-thumb {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid var(--rambo-border);
        }

        .portion-img-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Desktop Action Bar */
        .desktop-action-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--rambo-border);
        }

        .desktop-action-bar .add-to-basket-btn {
          flex: 1;
        }

        /* Stepper Styling */
        .stepper-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #120e0c;
          padding: 4px 8px;
          border-radius: 26px;
          border: 1px solid var(--rambo-border);
        }

        .stepper-circle-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #221816;
          border: 1px solid var(--rambo-border);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.15s ease, transform 0.1s ease;
        }

        .stepper-circle-btn:hover:not(:disabled) {
          background-color: #33201d;
          transform: scale(1.05);
        }

        .stepper-circle-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .stepper-count {
          font-size: 1.15rem;
          font-weight: 900;
          color: #FFFFFF;
          min-width: 24px;
          text-align: center;
        }

        .add-to-basket-btn {
          height: 48px;
          border-radius: 28px;
          background-color: var(--rambo-primary);
          color: #FFFFFF;
          border: none;
          padding: 0 24px;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 18px rgba(229, 30, 37, 0.45);
          transition: background-color 0.15s ease, transform 0.1s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .add-to-basket-btn:hover {
          background-color: #c9141b;
          transform: translateY(-1px);
        }

        /* Sticky Bottom Shopping Bar (Mobile Only) */
        .sticky-basket-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 1000;
          background-color: #171310;
          border-top: 1px solid var(--rambo-border);
          padding: 10px 14px calc(12px + env(safe-area-inset-bottom, 0px));
          box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.85);
          touch-action: pan-y;
          box-sizing: border-box;
        }

        .sticky-basket-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          max-width: 480px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .sticky-basket-inner .add-to-basket-btn {
          flex: 1;
          min-width: 0;
        }

        .add-to-basket-full {
          width: 100% !important;
          justify-content: center !important;
        }

        .active-basket-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
        }

        .view-basket-btn {
          height: 48px;
          border-radius: 28px;
          background-color: var(--rambo-primary);
          color: #FFFFFF;
          border: none;
          padding: 0 20px;
          font-weight: 800;
          font-size: 0.95rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 18px rgba(229, 30, 37, 0.45);
          transition: background-color 0.15s ease, transform 0.1s ease;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }

        .view-basket-btn:hover {
          background-color: #c9141b;
          transform: translateY(-1px);
        }

        /* Related Section */
        .related-section {
          margin-top: 36px;
          padding-top: 24px;
          border-top: 1px solid var(--rambo-border);
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .related-title {
          font-size: 1.3rem;
          font-weight: 900;
          color: #FFFFFF;
          margin-bottom: 18px;
          letter-spacing: 0.02em;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .related-card {
          background-color: var(--rambo-card-bg);
          border-radius: 14px;
          border: 1px solid var(--rambo-border);
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease;
          box-sizing: border-box;
        }

        .related-card:hover {
          transform: translateY(-3px);
          border-color: var(--rambo-primary);
        }

        .related-card-img {
          height: 150px;
          overflow: hidden;
        }

        .related-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .related-card-body {
          padding: 12px 14px;
        }

        .related-brand {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--rambo-primary);
          letter-spacing: 0.05em;
        }

        .related-name {
          font-size: 1rem;
          font-weight: 800;
          color: #FFFFFF;
          margin: 4px 0 8px;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .related-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .related-price {
          font-size: 1.1rem;
          font-weight: 900;
          color: #FFFFFF;
        }

        .related-cta {
          color: var(--rambo-primary);
          font-weight: 700;
          font-size: 0.8rem;
        }

        /* Floating Toast */
        .floating-toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #16a34a;
          color: #FFFFFF;
          padding: 10px 18px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
          font-size: 0.9rem;
          z-index: 10000;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
          animation: toastFade 0.2s ease-out;
        }

        @keyframes toastFade {
          from {
            opacity: 0;
            transform: translate(-50%, -10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        /* ==========================================================================
           RESPONSIVE BREAKPOINTS (Desktop, Tablet, Mobile)
           ========================================================================== */

        /* Desktop Standard (min-width: 1024px) */
        @media (min-width: 1024px) {
          .product-page-wrapper {
            padding-bottom: 50px;
          }
          .sticky-basket-bar {
            display: none !important;
          }
          .desktop-action-bar {
            display: flex;
          }
          .hero-img-box {
            height: 480px;
          }
        }

        /* Tablet Mode (768px to 1023px) */
        @media (min-width: 768px) and (max-width: 1023px) {
          .product-page-wrapper {
            padding-bottom: 50px;
          }
          .sticky-basket-bar {
            display: none !important;
          }
          .desktop-action-bar {
            display: flex;
          }
          .product-container {
            padding: 16px 20px;
          }
          .product-main-grid {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            gap: 24px;
          }
          .hero-img-box {
            height: 380px;
          }
          .dish-title {
            font-size: 1.8rem;
          }
          .current-price {
            font-size: 1.7rem;
          }
        }

        /* Mobile Devices (max-width: 767px) */
        @media (max-width: 767px) {
          .product-container {
            padding: 10px 14px;
          }
          .product-main-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 14px;
          }
          .desktop-action-bar {
            display: none !important;
          }
          .sticky-basket-bar {
            display: block;
          }
          .dish-title {
            font-size: 1.65rem;
          }
          .current-price {
            font-size: 1.85rem;
          }

          /* Responsive Mobile Hero Image Box */
          .hero-img-box {
            height: clamp(230px, 58vw, 275px);
            border-radius: 18px;
          }

          .thumbnails-wrapper {
            margin-top: 8px;
          }

          .thumb-btn {
            flex: 0 0 54px;
            height: 42px;
            border-radius: 8px;
          }

          .portion-card {
            width: clamp(146px, 44vw, 175px);
            min-width: 140px;
            padding: 10px 8px;
          }

          .portion-name {
            font-size: 0.88rem;
          }

          .portion-price {
            font-size: 1rem;
          }

          .portion-subtitle {
            font-size: 0.7rem;
          }

          .portion-img-thumb {
            width: 40px;
            height: 40px;
          }
        }

        /* Small Phones (max-width: 390px) */
        @media (max-width: 390px) {
          .product-container {
            padding: 8px 12px;
          }
          .dish-title {
            font-size: 1.5rem;
          }
          .current-price {
            font-size: 1.7rem;
          }
          .portion-card {
            width: 140px;
            min-width: 135px;
            padding: 10px 8px;
          }
          .portion-img-thumb {
            width: 38px;
            height: 38px;
          }
          .add-to-basket-btn {
            padding: 0 16px;
            font-size: 0.92rem;
          }
          .view-basket-btn {
            padding: 0 14px;
            font-size: 0.86rem;
            gap: 6px;
          }
        }

        /* Ultra-compact Phones (max-width: 330px) */
        @media (max-width: 330px) {
          .product-container {
            padding: 6px 8px;
          }
          .dish-title {
            font-size: 1.35rem;
          }
          .current-price {
            font-size: 1.55rem;
          }
          .stepper-circle-btn {
            width: 32px;
            height: 32px;
          }
          .stepper-wrap {
            gap: 4px;
            padding: 3px 6px;
          }
          .add-to-basket-btn {
            height: 44px;
            font-size: 0.88rem;
            padding: 0 12px;
            gap: 6px;
          }
          .view-basket-btn {
            height: 44px;
            font-size: 0.78rem;
            padding: 0 8px;
            gap: 4px;
          }
          .portion-card {
            width: 130px;
            min-width: 125px;
            padding: 8px 6px;
          }
          .portion-name {
            font-size: 0.82rem;
          }
          .portion-price {
            font-size: 0.92rem;
          }
          .portion-subtitle {
            font-size: 0.68rem;
          }
          .portion-img-thumb {
            width: 34px;
            height: 34px;
          }
        }
      `}</style>
    </>
  );
};

export default ProductDetail;
