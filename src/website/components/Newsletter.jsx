import React, { useState } from 'react';
import { Send, CheckCircle2, Flame } from 'lucide-react';
import Button from '../../components/common/Button';
import { validateEmail } from '../../utils/validators';

export const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setError(err);
      return;
    }

    setError('');
    setSubmitted(true);
  };

  return (
    <section style={{ padding: '4.5rem 0', background: '#090505', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div
          style={{
            background: 'radial-gradient(circle at center, rgba(225, 29, 36, 0.25) 0%, #150c0b 80%)',
            border: '2px solid var(--border-gold)',
            borderRadius: 'var(--radius-xl)',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.9), 0 0 25px rgba(225, 29, 36, 0.3)',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'var(--rambo-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#ffffff',
              boxShadow: '0 0 20px rgba(225, 29, 36, 0.6)',
            }}
          >
            <Flame size={28} />
          </div>

          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: '0.5rem', color: '#ffffff' }}>
            JOIN THE RAMBO BIRIYANI WARRIOR CLUB
          </h2>
          <p style={{ color: '#d1d5db', maxWidth: '560px', margin: '0 auto 1.75rem', fontSize: '1rem', lineHeight: 1.6 }}>
            Subscribe to get secret weekend dum timings, complimentary Chicken 65 drops, and festival pre-order passes.
          </p>

          {submitted ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1.5rem',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1.5px solid var(--success)',
                borderRadius: 'var(--radius-lg)',
                color: '#6ee7b7',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={20} />
              <span>Welcome Warrior! You are now subscribed to Rambo secret dum drops.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                maxWidth: '480px',
                margin: '0 auto',
                display: 'flex',
                gap: '0.65rem',
                flexWrap: 'wrap',
              }}
            >
              <input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                style={{
                  flex: 1,
                  minWidth: '240px',
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-full)',
                  border: error ? '2px solid var(--danger)' : '1px solid var(--border-gold)',
                  backgroundColor: '#1c110f',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
              <Button
                type="submit"
                variant="primary"
                style={{
                  padding: '0.85rem 1.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 800,
                }}
                rightIcon={<Send size={16} />}
              >
                Join Clan
              </Button>
            </form>
          )}

          {error && (
            <p style={{ color: '#fca5a5', fontSize: '0.85rem', marginTop: '0.65rem', fontWeight: 600 }}>
              {error}
            </p>
          )}

          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1.25rem' }}>
            Zero spam. Unsubscribe at any time. True dum biriyani only.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
