import React, { useState } from 'react';
import { MapPin, Phone, Clock, MessageCircle, Send, CheckCircle2, Navigation, Utensils } from 'lucide-react';
import SEO from '../../components/shared/SEO';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { APP_CONFIG } from '../../utils/constants';
import { getWhatsAppOrderLink } from '../../utils/helpers';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    outlet: 'Anna Nagar (Central Kitchen)',
    guests: '2',
    date: '',
    time: 'Lunch (12:30 PM)',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const outlets = [
    {
      name: 'Central Firewood Kitchen (Flagship)',
      address: '123, Food Street, Anna Nagar, Chennai - 600040',
      phone: '+91 98765 43210',
      hours: '11:00 AM - 11:00 PM (Daily)',
      features: 'Dine-In, Takeaway & 45-Min Home Delivery',
    },
    {
      name: 'T. Nagar Express Outlet',
      address: '45, Usman Road, Opposite Ranganathan St, T. Nagar, Chennai',
      phone: '+91 98765 43211',
      hours: '11:30 AM - 11:00 PM',
      features: 'Fast Takeaway Counter & Parcel Service',
    },
    {
      name: 'OMR IT Corridor Cloud Kitchen',
      address: '88, Rajiv Gandhi Salai, Sholinganallur, Chennai - 600119',
      phone: '+91 98765 43212',
      hours: '11:00 AM - 1:00 AM (Late Night Delivery)',
      features: 'Express Tech Park Delivery & Midnight Cravings',
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <SEO
        title="Outlets & Dine-In"
        description="Visit Rambo Biriyani kitchens across Chennai or order online for fast home delivery."
      />

      {/* Header Banner */}
      <section style={{ padding: '4.5rem 0 3.5rem', background: '#0e0807', borderBottom: '1px solid var(--border-subtle)', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <span style={{ color: 'var(--rambo-red-bright)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.85rem' }}>
            Chennai Kitchens & Outlets
          </span>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', fontStyle: 'italic', margin: '0.5rem 0' }}>
            FIND YOUR NEAREST DUM STATION
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#d1d5db' }}>
            Savor steaming firewood biriyani right off the brass handi at our live kitchen outlets.
          </p>
        </div>
      </section>

      {/* Outlets Grid */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            {outlets.map((outlet, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--gradient-card)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '2rem',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--rambo-red)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      {outlet.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--spice-amber)', fontWeight: 700 }}>
                      {outlet.features}
                    </span>
                  </div>
                </div>

                <p style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                  {outlet.address}
                </p>

                <div style={{ fontSize: '0.85rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} style={{ color: 'var(--spice-amber)' }} />
                  <span>{outlet.hours}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <a
                    href={`tel:${outlet.phone.replace(/\s+/g, '')}`}
                    className="btn-view-menu"
                    style={{ flex: 1, justifyContent: 'center', padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                  >
                    <Phone size={15} />
                    <span>Call Outlet</span>
                  </a>
                  <a
                    href={getWhatsAppOrderLink(
                      APP_CONFIG.WHATSAPP_NUMBER,
                      `Hi Rambo Biriyani, I want to order takeaway from ${outlet.name}!`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-order-online"
                    style={{ flex: 1, justifyContent: 'center', padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Table Reservation / Pre-order Box */}
          <div
            style={{
              background: '#140c0b',
              borderRadius: 'var(--radius-xl)',
              padding: '3rem',
              border: '1px solid var(--border-gold)',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span className="badge badge-rambo" style={{ marginBottom: '0.5rem' }}>Dine-In & Pre-Order</span>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 900, fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#ffffff' }}>
                Reserve a Dum Table or Pre-Book
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                Visiting during peak weekend hours? Reserve your table and fresh handi in advance.
              </p>
            </div>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <CheckCircle2 size={48} style={{ color: 'var(--success)', margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                  Reservation Request Received!
                </h4>
                <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                  Our outlet host will call {formData.phone} within 10 minutes to confirm your table.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Your Name"
                    name="name"
                    placeholder="Raghavan S."
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Input
                    label="Contact Phone"
                    name="phone"
                    placeholder="+91 98765 00000"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    type="select"
                    label="Preferred Outlet"
                    name="outlet"
                    value={formData.outlet}
                    onChange={(e) => setFormData({ ...formData, outlet: e.target.value })}
                    options={outlets.map((o) => ({ value: o.name, label: o.name }))}
                  />

                  <Input
                    type="select"
                    label="Table Size / Guests"
                    name="guests"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    options={[
                      { value: '2', label: '2 Guests' },
                      { value: '4', label: '4 Guests' },
                      { value: '6', label: '6 - 8 Large Family Table' },
                      { value: '10+', label: '10+ Party Table' },
                    ]}
                  />
                </div>

                <Input
                  label="Special Requests (e.g. Extra spicy / Bone marrow pieces / High chair)"
                  name="notes"
                  placeholder="Tell our chef your preferences..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  style={{ marginTop: '0.75rem' }}
                >
                  Confirm Table Reservation
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
