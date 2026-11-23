import React, { useState, useEffect } from 'react';
import { X, Check, Mail, Flame, UtensilsCrossed, Plus, Minus, Star, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export const ProductDetailModal = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
}) => {
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedPackIndex, setSelectedPackIndex] = useState(0);
  const [addedToast, setAddedToast] = useState(false);
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

  const basePrice = product?.price || 249;
  const category = product?.category || 'Biriyanis';

  // Check if item is vegetarian
  const isVeg =
    category === 'Desserts' ||
    category === 'Beverages' ||
    product?.name?.toLowerCase().includes('veg') ||
    product?.name?.toLowerCase().includes('paneer') ||
    product?.name?.toLowerCase().includes('gobi') ||
    product?.name?.toLowerCase().includes('lime') ||
    product?.name?.toLowerCase().includes('rose milk') ||
    product?.name?.toLowerCase().includes('jamun') ||
    product?.name?.toLowerCase().includes('payasam');

  // Portions: Strictly 1 Plate or 2 Plates (No fake grocery offers)
  const getPacksForProduct = () => {
    if (category === 'Biriyanis') {
      return [
        {
          id: 'pack-1plate',
          size: '1 Plate Biriyani',
          portionName: 'Regular Handi (1 Person Eat)',
          price: basePrice,
        },
        {
          id: 'pack-2plates',
          size: '2 Plates Biriyani',
          portionName: 'Double Handi (2 Persons Eat)',
          price: Math.round(basePrice * 1.9),
        },
      ];
    }

    if (category === 'Beverages') {
      return [
        {
          id: 'pack-1drink',
          size: '1 Drink',
          portionName: 'Standard (1 Person Drink)',
          price: basePrice,
        },
        {
          id: 'pack-2drinks',
          size: '2 Drinks',
          portionName: 'Pair (2 Persons Drink)',
          price: Math.round(basePrice * 1.9),
        },
      ];
    }

    if (category === 'Desserts') {
      return [
        {
          id: 'pack-1sweet',
          size: '1 Plate',
          portionName: 'Solo Sweet (1 Person Eat)',
          price: basePrice,
        },
        {
          id: 'pack-2sweets',
          size: '2 Plates',
          portionName: 'Double (2 Persons Eat)',
          price: Math.round(basePrice * 1.9),
        },
      ];
    }

    // Default for Starters / Add Ons / Combos
    return [
      {
        id: 'pack-1plate',
        size: '1 Plate',
        portionName: 'Standard Portion (1 Person Eat)',
        price: basePrice,
      },
      {
        id: 'pack-2plates',
        size: '2 Plates',
        portionName: 'Double Portion (2 Persons Eat)',
        price: Math.round(basePrice * 1.9),
      },
    ];
  };

  const packOptions = getPacksForProduct();
  const activePack = packOptions[selectedPackIndex] || packOptions[0];

  const gallery = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : product?.image
    ? [product.image]
    : ['https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600'];

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image || gallery[0]);
      setSelectedPackIndex(0);
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const currentItemId = `${product.id}-${activePack.id}`;
  const existingCartItem = cart.find((item) => item.id === currentItemId);
  const currentQuantityInCart = existingCartItem ? existingCartItem.quantity : 0;

  const updateCartQuantity = (newQty) => {
    const safeQty = Math.max(0, Math.min(15, newQty));
    let currentCart = [];
    try {
      const raw = localStorage.getItem('rambo_cart');
      currentCart = raw ? JSON.parse(raw) : [];
    } catch {
      currentCart = [];
    }

    const existingIndex = currentCart.findIndex((item) => item.id === currentItemId);

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
    window.dispatchEvent(new Event('cartUpdated'));

    if (safeQty > 0 && safeQty > currentQuantityInCart) {
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2000);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      {/* Dark Theme Modal Dialog Card ("back theme") */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1040px',
          maxHeight: '92vh',
          backgroundColor: '#140c0b',
          color: '#ffffff',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          animation: 'bbModalFadeIn 0.25s ease-out',
        }}
      >
        {/* Top Breadcrumb & Share Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.85rem',
            color: '#9ca3af',
            flexWrap: 'wrap',
            gap: '8px',
            background: '#100908',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#ffffff', fontWeight: 700, letterSpacing: '0.04em' }}>RAMBO WOOD-FIRED DUM</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
              <span>Share on:</span>
              <span style={{ color: '#1877f2', display: 'flex', cursor: 'pointer' }} title="Facebook">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </span>
              <span style={{ color: '#1da1f2', display: 'flex', cursor: 'pointer' }} title="Twitter">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 23.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </span>
              <span style={{ color: '#ea4335', display: 'flex', cursor: 'pointer' }} title="Email">
                <Mail size={15} />
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#1c1210',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                borderRadius: '6px',
              }}
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main 2-Column Content Area */}
        <div className="bb-modal-grid" style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: '36px' }}>
          {/* Left Column: Vertical Thumbnails + Main Image with Veg Icon */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {/* Vertical Thumbnail Strip (only if multiple images exist) */}
            {gallery.length > 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {gallery.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '6px',
                      border: selectedImage === img ? '2px solid var(--rambo-red)' : '1px solid rgba(255, 255, 255, 0.1)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      padding: '2px',
                      backgroundColor: '#18100f',
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Main Image Box */}
            <div
              style={{
                flex: 1,
                position: 'relative',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
                backgroundColor: '#0d0706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '380px',
                maxHeight: '440px',
              }}
            >
              <img
                src={selectedImage}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />

              {/* Veg / Non-Veg Icon in Bottom Left Corner */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  width: '22px',
                  height: '22px',
                  border: isVeg ? '2px solid #16a34a' : '2px solid #dc2626',
                  borderRadius: '3px',
                  backgroundColor: '#140c0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                }}
                title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: isVeg ? '50%' : '2px',
                    backgroundColor: isVeg ? '#16a34a' : '#dc2626',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Title, Pricing, Stepper, and Pack Sizes */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Top Brand (No delivery minutes) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: 'var(--rambo-red-bright)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                RAMBO BIRIYANI
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(234, 179, 8, 0.15)', padding: '2px 6px', borderRadius: '4px', color: '#fde047', fontWeight: 700, fontSize: '0.78rem' }}>
                <Star size={12} fill="#f59e0b" color="#f59e0b" />
                <span>{product.rating || 4.9}</span>
              </div>
            </div>

            {/* Product Title with Active Pack Size */}
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 10px',
                lineHeight: 1.25,
                fontFamily: 'var(--font-display)',
              }}
            >
              {product.name} ({activePack.size})
            </h2>

            {/* Pricing Section (Clean Restaurant Price without fake grocery offers) */}
            <div style={{ margin: '4px 0 16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '2px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--rambo-red-bright)' }}>
                  {formatCurrency(activePack.price)}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                  (inclusive of all taxes)
                </span>
              </div>
            </div>

            {/* Dum Authenticity Tag */}
            <div
              style={{
                backgroundColor: '#1f1311',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                color: '#fde047',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.825rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '18px',
              }}
            >
              <Flame size={15} style={{ color: 'var(--rambo-red-bright)' }} />
              <span>Wood-Fired Dum Kitchen • 100% Pure Desi Ghee</span>
            </div>

            {/* Action Area: Add to Order Button OR Stepper if already added */}
            <div style={{ marginBottom: '20px' }}>
              {currentQuantityInCart === 0 ? (
                /* Initial State: Clean Add to Order Button (Nothing is added yet) */
                <button
                  type="button"
                  onClick={() => updateCartQuantity(1)}
                  style={{
                    height: '42px',
                    width: '100%',
                    maxWidth: '320px',
                    backgroundColor: '#e11d24',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '0.975rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(225, 29, 36, 0.4)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e11d24')}
                >
                  <ShoppingBag size={18} />
                  <span>Add to Order • {formatCurrency(activePack.price)}</span>
                </button>
              ) : (
                /* Once Added: Interactive Stepper (1 to max 15) */
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: '#e11d24',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        height: '42px',
                        boxShadow: '0 4px 12px rgba(225, 29, 36, 0.4)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(currentQuantityInCart - 1)}
                        style={{
                          width: '44px',
                          height: '100%',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          userSelect: 'none',
                        }}
                        title="Decrease quantity"
                      >
                        <Minus size={16} strokeWidth={3} />
                      </button>

                      <div
                        style={{
                          width: '52px',
                          height: '100%',
                          backgroundColor: '#ffffff',
                          color: '#e11d24',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '1.2rem',
                        }}
                      >
                        {currentQuantityInCart}
                      </div>

                      <button
                        type="button"
                        onClick={() => updateCartQuantity(Math.min(15, currentQuantityInCart + 1))}
                        disabled={currentQuantityInCart >= 15}
                        style={{
                          width: '44px',
                          height: '100%',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#ffffff',
                          cursor: currentQuantityInCart >= 15 ? 'not-allowed' : 'pointer',
                          opacity: currentQuantityInCart >= 15 ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          userSelect: 'none',
                        }}
                        title="Increase quantity (Max 15)"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>

                    {currentQuantityInCart >= 15 && (
                      <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>
                        Maximum limit reached (15 items)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pack sizes Header */}
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Pack sizes</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--rambo-red-bright)', fontWeight: 700 }}>
                Portion size for appetite
              </span>
            </div>

            {/* Pack sizes Selection Cards List with "1 Person Eat" */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {packOptions.map((pack, idx) => {
                const isSelected = selectedPackIndex === idx;
                const packCartItem = cart.find((c) => c.id === `${product.id}-${pack.id}`);
                const packInCartQty = packCartItem ? packCartItem.quantity : 0;

                return (
                  <div
                    key={pack.id}
                    onClick={() => setSelectedPackIndex(idx)}
                    style={{
                      border: isSelected ? '1.5px solid var(--rambo-red)' : '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: isSelected ? '#221513' : '#18100f',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      gap: '12px',
                    }}
                  >
                    {/* Left: Radio Selector + Size & "1 Person Eat" */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          border: isSelected ? '2px solid var(--rambo-red)' : '2px solid rgba(255, 255, 255, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && (
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--rambo-red)',
                            }}
                          />
                        )}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.925rem', fontWeight: 800, color: '#ffffff' }}>
                          {pack.size}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: isSelected ? '#fde047' : '#9ca3af', fontWeight: 600 }}>
                          {pack.portionName}
                        </div>
                      </div>
                    </div>

                    {/* Right: Clean Price & cart status (no fake grocery offers/mrp) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'right' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff' }}>
                        {formatCurrency(pack.price)}
                      </span>

                      {/* Cart status: Only shows checkmark if ACTUALLY in cart */}
                      <div
                        style={{
                          minWidth: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {packInCartQty > 0 ? (
                          <span
                            style={{
                              background: 'rgba(34, 197, 94, 0.2)',
                              color: '#22c55e',
                              padding: '2px 6px',
                              borderRadius: '10px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              border: '1px solid rgba(34, 197, 94, 0.4)',
                            }}
                          >
                            <Check size={12} strokeWidth={3} />
                            <span>{packInCartQty}</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bbModalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @media (max-width: 768px) {
          .bb-modal-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetailModal;
