import React from 'react';
import { Link } from 'react-router-dom';
import { Bike, UtensilsCrossed, Flame, Sparkles, Award, Leaf, ChefHat, Star, ShieldCheck } from 'lucide-react';

export const Hero = () => {
  return (
    <>
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            {/* Left Content */}
            <div className="hero-content">
              <div className="hero-brand-title">
                {/* Slogan from Official Design */}
                <h1 className="hero-main-heading">
                  BOLD FLAVOURS.
                  <span className="no-mercy">NO MERCY.</span>
                </h1>
              </div>

              <p className="hero-subtitle">
                Authentic, aromatic and aggressively delicious biriyani crafted for true food warriors. Slow-cooked on wood-fired dum with whole hand-ground spices and pure ghee.
              </p>

              <div className="hero-actions">
                <Link to="/products" className="btn-order-online">
                  <Bike size={20} />
                  <span>Order Online &rarr;</span>
                </Link>

                <Link to="/products" className="btn-view-menu">
                  <UtensilsCrossed size={18} />
                  <span>View Menu</span>
                </Link>
              </div>

              {/* Fast Trust Tags */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  marginTop: '0.75rem',
                  fontSize: '0.85rem',
                  color: '#9ca3af',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fde047', fontWeight: 700 }}>
                  <Star size={15} fill="#f59e0b" color="#f59e0b" />
                  <span>4.9 / 5.0 (50K+ Foodies)</span>
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Flame size={15} style={{ color: 'var(--rambo-red-bright)' }} />
                  <span>Wood-Fired Dum</span>
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={15} style={{ color: 'var(--success)' }} />
                  <span>100% Halal Meats</span>
                </span>
              </div>
            </div>

            {/* Right Showcase: Official Uploaded Logo Emblem */}
            <div className="hero-visual">
              <div className="hero-emblem-badge">
                <img
                  src="/images/rambo-logo-badge.jpg"
                  alt="Official Rambo Biriyani Emblem"
                  className="hero-emblem-img"
                />

                {/* Live Dum Badge */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    right: '1rem',
                    background: 'rgba(10, 6, 6, 0.92)',
                    backdropFilter: 'blur(8px)',
                    border: '1.5px solid var(--border-gold)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '0.5rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.9)',
                  }}
                >
                  <Flame size={18} style={{ color: 'var(--rambo-red-bright)' }} />
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--spice-amber)', fontWeight: 800, textTransform: 'uppercase' }}>
                      Firewood Dum
                    </div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#ffffff' }}>Fresh Batches Live</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals Bar */}
      <section className="trust-signals-bar">
        <div className="container">
          <div className="trust-signals-grid">
            {/* Feature 1 */}
            <div className="trust-item">
              <div className="trust-icon-box">
                <ChefHat size={22} />
              </div>
              <div>
                <div className="trust-title">Authentic Dum Style</div>
                <div className="trust-desc">Slow-cooked to perfection</div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="trust-item">
              <div className="trust-icon-box">
                <Leaf size={22} />
              </div>
              <div>
                <div className="trust-title">Premium Ingredients</div>
                <div className="trust-desc">Handpicked & high-quality</div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="trust-item">
              <div className="trust-icon-box">
                <Flame size={22} />
              </div>
              <div>
                <div className="trust-title">Rich & Aromatic</div>
                <div className="trust-desc">Signature spice blend</div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="trust-item">
              <div className="trust-icon-box">
                <Award size={22} />
              </div>
              <div>
                <div className="trust-title">Consistent Quality</div>
                <div className="trust-desc">Bold taste, every time</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
