import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Bike,
  MessageCircle,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  User,
  Phone,
  Mail,
  CreditCard,
  Sparkles,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency, getWhatsAppOrderLink } from '../../utils/helpers';
import { APP_CONFIG, STORAGE_KEYS } from '../../utils/constants';
import orderService from '../../services/orderService';
import '../styles/website.css';
import '../styles/responsive.css';

export const WebsiteLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, register } = useAuth();

  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [deliveryType, setDeliveryType] = useState('Home Delivery');
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Checkout flow state: 'cart' | 'details'
  const [checkoutStep, setCheckoutStep] = useState('cart');
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: 'Plot 42, 5th Main Road, Anna Nagar West, Chennai',
    pincode: '600040',
    landmark: 'Near Roundabout',
    paymentMethod: 'Cash on Delivery',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync user details into checkout form
  useEffect(() => {
    if (user) {
      setCheckoutForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '+91 98765 00123',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Reset checkout step when cart drawer closes
  useEffect(() => {
    if (!cartOpen) {
      setCheckoutStep('cart');
      setFormErrors({});
    }
  }, [cartOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Load cart from storage
  const syncCart = () => {
    const raw = localStorage.getItem('rambo_cart');
    setCart(raw ? JSON.parse(raw) : []);
  };

  useEffect(() => {
    syncCart();
    window.addEventListener('cartUpdated', syncCart);
    return () => window.removeEventListener('cartUpdated', syncCart);
  }, []);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('rambo_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = (id, delta) => {
    const updated = cart
      .map((item) => {
        if (item.id === id) {
          const nextQty = item.quantity + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : null;
        }
        return item;
      })
      .filter(Boolean);
    saveCart(updated);
  };

  const removeItem = (id) => {
    saveCart(cart.filter((item) => item.id !== id));
  };

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryType === 'Home Delivery' ? (subtotal > 499 ? 0 : 40) : 0;
  const grandTotal = subtotal + deliveryFee;

  // Build WhatsApp pre-filled order string
  const buildWhatsAppMessage = () => {
    let msg = `🔥 *NEW ORDER - RAMBO BIRIYANI* 🔥\n\n`;
    msg += `*Delivery Mode:* ${deliveryType}\n`;
    msg += `*Items:*\n`;
    cart.forEach((it, idx) => {
      msg += `${idx + 1}. ${it.name} x ${it.quantity} = ₹${it.price * it.quantity}\n`;
    });
    msg += `\n*Subtotal:* ₹${subtotal}`;
    if (deliveryFee > 0) msg += `\n*Delivery Fee:* ₹${deliveryFee}`;
    msg += `\n*Grand Total:* ₹${grandTotal}\n\n`;
    msg += `Please confirm my order and let me know the preparation time!`;
    return msg;
  };

  const handleProceedToDetails = () => {
    if (cart.length === 0) return;
    setCheckoutStep('details');
  };

  const handleConfirmOrder = async (e) => {
    e?.preventDefault();
    const errors = {};
    if (!checkoutForm.name?.trim()) errors.name = 'Please enter your full name';
    if (!checkoutForm.phone?.trim()) errors.phone = 'Please enter mobile number';
    if (!checkoutForm.email?.trim()) errors.email = 'Please enter email address';
    if (!checkoutForm.address?.trim()) errors.address = 'Please enter delivery address';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      // Auto-register/authenticate if guest
      if (!isAuthenticated) {
        try {
          await register(checkoutForm.name, checkoutForm.email, 'warrior123');
        } catch {
          // If already exists or error, continue with guest order
        }
      }

      const fullAddress = `${checkoutForm.address}, ${checkoutForm.pincode}${
        checkoutForm.landmark ? ` (Landmark: ${checkoutForm.landmark})` : ''
      }`;

      const newOrderPayload = {
        userId: user?.uid || null,
        customer: checkoutForm.name,
        customerEmail: checkoutForm.email,
        customerPhone: checkoutForm.phone,
        shippingAddress: fullAddress,
        deliveryType,
        paymentMethod: checkoutForm.paymentMethod,
        status: 'Preparing in Dum',
        total: grandTotal,
        totalAmount: grandTotal,
        itemsCount: totalItemsCount,
        items: cart,
        estimatedTime: '25-30 mins',
        rider: {
          name: 'Muthu K.',
          phone: '+91 98765 11223',
          vehicle: 'TVS Apache (TN 02 BX 4412)',
        },
      };

      // Create order in Firestore
      const placedOrder = await orderService.createOrder(newOrderPayload);

      // Clear cart
      saveCart([]);
      setCartOpen(false);
      setCheckoutStep('cart');

      // Navigate directly to user account dashboard with order tracker
      navigate(`/account?trackOrder=${placedOrder.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hide footer when a product is showing (product details page)
  const isProductDetailPage = /^\/products?\/[^/]+/.test(pathname);
  // Hide navbar and footer on auth / login / admin login pages
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <div className="website-wrapper">
      {!isAuthPage && <Navbar cartCount={totalItemsCount} onOpenCart={() => setCartOpen(true)} />}

      <main className="website-main">
        <Outlet />
      </main>

      {!isProductDetailPage && !isAuthPage && <Footer />}

      {/* Interactive Cart Drawer */}
      {cartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-modal)', display: 'flex', justifyContent: 'flex-end' }}>
          {/* Backdrop */}
          <div
            onClick={() => setCartOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(5px)',
            }}
          />

          {/* Drawer Sidebar */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '440px',
              height: '100vh',
              background: '#120b0a',
              borderLeft: '2px solid var(--border-gold)',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10,
              animation: 'drawerSlide 0.25s ease-out',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {checkoutStep === 'details' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      cursor: 'pointer',
                      padding: '0.2rem',
                      display: 'flex',
                    }}
                    title="Back to Cart Items"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    Customer & Delivery Details
                  </h3>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <ShoppingBag size={22} style={{ color: 'var(--rambo-red-bright)' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    Food Warrior Cart ({totalItemsCount})
                  </h3>
                </div>
              )}

              <button
                onClick={() => setCartOpen(false)}
                style={{ color: '#9ca3af', padding: '0.4rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content / Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {checkoutStep === 'details' ? (
                /* STEP 2: FILL CUSTOMER DETAILS */
                <form id="checkout-customer-form" onSubmit={handleConfirmOrder}>
                  {!isAuthenticated && (
                    <div
                      style={{
                        background: 'linear-gradient(135deg, rgba(229, 30, 37, 0.15) 0%, rgba(197, 161, 106, 0.1) 100%)',
                        border: '1px solid rgba(229, 30, 37, 0.3)',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                        marginBottom: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                      }}
                    >
                      <Sparkles size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
                      <div style={{ fontSize: '0.785rem', color: '#e5e7eb', lineHeight: 1.4 }}>
                        Your <strong>Food Warrior Account</strong> will be created automatically so you can track your live wood-fired dum preparation!
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: '0.25rem' }}>
                    <Input
                      label="Customer Full Name *"
                      placeholder="e.g. Vikramaditya S."
                      value={checkoutForm.name}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                      error={formErrors.name}
                      leftIcon={<User size={16} />}
                      containerStyle={{ marginBottom: '0.75rem' }}
                      required
                    />

                    <Input
                      label="Contact Mobile Number *"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={checkoutForm.phone}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                      error={formErrors.phone}
                      leftIcon={<Phone size={16} />}
                      containerStyle={{ marginBottom: '0.75rem' }}
                      required
                    />

                    <Input
                      label="Email Address (for Order Invoice & Tracking) *"
                      type="email"
                      placeholder="vikram@domain.com"
                      value={checkoutForm.email}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                      error={formErrors.email}
                      leftIcon={<Mail size={16} />}
                      containerStyle={{ marginBottom: '0.75rem' }}
                      required
                    />

                    <Input
                      label="Delivery Address (Flat / House & Street) *"
                      placeholder="Plot 42, 5th Main Road"
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                      error={formErrors.address}
                      leftIcon={<MapPin size={16} />}
                      containerStyle={{ marginBottom: '0.75rem' }}
                      required
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                      <Input
                        label="Pincode *"
                        placeholder="600040"
                        value={checkoutForm.pincode}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, pincode: e.target.value })}
                        containerStyle={{ marginBottom: '0.75rem' }}
                        required
                      />
                      <Input
                        label="Landmark"
                        placeholder="Opp. Metro"
                        value={checkoutForm.landmark}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, landmark: e.target.value })}
                        containerStyle={{ marginBottom: '0.75rem' }}
                      />
                    </div>

                    {/* Payment Mode Selection */}
                    <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#d1d5db', marginBottom: '0.45rem' }}>
                        Choose Payment Method
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {[
                          { id: 'Cash on Delivery', label: '💵 Cash on Delivery' },
                          { id: 'UPI / Online (GPay, PhonePe)', label: '📱 UPI / QR Code' },
                        ].map((m) => {
                          const active = checkoutForm.paymentMethod === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: m.id })}
                              style={{
                                padding: '0.65rem 0.5rem',
                                borderRadius: '10px',
                                border: active ? '1.5px solid #e51e25' : '1px solid rgba(255, 255, 255, 0.1)',
                                background: active ? 'rgba(229, 30, 37, 0.15)' : '#18100f',
                                color: active ? '#ffffff' : '#9ca3af',
                                fontSize: '0.785rem',
                                fontWeight: active ? 700 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                              }}
                            >
                              {m.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </form>
              ) : cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                  <ShoppingBag size={48} style={{ color: 'var(--border-subtle)', margin: '0 auto 1rem' }} />
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                    Your cart is starving!
                  </h4>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Explore our legendary firewood dum biriyanis and add your favorites.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setCartOpen(false);
                    }}
                  >
                    View Biriyani Menu
                  </Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Delivery Mode Toggle */}
                  <div
                    style={{
                      display: 'flex',
                      background: '#1a100f',
                      padding: '0.35rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <button
                      onClick={() => setDeliveryType('Home Delivery')}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        background: deliveryType === 'Home Delivery' ? 'var(--rambo-red)' : 'transparent',
                        color: '#ffffff',
                      }}
                    >
                      🛵 Home Delivery
                    </button>
                    <button
                      onClick={() => setDeliveryType('Takeaway')}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        background: deliveryType === 'Takeaway' ? 'var(--rambo-red)' : 'transparent',
                        color: '#ffffff',
                      }}
                    >
                      🛍️ Takeaway Pick-up
                    </button>
                  </div>

                  {/* Cart Item Cards */}
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        padding: '0.85rem',
                        background: '#18100f',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--spice-amber)', marginTop: '2px' }}>
                          {formatCurrency(item.price)} each
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: '#291816',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Minus size={13} />
                        </button>
                        <span style={{ fontWeight: 800, minWidth: '18px', textAlign: 'center', fontSize: '0.9rem' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: 'var(--rambo-red)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Breakdown & Order Buttons */}
            {cart.length > 0 && !orderSuccess && (
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderTop: '1px solid var(--border-subtle)',
                  background: '#0c0706',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.4rem' }}>
                  <span>Item Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.65rem' }}>
                  <span>Delivery ({deliveryType})</span>
                  <span style={{ color: deliveryFee === 0 ? 'var(--success)' : '#ffffff' }}>
                    {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginBottom: '1.25rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <span>Total Due</span>
                  <span style={{ color: 'var(--rambo-red-bright)' }}>{formatCurrency(grandTotal)}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {checkoutStep === 'details' ? (
                    <Button
                      type="submit"
                      form="checkout-customer-form"
                      variant="primary"
                      size="lg"
                      fullWidth
                      isLoading={isSubmitting}
                      style={{
                        background: 'linear-gradient(135deg, #e51e25 0%, #b91c1c 100%)',
                        color: '#ffffff',
                        fontWeight: 800,
                        boxShadow: '0 4px 18px rgba(229, 30, 37, 0.45)',
                      }}
                      rightIcon={<Flame size={18} />}
                    >
                      Confirm & Dispatch Dum Order ({formatCurrency(grandTotal)})
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={handleProceedToDetails}
                        style={{
                          background: 'linear-gradient(135deg, #e51e25 0%, #b91c1c 100%)',
                          color: '#ffffff',
                          fontWeight: 800,
                          boxShadow: '0 4px 18px rgba(229, 30, 37, 0.45)',
                        }}
                      >
                        Place Cash / UPI Order ({formatCurrency(grandTotal)})
                      </Button>

                      {/* WhatsApp Order Button with prefilled cart details */}
                      <a
                        href={getWhatsAppOrderLink(APP_CONFIG.WHATSAPP_NUMBER, buildWhatsAppMessage())}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: '#25D366',
                          color: '#ffffff',
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.65rem',
                          fontSize: '0.9rem',
                          boxShadow: '0 4px 15px rgba(37, 211, 102, 0.35)',
                        }}
                      >
                        <MessageCircle size={18} fill="#ffffff" color="#25D366" />
                        <span>Order via WhatsApp</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <style>{`
            @keyframes drawerSlide {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default WebsiteLayout;
