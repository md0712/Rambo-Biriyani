import React, { useState } from 'react';
import { Flame, Check, Users, Utensils, MessageCircle, Phone, Sparkles } from 'lucide-react';
import SEO from '../../components/shared/SEO';
import Button from '../../components/common/Button';
import { formatCurrency, getWhatsAppOrderLink } from '../../utils/helpers';
import { APP_CONFIG } from '../../utils/constants';

export const Services = () => {
  const [guestCount, setGuestCount] = useState('25');
  const [selectedMeat, setSelectedMeat] = useState('Chicken & Mutton Mix');

  const combos = [
    {
      name: 'Rambo Solo Warrior Pack',
      price: 389,
      serves: 'Serves 1 Hero',
      desc: '1 Chicken Biriyani + 1/2 Plate Chicken 65 + 1 Boiled Egg + 1 Chilled Rose Milk + Raita & Salna.',
      popular: false,
    },
    {
      name: 'Warrior Double Delight',
      price: 649,
      serves: 'Serves 2 Warriors',
      desc: '1 Chicken Biriyani + 1 Mutton Biriyani + 1 Full Chicken 65 + 2 Boiled Eggs + 2 Rose Milks.',
      popular: true,
    },
    {
      name: 'Mega Family Handi Feast',
      price: 1399,
      serves: 'Serves 4 - 5 People',
      desc: '1 Heavy Dum Handi (Mix Chicken & Mutton) + 2 Plates Chicken 65 + 1 Mutton Chukka + 4 Rose Milks + Unlimited Raita & Salna.',
      popular: false,
    },
    {
      name: 'Wedding & Corporate Bulk Handi (15KG)',
      price: 6999,
      serves: 'Serves 25 - 30 People',
      desc: 'Authentic 15KG dum brass handi prepared on live firewood, delivered hot with full accompaniments.',
      popular: false,
    },
  ];

  const handleCateringInquiry = () => {
    const msg = `Hi Rambo Biriyani, I want to book catering for ${guestCount} people with ${selectedMeat}. Please share availability and live dum quote!`;
    window.open(getWhatsAppOrderLink(APP_CONFIG.WHATSAPP_NUMBER, msg), '_blank');
  };

  return (
    <>
      <SEO
        title="Combos & Bulk Catering"
        description="Book Rambo Biriyani family feast combos and large-scale firewood dum catering."
      />

      {/* Header Banner */}
      <section style={{ padding: '4.5rem 0 3.5rem', background: '#0e0807', borderBottom: '1px solid var(--border-subtle)', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <span style={{ color: 'var(--rambo-red-bright)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.85rem' }}>
            Big Appetites & Celebrations
          </span>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', fontStyle: 'italic', margin: '0.5rem 0' }}>
            WARRIOR COMBOS & LIVE DUM CATERING
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#d1d5db' }}>
            From hungry duos to 500-guest grand wedding feasts, we bring the live firewood biriyani experience straight to your tables.
          </p>
        </div>
      </section>

      {/* Combos Grid */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              Value Feast Combos
            </h2>
            <p style={{ color: '#9ca3af' }}>Curated combinations of our finest biriyanis, crispy 65 sides, and chilled drinks.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {combos.map((combo, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--gradient-card)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '2rem',
                  border: combo.popular ? '2px solid var(--rambo-red)' : '1px solid var(--border-subtle)',
                  boxShadow: combo.popular ? '0 10px 30px rgba(225, 29, 36, 0.35)' : 'none',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {combo.popular && (
                  <span
                    className="badge badge-rambo"
                    style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)' }}
                  >
                    Best Value Warrior Pick
                  </span>
                )}

                <div style={{ fontSize: '0.8rem', color: 'var(--spice-amber)', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {combo.serves}
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
                  {combo.name}
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                  {combo.desc}
                </p>

                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--rambo-red-bright)' }}>
                    {formatCurrency(combo.price)}
                  </span>
                </div>

                <a
                  href={getWhatsAppOrderLink(
                    APP_CONFIG.WHATSAPP_NUMBER,
                    `Hi Rambo Biriyani, I want to order the combo: ${combo.name} (${formatCurrency(combo.price)})!`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-order-online"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <MessageCircle size={18} />
                  <span>Order on WhatsApp</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catering Calculator / Inquiry */}
      <section style={{ padding: '5rem 0', background: '#0e0807', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ color: 'var(--spice-amber)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem' }}>
              Outdoor & Party Catering
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#ffffff' }}>
              Live Firewood Dum Handi Booking
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
              We set up traditional charcoal dum stations at your venue, serving smoking hot biriyani straight to your guests.
            </p>
          </div>

          <div style={{ background: '#140c0b', borderRadius: 'var(--radius-xl)', padding: '2.5rem', border: '1px solid var(--border-gold)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#d1d5db', marginBottom: '0.4rem' }}>
                  Estimated Guests
                </label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: '#1c110f',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="15-25">15 - 25 Guests (1 Handi)</option>
                  <option value="50">50 Guests (2 Handis)</option>
                  <option value="100">100 Guests (4 Handis)</option>
                  <option value="250">250+ Grand Celebration</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#d1d5db', marginBottom: '0.4rem' }}>
                  Meat Preference
                </label>
                <select
                  value={selectedMeat}
                  onChange={(e) => setSelectedMeat(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: '#1c110f',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="Chicken Dum Only">Chicken Dum Only</option>
                  <option value="Mutton Dum Only">Mutton Dum Only</option>
                  <option value="Chicken & Mutton Mix">Chicken & Mutton Mix (Most Popular)</option>
                  <option value="Beef Dum & Chicken 65">Beef Dum & Chicken 65</option>
                </select>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleCateringInquiry}
              leftIcon={<MessageCircle size={20} />}
            >
              Get Live Dum Quotation on WhatsApp &rarr;
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;
