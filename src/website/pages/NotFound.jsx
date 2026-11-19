import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, ArrowLeft, Home, UtensilsCrossed } from 'lucide-react';
import SEO from '../../components/shared/SEO';
import Button from '../../components/common/Button';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO title="404 Page Not Found" description="The page you requested could not be located." />

      <section
        style={{
          minHeight: 'calc(100vh - var(--header-height) - 150px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '520px' }}>
          <div
            style={{
              fontSize: '6.5rem',
              fontWeight: 900,
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              lineHeight: 1,
              color: 'var(--rambo-red-bright)',
              textShadow: '0 0 30px rgba(225, 29, 36, 0.6)',
              marginBottom: '0.5rem',
            }}
          >
            404
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: '0.75rem', color: '#ffffff' }}>
            THIS DUM POT HAS RUN COLD
          </h1>

          <p style={{ color: '#9ca3af', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            The dish or page you are looking for has been relocated or was consumed by our hungry kitchen warriors.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="md"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <Link to="/">
              <Button variant="primary" size="md" leftIcon={<Home size={16} />}>
                Return to Kitchen
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default NotFound;
