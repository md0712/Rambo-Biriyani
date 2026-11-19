import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Award, ShieldCheck, HeartHandshake, ChefHat, Sparkles, ArrowRight } from 'lucide-react';
import SEO from '../../components/shared/SEO';
import Button from '../../components/common/Button';

export const About = () => {
  const pillars = [
    {
      icon: <Flame size={24} />,
      title: 'Real Firewood Dum',
      desc: 'We never cut corners with steamers or gas pressure pots. Heavy seasoned brass vessels sealed with wheat dough, roasted over wood fire and burning coals.',
    },
    {
      icon: <ChefHat size={24} />,
      title: 'Heritage Masala Blends',
      desc: 'Star anise, mace, shahi jeera, and dried Kashmiri chillies stone-pounded daily in-house for rich complexity with zero synthetic extracts.',
    },
    {
      icon: <ShieldCheck size={24} />,
      title: 'Top-Grade Farm Meats',
      desc: 'Handpicked tender baby goat and pasture-raised chicken marinated for 12 hours in fresh curd, crushed mint, and garlic ginger paste.',
    },
    {
      icon: <Award size={24} />,
      title: 'No Mercy On Taste',
      desc: 'Bold, punchy, unapologetic flavour profiles created for food warriors who refuse bland, watered-down food.',
    },
  ];

  return (
    <>
      <SEO
        title="Our Story"
        description="The story and culinary heritage of Rambo Biriyani - Handcrafted firewood dum biriyani."
      />

      {/* Header Banner */}
      <section style={{ padding: '4.5rem 0 3.5rem', background: '#0e0807', borderBottom: '1px solid var(--border-subtle)', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <span style={{ color: 'var(--rambo-red-bright)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.85rem' }}>
            Heritage & Passion
          </span>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', fontStyle: 'italic', margin: '0.5rem 0' }}>
            OUR STORY: BOLD FLAVOURS. NO MERCY.
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#d1d5db', lineHeight: 1.6 }}>
            Born from an obsession with legendary dum cooking, Rambo Biriyani was founded with a singular purpose: to bring back unapologetically rich, fiery, and deeply aromatic biriyani.
          </p>
        </div>
      </section>

      {/* Origin Story Grid */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '3.5rem', alignItems: 'center' }}>
            <div>
              <span className="badge badge-gold" style={{ marginBottom: '1rem' }}>The Flame Tradition</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: '1rem', color: '#ffffff' }}>
                Where Street Intensity Meets Royal Dum Mastery
              </h2>
              <p style={{ color: '#d1d5db', lineHeight: 1.7, marginBottom: '1rem' }}>
                We grew tired of commercial restaurant biriyanis that tasted like boiled rice mixed with generic curry gravy. True biriyani is a battle of timing, fire intensity, and steam pressure.
              </p>
              <p style={{ color: '#d1d5db', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                At Rambo Biriyani, every grain of long aged rice absorbs the deep juices of meat, bone marrow, ghee, and whole roasted spices inside our locked handis. When the dough seal breaks, the aroma fills the room — a signature war cry for hungry foodies.
              </p>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--rambo-red-bright)' }}>500,000+</div>
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Plates Served</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--spice-amber)' }}>100%</div>
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Wood-Fired Dum</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--rambo-red-bright)' }}>30 Mins</div>
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Fresh Batch Cycle</div>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <img
                src="/images/rambo-biriyani-showcase.jpg"
                alt="Rambo Biriyani Master Kitchen"
                style={{
                  borderRadius: 'var(--radius-xl)',
                  width: '100%',
                  height: '380px',
                  objectFit: 'cover',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.9), 0 0 25px rgba(225, 29, 36, 0.35)',
                  border: '1px solid var(--border-gold)',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Culinary Pillars */}
      <section style={{ padding: '5rem 0', background: '#0e0807', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
            <span style={{ color: 'var(--spice-amber)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.85rem' }}>
              Our Kitchen Code
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#ffffff' }}>
              The Four Warrior Principles
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {pillars.map((p, idx) => (
              <div
                key={idx}
                style={{
                  background: '#150d0c',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2rem',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--spice-gold-bg)',
                    color: 'var(--spice-amber)',
                    border: '1px solid var(--border-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  {p.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                  {p.title}
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: '4.5rem 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '680px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: '0.75rem' }}>
            Ready to Taste the Fire?
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '1.05rem', marginBottom: '2rem' }}>
            Order online or drop by our Anna Nagar outlet to experience sizzling firewood dum biriyani straight from the pot.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn-order-online">
              <span>Explore Menu &rarr;</span>
            </Link>
            <Link to="/contact" className="btn-view-menu">
              <span>Find Our Kitchen</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
