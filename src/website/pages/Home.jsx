import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Flame,
  ArrowRight,
  ArrowUpRight,
  Utensils,
  Plus,
  Minus,
  CheckCircle2,
  Phone,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Star,
  Eye,
} from 'lucide-react';
import SEO from '../../components/shared/SEO';
import Hero from '../components/Hero';
import Button from '../../components/common/Button';
import ProductDetailModal from '../components/ProductDetailModal';
import productService from '../../services/productService';
import { formatCurrency, getWhatsAppOrderLink } from '../../utils/helpers';
import { APP_CONFIG } from '../../utils/constants';

export const Home = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedToast, setAddedToast] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);

  useEffect(() => {
    loadCategoryItems('Biriyanis');
  }, []);

  const loadCategoryItems = async (cat) => {
    setLoading(true);
    const data = await productService.getAllProducts({ category: cat });
    setMenuItems(data);
    setLoading(false);
  };

  const handleAddToCartWithQty = (item, qty = 1) => {
    const cart = JSON.parse(localStorage.getItem('rambo_cart') || '[]');
    const existingIndex = cart.findIndex((c) => c.id === item.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += qty;
    } else {
      cart.push({ ...item, quantity: qty });
    }
    localStorage.setItem('rambo_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));

    setAddedToast(`${item.name} (x${qty})`);
    setTimeout(() => setAddedToast(null), 2500);
  };

  return (
    <>
      <SEO
        title="Home"
        description="Rambo Biriyani - Bold Flavours. No Mercy. Authentic Dum Biriyani cooked over firewood with signature spices."
      />

      {/* Hero & Trust Badges */}
      <Hero />

      {/* Added Toast */}
      {addedToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 'var(--z-toast)',
            background: '#1a100f',
            border: '2px solid var(--rambo-red)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.9), 0 0 20px rgba(225, 29, 36, 0.4)',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--rambo-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            ✓
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>Added to Warrior Cart!</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--spice-amber)' }}>{addedToast} added</div>
          </div>
        </div>
      )}

      {/* THE MENU Section - Side Scroll Menu */}
      <section className="menu-section">
        <div className="container">
          {/* THE MENU Editorial Header (Exactly matching user reference) */}
          <div className="the-menu-header">
            <div className="the-menu-title-block">
              <div className="menu-eyebrow">
                <span className="eyebrow-dash" />
                <span>PICK YOUR MISSION</span>
              </div>
              <h2 className="the-menu-main-title">
                <span className="title-the">THE</span>{' '}
                <span className="title-menu">MENU</span>
              </h2>
            </div>

            <div className="the-menu-tagline-block">
              <p className="the-menu-tagline-line">One pot. Layers of flavour.</p>
              <p className="the-menu-tagline-line">Find your kind of fire.</p>
            </div>
          </div>

          {/* Menu Grid - 2 Columns 752px Max-Width */}
          <div className="menu-grid">
            {menuItems.map((item, index) => {
              const tag = item.heroTag || `0${index + 1} / THE SPECIAL`;
              const isHighlighted = item.highlighted || index === 1;

              return (
                <div
                  key={`${item.id}-${index}`}
                  className={`dish biriyani-card ${isHighlighted ? 'featured-border' : ''}`}
                  onClick={() => navigate(`/products/${item.id}`)}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  title={`View ${item.name} details`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/products/${item.id}`);
                    }
                  }}
                >
                  <div className="dish-img-box biriyani-img-box">
                    <img src={item.image} alt={item.name} className="dish-img biriyani-img" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/products/${item.id}`);
                      }}
                      title="View Details"
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        width: '32px',
                        height: '32px',
                        borderRadius: '4px',
                        background: 'rgba(20, 16, 14, 0.85)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        cursor: 'pointer',
                        zIndex: 3,
                      }}
                    >
                      <Eye size={15} />
                    </button>
                  </div>

                  <div className="dish-content biriyani-content">
                    <div>
                      <div className="card-tag-index">{tag}</div>

                      <h3 className="biriyani-name">
                        {item.name.split(' ').map((word, wIdx) => (
                          <span key={wIdx} className="name-word-line">{word}</span>
                        ))}
                      </h3>

                      <p className="biriyani-desc">{item.description}</p>
                    </div>

                    <div>
                      <div className="card-divider" />

                      <div className="biriyani-footer-row">
                        <span className="card-cta-label">
                          MAKE IT YOURS
                          <span className="card-cta-price">{formatCurrency(item.price)}</span>
                        </span>
                        <span className="card-cta-arrow">
                          <ArrowUpRight size={18} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="menu-disclaimer">
            Menu availability and pricing may vary. Contact us for today's menu.
          </p>

          {/* OUR STORY Parchment Card (Exactly from image design) */}
          <div className="story-parchment-card">
            <div>
              <h2 className="story-heading">OUR STORY</h2>
              <p className="story-text">
                Born from a passion for legendary biriyani, <strong>Rambo Biriyani</strong> brings you bold, traditional flavours with a fierce twist. We serve biriyani that's rich, aromatic and unforgettable. Prepared in giant seasoned brass handis slow-fired on charcoal embers.
              </p>
              <Link to="/about" className="story-btn">
                <span>Read Our Story</span>
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Military Soldier / Mountain Silhouette Graphic */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <svg viewBox="0 0 400 240" width="100%" height="180" fill="#292524" opacity="0.85">
                {/* Helicopter silhouette */}
                <g transform="translate(240, 20) scale(0.6)">
                  <ellipse cx="60" cy="40" rx="35" ry="16" />
                  <rect x="5" y="36" width="30" height="5" />
                  <line x1="15" y1="20" x2="105" y2="20" stroke="#292524" strokeWidth="3" />
                  <line x1="60" y1="20" x2="60" y2="30" stroke="#292524" strokeWidth="4" />
                  <polygon points="90,38 120,38 115,34 90,34" />
                  <line x1="40" y1="56" x2="80" y2="56" stroke="#292524" strokeWidth="4" />
                  <line x1="50" y1="50" x2="45" y2="56" stroke="#292524" strokeWidth="3" />
                  <line x1="70" y1="50" x2="75" y2="56" stroke="#292524" strokeWidth="3" />
                </g>

                {/* Mountains background */}
                <polygon points="0,240 80,120 180,240" fill="#a8a29e" opacity="0.5" />
                <polygon points="120,240 220,90 320,240" fill="#78716c" opacity="0.6" />
                <polygon points="260,240 330,130 400,240" fill="#57534e" opacity="0.7" />

                {/* Soldiers on ridge silhouette */}
                <path d="M0,240 L400,240 L400,210 Q320,195 240,210 Q160,200 80,215 L0,225 Z" fill="#1c1917" />

                {/* Soldier 1 */}
                <circle cx="210" cy="180" r="5" />
                <rect x="206" y="185" width="8" height="18" />
                <line x1="202" y1="188" x2="225" y2="182" stroke="#1c1917" strokeWidth="2.5" />
                <line x1="207" y1="203" x2="204" y2="216" stroke="#1c1917" strokeWidth="3" />
                <line x1="213" y1="203" x2="216" y2="216" stroke="#1c1917" strokeWidth="3" />

                {/* Soldier 2 */}
                <circle cx="240" cy="177" r="5" />
                <rect x="236" y="182" width="8" height="19" />
                <line x1="233" y1="186" x2="255" y2="180" stroke="#1c1917" strokeWidth="2.5" />
                <line x1="237" y1="201" x2="234" y2="215" stroke="#1c1917" strokeWidth="3" />
                <line x1="243" y1="201" x2="246" y2="215" stroke="#1c1917" strokeWidth="3" />

                {/* Soldier 3 */}
                <circle cx="270" cy="183" r="5" />
                <rect x="266" y="188" width="8" height="17" />
                <line x1="267" y1="205" x2="265" y2="217" stroke="#1c1917" strokeWidth="3" />
                <line x1="273" y1="205" x2="276" y2="217" stroke="#1c1917" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Modal - BigBasket reference model */}
      <ProductDetailModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onAddToCart={handleAddToCartWithQty}
      />
    </>
  );
};

export default Home;
