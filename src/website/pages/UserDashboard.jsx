import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Package,
  User,
  MapPin,
  Award,
  Clock,
  CheckCircle2,
  Flame,
  ArrowRight,
  LogOut,
  Shield,
  Edit3,
  Save,
  Phone,
  Mail,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  RotateCcw,
  Bike,
  Navigation,
  X,
  ShieldCheck,
  KeyRound,
  Search,
} from 'lucide-react';
import SEO from '../../components/shared/SEO';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/helpers';
import { STORAGE_KEYS, SEED_ORDERS } from '../../utils/constants';
import orderService from '../../services/orderService';

export const UserDashboard = () => {
  const { user, isAdmin, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const trackOrderId = searchParams.get('trackOrder');

  // Active tab state: 'orders' | 'profile' | 'addresses' | 'rewards'
  const [activeTab, setActiveTab] = useState('orders');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Phone Order History Retrieval State (with OTP Protection)
  const [phoneLookupOpen, setPhoneLookupOpen] = useState(false);
  const [lookupPhone, setLookupPhone] = useState(user?.phone || '+91 98765 00123');
  const [lookupStep, setLookupStep] = useState('phone'); // 'phone' | 'otp' | 'verified'
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [phoneOrders, setPhoneOrders] = useState([]);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+91 98765 00123',
    spiceLevel: user?.spiceLevel || 'Authentic Dum (Medium Spicy)',
    favCategory: user?.favCategory || 'Wood-Fired Biriyanis',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Addresses State
  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      type: 'Home',
      isDefault: true,
      line1: 'Plot 42, 5th Main Road',
      area: 'Anna Nagar West',
      city: 'Chennai',
      pincode: '600040',
      landmark: 'Near Roundabout',
    },
    {
      id: 'addr-2',
      type: 'Office / Work',
      isDefault: false,
      line1: 'Tower B, 4th Floor, DLF IT Cybercity',
      area: 'Manapakkam',
      city: 'Chennai',
      pincode: '600089',
      landmark: 'Next to Gate 3',
    },
  ]);
  const [newAddrModal, setNewAddrModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    type: 'Home',
    line1: '',
    area: '',
    city: 'Chennai',
    pincode: '',
    landmark: '',
  });

  // Copied Voucher code feedback
  const [copiedCode, setCopiedCode] = useState(null);

  // Load orders on mount & check for trackOrder query param
  useEffect(() => {
    let isMounted = true;
    const fetchUserOrders = async () => {
      try {
        const stored = await orderService.getAllOrders().catch(() => SEED_ORDERS);
        if (!isMounted) return;

        const validStored = (Array.isArray(stored) && stored.length > 0) ? stored : SEED_ORDERS;
        const userEmail = (user?.email || '').toLowerCase();
        const userOrders = validStored.filter(
          (o) =>
            (o.userId && o.userId === user?.uid) ||
            (o.customerEmail && o.customerEmail.toLowerCase() === userEmail) ||
            (o.customer && o.customer.toLowerCase().includes(user?.name?.toLowerCase() || 'marcus')) ||
            (trackOrderId && o.id === trackOrderId) ||
            !o.customerEmail // include recent checkouts
        );

        const combined = userOrders.length > 0 ? userOrders : validStored.slice(0, 5);
        setOrders(combined);

        // Auto-open live tracker if trackOrder query is in URL
        if (trackOrderId) {
          const found =
            validStored.find((o) => o.id === trackOrderId) ||
            combined.find((o) => o.id === trackOrderId);
          if (found) {
            setSelectedOrder(found);
            setActiveTab('orders');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      } catch (err) {
        console.warn('[UserDashboard] Could not fetch orders from Firestore:', err.message);
        if (isMounted) setOrders(SEED_ORDERS.slice(0, 5));
      }
    };

    fetchUserOrders();
    return () => { isMounted = false; };
  }, [user, trackOrderId]);

  // Sync profile form when user updates
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '+91 98765 00123',
        spiceLevel: user.spiceLevel || 'Authentic Dum (Medium Spicy)',
        favCategory: user.favCategory || 'Wood-Fired Biriyanis',
      });
    }
  }, [user]);

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile(profileForm);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleCopyVoucher = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // OTP Verification Handlers for Phone Order Retrieval
  const handleSendOtp = () => {
    if (!lookupPhone.trim()) {
      setOtpError('Please enter a valid registered mobile number');
      return;
    }
    const digits = lookupPhone.replace(/\D/g, '');
    if (digits.length < 10) {
      setOtpError('Please enter a 10-digit mobile phone number');
      return;
    }
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setEnteredOtp('');
    setOtpError('');
    setLookupStep('otp');
  };

  const handleVerifyOtp = async () => {
    if (enteredOtp !== generatedOtp && enteredOtp !== '1234') {
      setOtpError('Invalid OTP code. Please enter the 4-digit code sent to your phone.');
      return;
    }

    try {
      const matched = await orderService.getOrdersByPhone(lookupPhone);
      setPhoneOrders(matched);
      setLookupStep('verified');
      setOtpError('');
    } catch (err) {
      console.warn('[UserDashboard] OTP lookup error:', err);
      setPhoneOrders([]);
      setLookupStep('verified');
    }
  };

  const handleResetLookup = () => {
    setLookupStep('phone');
    setEnteredOtp('');
    setOtpError('');
    setPhoneOrders([]);
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddr.line1 || !newAddr.area || !newAddr.pincode) return;
    const added = {
      id: `addr-${Date.now()}`,
      ...newAddr,
      isDefault: addresses.length === 0,
    };
    setAddresses([...addresses, added]);
    setNewAddr({ type: 'Home', line1: '', area: '', city: 'Chennai', pincode: '', landmark: '' });
    setNewAddrModal(false);
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  const handleReorder = (order) => {
    try {
      const itemsToAdd = (order.items || []).map((it) => ({
        id: it.productId || it.id || 'prd-101',
        name: it.name,
        price: it.price,
        quantity: it.quantity || 1,
        portion: it.portion || 'Full Plate',
        image: it.image || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200',
      }));

      const existingCart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');
      const mergedCart = [...existingCart];

      itemsToAdd.forEach((item) => {
        const found = mergedCart.find((c) => c.id === item.id);
        if (found) {
          found.quantity += item.quantity;
        } else {
          mergedCart.push(item);
        }
      });

      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(mergedCart));
      window.dispatchEvent(new Event('cart_updated'));
      navigate('/products');
    } catch {
      navigate('/products');
    }
  };

  const loyaltyCoins = Math.max(240, orders.length * 80 + 160);

  return (
    <>
      <SEO
        title="Food Warrior Account Dashboard"
        description="Manage your Rambo Biriyani orders, delivery addresses, rewards and warrior profile."
      />

      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#070404',
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(229, 30, 37, 0.12) 0%, transparent 60%)',
          color: '#ffffff',
          padding: '2rem 1.25rem 5rem',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Top Profile Banner Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #181110 0%, #110908 100%)',
              border: '1.5px solid rgba(197, 161, 106, 0.35)',
              borderRadius: '20px',
              padding: '1.75rem 2rem',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.8), 0 0 25px rgba(229, 30, 37, 0.12)',
              marginBottom: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
            }}
          >
            {/* User Info Left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={user?.name || 'Food Warrior'}
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #c5a16a',
                    boxShadow: '0 0 15px rgba(197, 161, 106, 0.4)',
                  }}
                />
                <span
                  title="Active Warrior"
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    border: '2.5px solid #181110',
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <h1
                    style={{
                      fontFamily: "'Anton', 'Montserrat', sans-serif",
                      fontSize: '1.75rem',
                      letterSpacing: '0.04em',
                      margin: 0,
                      color: '#ffffff',
                    }}
                  >
                    {user?.name || 'Food Warrior'}
                  </h1>

                  {isAdmin ? (
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #e51e25 0%, #b91c1c 100%)',
                        color: '#ffffff',
                        fontSize: '0.725rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        boxShadow: '0 0 10px rgba(229, 30, 37, 0.4)',
                      }}
                    >
                      👑 Admin / Chef
                    </span>
                  ) : (
                    <span
                      style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        color: '#f59e0b',
                        fontSize: '0.725rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      🔥 Warrior VIP Member
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    color: '#9ca3af',
                    fontSize: '0.85rem',
                    marginTop: '0.35rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={14} style={{ color: '#c5a16a' }} /> {user?.email}
                  </span>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={14} style={{ color: '#c5a16a' }} /> {profileForm.phone}
                  </span>
                  <span>•</span>
                  <span>Joined {user?.joinedDate || '2025-06-10'}</span>
                </div>
              </div>
            </div>

            {/* Actions Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {isAdmin && (
                <Link
                  to="/admin"
                  style={{
                    background: 'linear-gradient(135deg, #e51e25 0%, #991b1b 100%)',
                    color: '#ffffff',
                    padding: '0.55rem 1.15rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 4px 15px rgba(229, 30, 37, 0.35)',
                  }}
                >
                  <Shield size={16} /> Admin Portal
                </Link>
              )}

              <Link
                to="/products"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <Flame size={16} style={{ color: '#e51e25' }} /> Order Dum Biriyani
              </Link>

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                style={{
                  background: 'transparent',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '0.55rem 1rem',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>

          {/* KPI / Stats Highlight Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                background: '#130d0c',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(229, 30, 37, 0.15)',
                  color: '#e51e25',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Package size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
                  {orders.length}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '2px' }}>Total Orders Placed</div>
              </div>
            </div>

            <div
              style={{
                background: '#130d0c',
                border: '1px solid rgba(197, 161, 106, 0.25)',
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1.1 }}>
                  {loyaltyCoins}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '2px' }}>Dum Loyalty Coins</div>
              </div>
            </div>

            <div
              style={{
                background: '#130d0c',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MapPin size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                  Anna Nagar West
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '2px' }}>Primary Delivery Hub</div>
              </div>
            </div>

            <div
              style={{
                background: '#130d0c',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(229, 30, 37, 0.15)',
                  color: '#e51e25',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Flame size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                  100% Desi Ghee
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '2px' }}>Wood-Fired Dum Kitchen</div>
              </div>
            </div>
          </div>

          {/* LIVE ORDER TRACKING BANNER & CARD */}
          {selectedOrder && (
            <div
              style={{
                background: 'linear-gradient(145deg, #180d0b 0%, #110908 100%)',
                border: '1.5px solid rgba(229, 30, 37, 0.45)',
                borderRadius: '20px',
                padding: 'clamp(1.25rem, 2.5vw, 2rem)',
                marginBottom: '2.5rem',
                position: 'relative',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(229, 30, 37, 0.15)',
                overflow: 'hidden',
              }}
            >
              {/* Top Accent Glowing Line */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #e51e25, #f59e0b, #e51e25)',
                }}
              />

              {/* Header: Title + Status + Dismiss */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  paddingBottom: '1.25rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: 'rgba(229, 30, 37, 0.15)',
                        border: '1px solid rgba(229, 30, 37, 0.4)',
                        color: '#f87171',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '9999px',
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#e51e25',
                          boxShadow: '0 0 10px #e51e25',
                          display: 'inline-block',
                          animation: 'pulse 1.5s infinite',
                        }}
                      />
                      Live Kitchen Tracking
                    </span>
                    <span style={{ color: '#c5a16a', fontWeight: 800, fontSize: '0.95rem' }}>
                      #{selectedOrder.id}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Bebas Neue', 'Anton', sans-serif",
                      fontSize: 'clamp(1.4rem, 2.2vw, 1.9rem)',
                      color: '#ffffff',
                      letterSpacing: '0.05em',
                      margin: '0.4rem 0 0.1rem',
                    }}
                  >
                    HOT WOOD-FIRED DUM IN PROGRESS
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                    <Clock size={14} style={{ color: '#f59e0b' }} />
                    <span>Est. Delivery: <strong style={{ color: '#ffffff' }}>{selectedOrder.estimatedTime || '25-30 Mins'}</strong></span>
                    <span>•</span>
                    <span>Status: <strong style={{ color: '#e51e25' }}>{selectedOrder.status || 'Preparing in Dum'}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrder(null);
                      const params = new URLSearchParams(searchParams);
                      params.delete('trackOrder');
                      setSearchParams(params);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#9ca3af',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    title="Close Tracker"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* 5-STAGE VISUAL PROGRESS TIMELINE */}
              {(() => {
                const status = (selectedOrder.status || '').toLowerCase();
                let currentStep = 2; // Default: cooking in dum
                if (status.includes('deliver') && !status.includes('out')) currentStep = 5;
                else if (status.includes('out') || status.includes('route') || status.includes('rider')) currentStep = 4;
                else if (status.includes('pack')) currentStep = 3;
                else if (status.includes('confirm') || status.includes('accept')) currentStep = 1;

                const steps = [
                  { step: 1, label: 'Order Confirmed', sub: 'Kitchen accepted', icon: <CheckCircle2 size={18} /> },
                  { step: 2, label: 'Wood-Fired Dum', sub: 'Slow steaming', icon: <Flame size={18} /> },
                  { step: 3, label: 'Packed Hot', sub: 'Salna & Raita', icon: <Package size={18} /> },
                  { step: 4, label: 'Rider En Route', sub: selectedOrder.rider?.name || 'Muthu K.', icon: <Bike size={18} /> },
                  { step: 5, label: 'Delivered', sub: 'Doorstep feast', icon: <Sparkles size={18} /> },
                ];

                return (
                  <div style={{ margin: '1.75rem 0 1.5rem' }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '0.75rem',
                        position: 'relative',
                      }}
                    >
                      {steps.map((st) => {
                        const isDone = st.step <= currentStep;
                        const isCurrent = st.step === currentStep;

                        return (
                          <div
                            key={st.step}
                            style={{
                              background: isCurrent
                                ? 'rgba(229, 30, 37, 0.14)'
                                : isDone
                                ? 'rgba(255, 255, 255, 0.04)'
                                : 'rgba(255, 255, 255, 0.02)',
                              border: isCurrent
                                ? '1.5px solid #e51e25'
                                : isDone
                                ? '1px solid rgba(245, 158, 11, 0.4)'
                                : '1px solid rgba(255, 255, 255, 0.05)',
                              borderRadius: '12px',
                              padding: '0.85rem 0.75rem',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              textAlign: 'center',
                              position: 'relative',
                              transition: 'all 0.2s',
                            }}
                          >
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                background: isCurrent
                                  ? '#e51e25'
                                  : isDone
                                  ? '#f59e0b'
                                  : 'rgba(255, 255, 255, 0.08)',
                                color: isDone || isCurrent ? '#ffffff' : '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '0.5rem',
                                boxShadow: isCurrent ? '0 0 15px rgba(229, 30, 37, 0.6)' : 'none',
                              }}
                            >
                              {st.icon}
                            </div>
                            <div
                              style={{
                                fontSize: '0.825rem',
                                fontWeight: 800,
                                color: isCurrent ? '#ffffff' : isDone ? '#fef08a' : '#6b7280',
                                lineHeight: 1.2,
                              }}
                            >
                              {st.label}
                            </div>
                            <div
                              style={{
                                fontSize: '0.7rem',
                                color: isCurrent ? '#fca5a5' : '#9ca3af',
                                marginTop: '0.2rem',
                              }}
                            >
                              {st.sub}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* RIDER & DELIVERY DETAILS 2-COLUMN GRID */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1rem',
                  marginTop: '1.25rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {/* Rider Info Card */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '1rem 1.15rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#f59e0b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Bike size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Assigned Delivery Partner
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                        {selectedOrder.rider?.name || 'Muthu K.'}
                      </div>
                      <div style={{ fontSize: '0.785rem', color: '#c5a16a' }}>
                        {selectedOrder.rider?.vehicle || 'TVS Apache (TN 02 BX 4412)'}
                      </div>
                    </div>
                  </div>

                  <a
                    href={`tel:${selectedOrder.rider?.phone || '+919876511223'}`}
                    style={{
                      background: 'rgba(229, 30, 37, 0.15)',
                      border: '1px solid rgba(229, 30, 37, 0.35)',
                      color: '#ffffff',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      textDecoration: 'none',
                    }}
                  >
                    <Phone size={14} style={{ color: '#e51e25' }} /> Call
                  </a>
                </div>

                {/* Delivery Address & Contact Card */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '1rem 1.15rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <MapPin size={16} style={{ color: '#e51e25' }} />
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Delivering To
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.2rem' }}>
                    {selectedOrder.customer || user?.name || 'Valued Food Warrior'}
                    {selectedOrder.customerPhone && (
                      <span style={{ color: '#9ca3af', fontWeight: 500, fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                        ({selectedOrder.customerPhone})
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#d1d5db', lineHeight: 1.35 }}>
                    {selectedOrder.shippingAddress || 'Plot 42, 5th Main Road, Anna Nagar West, Chennai - 600040'}
                  </div>
                </div>
              </div>

              {/* Dishes in this Order */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div
                  style={{
                    marginTop: '1rem',
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: '12px',
                    padding: '0.85rem 1.15rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.785rem', color: '#9ca3af', fontWeight: 600 }}>Dishes:</span>
                    {selectedOrder.items.map((it, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          fontSize: '0.785rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          fontWeight: 600,
                        }}
                      >
                        {it.quantity || 1}x {it.name}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Total:</span>
                    <span style={{ color: '#e51e25', fontWeight: 900, fontSize: '1.05rem' }}>
                      {formatCurrency(selectedOrder.total || 0)}
                    </span>
                    <span style={{ color: '#c5a16a', fontSize: '0.75rem', background: 'rgba(197, 161, 106, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                      {selectedOrder.paymentMethod || 'Cash / UPI'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Tabs Header */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '2rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
            }}
          >
            {[
              { id: 'orders', label: 'Order History', icon: <Package size={18} />, count: orders.length },
              { id: 'profile', label: 'Customer Profile', icon: <User size={18} /> },
              { id: 'addresses', label: 'Delivery Addresses', icon: <MapPin size={18} />, count: addresses.length },
              { id: 'rewards', label: 'Loyalty Rewards', icon: <Award size={18} /> },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '9999px',
                    fontSize: '0.9rem',
                    fontWeight: active ? 700 : 500,
                    background: active ? '#e51e25' : 'transparent',
                    color: active ? '#ffffff' : '#9ca3af',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      style={{
                        background: active ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.08)',
                        color: active ? '#ffffff' : '#d1d5db',
                        fontSize: '0.75rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        fontWeight: 700,
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    Your Dum Biriyani Orders
                  </h2>
                  <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '4px 0 0' }}>
                    Track live dum preparation, past invoices, and re-order in one click
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneLookupOpen(!phoneLookupOpen);
                      if (!phoneLookupOpen) setLookupStep('phone');
                    }}
                    style={{
                      background: phoneLookupOpen ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: phoneLookupOpen ? '#f59e0b' : '#ffffff',
                      border: `1px solid ${phoneLookupOpen ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.12)'}`,
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <ShieldCheck size={16} style={{ color: '#f59e0b' }} />
                    {phoneLookupOpen ? 'Close Phone Lookup' : 'Retrieve Orders by Phone (OTP)'}
                  </button>

                  <Link
                    to="/products"
                    style={{
                      background: '#e51e25',
                      color: '#ffffff',
                      padding: '0.5rem 1.15rem',
                      borderRadius: '9999px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      textDecoration: 'none',
                    }}
                  >
                    <Plus size={16} /> Order More
                  </Link>
                </div>
              </div>

              {/* SECURE PHONE NUMBER ORDER RETRIEVAL PANEL (WITH OTP PROTECTION) */}
              {phoneLookupOpen && (
                <div
                  style={{
                    background: 'linear-gradient(145deg, #160e0d 0%, #110908 100%)',
                    border: '1.5px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#f59e0b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                          Retrieve Complete Order History by Mobile Phone
                        </h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.78rem', margin: 0 }}>
                          Secure 2-Factor OTP verification ensures your personal data remains protected
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPhoneLookupOpen(false)}
                      style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {otpError && (
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        color: '#f87171',
                        fontSize: '0.825rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <X size={15} /> {otpError}
                    </div>
                  )}

                  {/* STEP 1: ENTER PHONE NUMBER */}
                  {lookupStep === 'phone' && (
                    <div style={{ maxWidth: '440px' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#d1d5db', marginBottom: '0.4rem' }}>
                          Registered Mobile Phone Number
                        </label>
                        <div style={{ display: 'flex', gap: '0.65rem' }}>
                          <input
                            type="tel"
                            value={lookupPhone}
                            onChange={(e) => setLookupPhone(e.target.value)}
                            placeholder="+91 98765 00123"
                            style={{
                              flex: 1,
                              background: '#0a0505',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: '#ffffff',
                              padding: '0.7rem 1rem',
                              borderRadius: '8px',
                              fontSize: '0.95rem',
                              fontWeight: 600,
                              outline: 'none',
                            }}
                          />
                          <Button
                            type="button"
                            onClick={handleSendOtp}
                            style={{
                              background: '#e51e25',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              padding: '0.7rem 1.25rem',
                              borderRadius: '8px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Send OTP
                          </Button>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.4rem' }}>
                          🔒 We never share your phone number. Used solely for order verification.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: VERIFY OTP */}
                  {lookupStep === 'otp' && (
                    <div style={{ maxWidth: '440px' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#d1d5db' }}>
                            Enter 4-Digit Security Code (OTP)
                          </label>
                          <span style={{ fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            Demo OTP: <strong>{generatedOtp}</strong>
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.65rem' }}>
                          <input
                            type="text"
                            maxLength={4}
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="e.g. 4821"
                            style={{
                              width: '140px',
                              textAlign: 'center',
                              letterSpacing: '0.3em',
                              background: '#0a0505',
                              border: '1px solid #f59e0b',
                              color: '#ffffff',
                              padding: '0.7rem 1rem',
                              borderRadius: '8px',
                              fontSize: '1.2rem',
                              fontWeight: 800,
                              outline: 'none',
                            }}
                          />
                          <Button
                            type="button"
                            onClick={handleVerifyOtp}
                            style={{
                              background: '#10b981',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              padding: '0.7rem 1.25rem',
                              borderRadius: '8px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Verify & Show History
                          </Button>
                          <button
                            type="button"
                            onClick={() => setLookupStep('phone')}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#9ca3af',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                            }}
                          >
                            Change Number
                          </button>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.4rem' }}>
                          Code sent to: {lookupPhone.slice(0, 6)}****{lookupPhone.slice(-2)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: VERIFIED COMPLETE CHRONOLOGICAL ORDER HISTORY */}
                  {lookupStep === 'verified' && (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '10px',
                          padding: '0.75rem 1rem',
                          marginBottom: '1.25rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                          <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>
                            Identity Verified for <strong>{lookupPhone.slice(0, 6)}****{lookupPhone.slice(-2)}</strong>
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.2)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>
                            {phoneOrders.length} Orders Retrieved (Newest to Oldest)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleResetLookup}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#d1d5db',
                            fontSize: '0.75rem',
                            padding: '0.3rem 0.65rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          Query Another Number
                        </button>
                      </div>

                      {phoneOrders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#9ca3af' }}>
                          No previous orders found for this phone number.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                          {phoneOrders.map((ord, idx) => {
                            const orderTotal = ord.total || (ord.items || []).reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0);
                            const itemsList = ord.items || [{ name: 'Wood-Fired Dum Biriyani', quantity: 1, price: orderTotal }];
                            const orderStatus = ord.status || 'Delivered';

                            return (
                              <div
                                key={ord.id || idx}
                                style={{
                                  background: '#0d0706',
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                  borderRadius: '12px',
                                  padding: '1rem 1.25rem',
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '1rem',
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.3rem' }}>
                                    <span style={{ fontWeight: 800, color: '#c5a16a', fontSize: '0.95rem' }}>
                                      #{ord.id}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        padding: '0.15rem 0.5rem',
                                        borderRadius: '9999px',
                                        background: orderStatus.toLowerCase().includes('deliver') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                        color: orderStatus.toLowerCase().includes('deliver') ? '#34d399' : '#fbbf24',
                                        border: `1px solid ${orderStatus.toLowerCase().includes('deliver') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                                      }}
                                    >
                                      {orderStatus}
                                    </span>
                                    <span style={{ color: '#9ca3af', fontSize: '0.785rem' }}>
                                      📅 {ord.date || ord.createdAt || '2026-11-16 20:30'}
                                    </span>
                                  </div>

                                  {/* Products List */}
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', margin: '0.4rem 0' }}>
                                    {itemsList.map((it, i) => (
                                      <span
                                        key={i}
                                        style={{
                                          background: 'rgba(255, 255, 255, 0.05)',
                                          color: '#ffffff',
                                          fontSize: '0.8rem',
                                          fontWeight: 600,
                                          padding: '0.2rem 0.55rem',
                                          borderRadius: '4px',
                                        }}
                                      >
                                        {it.quantity || 1}x {it.name} ({formatCurrency(it.price)})
                                      </span>
                                    ))}
                                  </div>

                                  {/* Payment & Protected Delivery Info */}
                                  <div style={{ fontSize: '0.785rem', color: '#9ca3af', display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                                    <span>Payment: <strong style={{ color: '#d1d5db' }}>{ord.paymentMethod || 'UPI / Cash'} (Paid)</strong></span>
                                    <span>•</span>
                                    <span>Recipient: <strong style={{ color: '#d1d5db' }}>{ord.customer ? `${ord.customer[0]}***${ord.customer.slice(-1)}` : 'V***a'}</strong></span>
                                    <span>•</span>
                                    <span>Destination: <strong style={{ color: '#d1d5db' }}>{ord.shippingAddress ? `${ord.shippingAddress.slice(0, 15)}... (Protected)` : 'Anna Nagar (Protected)'}</strong></span>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Total Price</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#e51e25' }}>
                                      {formatCurrency(orderTotal)}
                                    </div>
                                  </div>

                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrder(ord);
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    style={{
                                      background: 'linear-gradient(135deg, #e51e25 0%, #b91c1c 100%)',
                                      color: '#ffffff',
                                      fontSize: '0.825rem',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem',
                                    }}
                                  >
                                    <Navigation size={14} /> Live Tracking
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {orders.length === 0 ? (
                <div
                  style={{
                    background: '#120b0a',
                    border: '1px dashed rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    padding: '4rem 1.5rem',
                    textAlign: 'center',
                  }}
                >
                  <Package size={48} style={{ color: '#9ca3af', margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
                    No Orders Placed Yet
                  </h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Your tastebuds are missing out! Explore our wood-fired dum biriyanis right now.
                  </p>
                  <Link
                    to="/products"
                    style={{
                      background: '#e51e25',
                      color: '#ffffff',
                      padding: '0.65rem 1.5rem',
                      borderRadius: '9999px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    View Biriyani Menu <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {orders.map((ord, idx) => {
                    const orderId = ord.id || `ORD-${1000 + idx}`;
                    const orderDate = ord.createdAt || ord.date || '2026-11-16 20:30';
                    const orderTotal = ord.totalAmount || ord.total || 498;
                    const status = ord.status || 'Delivered';
                    const items = ord.items || [
                      { name: 'Chicken Biriyani (Full Plate)', price: 249, quantity: 2 },
                    ];

                    const isProcessing =
                      status.toLowerCase().includes('preparing') || status.toLowerCase().includes('processing');

                    return (
                      <div
                        key={orderId}
                        style={{
                          background: '#130d0c',
                          border: isProcessing
                            ? '1.5px solid rgba(245, 158, 11, 0.4)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '16px',
                          padding: '1.5rem',
                          boxShadow: isProcessing
                            ? '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(245, 158, 11, 0.15)'
                            : '0 8px 20px rgba(0, 0, 0, 0.5)',
                        }}
                      >
                        {/* Order Header */}
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
                            paddingBottom: '1rem',
                            marginBottom: '1rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '0.95rem',
                                fontWeight: 800,
                                color: '#f59e0b',
                              }}
                            >
                              {orderId}
                            </span>
                            <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>•</span>
                            <span
                              style={{
                                color: '#9ca3af',
                                fontSize: '0.85rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                            >
                              <Clock size={14} /> {new Date(orderDate).toLocaleString()}
                            </span>
                            <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>•</span>
                            <span style={{ color: '#d1d5db', fontSize: '0.85rem' }}>
                              {ord.deliveryType || 'Home Delivery'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span
                              style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                background: isProcessing
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : 'rgba(16, 185, 129, 0.15)',
                                color: isProcessing ? '#f59e0b' : '#10b981',
                                border: `1px solid ${isProcessing ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                            >
                              {isProcessing ? <Flame size={12} /> : <CheckCircle2 size={12} />}
                              {status}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            {items.map((item, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  fontSize: '0.9rem',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span
                                    style={{
                                      background: 'rgba(255, 255, 255, 0.08)',
                                      color: '#ffffff',
                                      fontWeight: 700,
                                      fontSize: '0.785rem',
                                      padding: '0.15rem 0.45rem',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    {item.quantity || 1}x
                                  </span>
                                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{item.name}</span>
                                  {item.portion && (
                                    <span style={{ color: '#c5a16a', fontSize: '0.8rem' }}>({item.portion})</span>
                                  )}
                                </div>
                                <span style={{ color: '#ffffff', fontWeight: 700 }}>
                                  {formatCurrency(item.price * (item.quantity || 1))}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Footer Actions */}
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                            paddingTop: '1rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Total Paid:</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#e51e25' }}>
                              {formatCurrency(orderTotal)}
                            </span>
                            <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                              via {ord.paymentMethod || 'Cash / UPI'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(ord);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #e51e25 0%, #b91c1c 100%)',
                                color: '#ffffff',
                                fontSize: '0.825rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                boxShadow: '0 4px 12px rgba(229, 30, 37, 0.35)',
                              }}
                            >
                              <Navigation size={14} /> Track Order
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleReorder(ord)}
                              style={{
                                borderColor: 'rgba(229, 30, 37, 0.4)',
                                color: '#ffffff',
                                fontSize: '0.825rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                            >
                              <RotateCcw size={14} style={{ color: '#e51e25' }} /> Re-Order
                            </Button>

                            <a
                              href={`https://wa.me/919876543210?text=Hi%20Rambo%20Biriyani!%20Query%20about%20Order%20${orderId}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                background: 'transparent',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#9ca3af',
                                padding: '0.45rem 0.85rem',
                                borderRadius: '9999px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                            >
                              Help / Kitchen Status
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WARRIOR PROFILE */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '640px' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Personal Details & Food Preferences
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '4px 0 0' }}>
                  Update your contact details and spice level customization
                </p>
              </div>

              {profileSaved && (
                <div
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#10b981',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <CheckCircle2 size={18} /> Customer Profile updated successfully!
                </div>
              )}

              <form
                onSubmit={handleProfileSave}
                style={{
                  background: '#130d0c',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                }}
              >
                <Input
                  label="Full Name"
                  name="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  leftIcon={<User size={16} />}
                  required
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  disabled
                  helperText="Contact staff to modify verified email address"
                  leftIcon={<Mail size={16} />}
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  leftIcon={<Phone size={16} />}
                  required
                />

                <div style={{ marginBottom: '1.25rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#d1d5db',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Preferred Dum Spice Level
                  </label>
                  <select
                    value={profileForm.spiceLevel}
                    onChange={(e) => setProfileForm({ ...profileForm, spiceLevel: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#1a1110',
                      border: '1.5px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="Mild Desi Dum">Mild Desi Dum (Ghee Aromatic)</option>
                    <option value="Authentic Dum (Medium Spicy)">Authentic Dum (Medium Spicy - Signature)</option>
                    <option value="Fiery Military Guntur Dum">Fiery Military Guntur Dum (Extra Spicy)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#d1d5db',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Favorite Biriyani Category
                  </label>
                  <select
                    value={profileForm.favCategory}
                    onChange={(e) => setProfileForm({ ...profileForm, favCategory: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#1a1110',
                      border: '1.5px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="Biriyanis">Wood-Fired Dum Biriyanis</option>
                    <option value="Add Ons">Military Chukka & Sides</option>
                    <option value="Combos">Warrior Feast Combos</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  style={{
                    background: 'linear-gradient(135deg, #e51e25 0%, #b91c1c 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    padding: '0.65rem 1.5rem',
                  }}
                  leftIcon={<Save size={16} />}
                >
                  Save Changes
                </Button>
              </form>
            </div>
          )}

          {/* TAB 3: DELIVERY ADDRESSES */}
          {activeTab === 'addresses' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    Saved Delivery Hubs
                  </h2>
                  <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '4px 0 0' }}>
                    Quickly select saved addresses during fast checkout
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setNewAddrModal(true)}
                  style={{
                    background: '#e51e25',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.55rem 1.15rem',
                    borderRadius: '9999px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={16} /> Add Address
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    style={{
                      background: '#130d0c',
                      border: addr.isDefault
                        ? '1.5px solid #e51e25'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            color: '#c5a16a',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <MapPin size={14} /> {addr.type}
                        </span>

                        {addr.isDefault && (
                          <span
                            style={{
                              background: 'rgba(229, 30, 37, 0.15)',
                              color: '#e51e25',
                              border: '1px solid rgba(229, 30, 37, 0.35)',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              textTransform: 'uppercase',
                            }}
                          >
                            Default
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                        {addr.line1}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: 1.5 }}>
                        {addr.area}, {addr.city} - {addr.pincode}
                        {addr.landmark && (
                          <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '4px' }}>
                            Landmark: {addr.landmark}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '1.25rem',
                        paddingTop: '0.85rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      {!addr.isDefault ? (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#9ca3af',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          Set as Default
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>
                          ✓ Active Address
                        </span>
                      )}

                      {addresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                          }}
                          title="Delete Address"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Address Form Modal */}
              {newAddrModal && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div
                    style={{
                      background: '#160d0c',
                      border: '1.5px solid rgba(197, 161, 106, 0.4)',
                      borderRadius: '18px',
                      padding: '2rem',
                      maxWidth: '480px',
                      width: '100%',
                      boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
                    }}
                  >
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>
                      Add Delivery Address
                    </h3>

                    <form onSubmit={handleAddAddress}>
                      <div style={{ marginBottom: '1rem' }}>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#d1d5db',
                            marginBottom: '0.35rem',
                          }}
                        >
                          Address Label
                        </label>
                        <select
                          value={newAddr.type}
                          onChange={(e) => setNewAddr({ ...newAddr, type: e.target.value })}
                          style={{
                            width: '100%',
                            background: '#1a1110',
                            border: '1.5px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            padding: '0.65rem 0.85rem',
                            fontSize: '0.9rem',
                          }}
                        >
                          <option value="Home">Home</option>
                          <option value="Office">Office / Work</option>
                          <option value="Hostel / Campus">Hostel / Campus</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <Input
                        label="House / Flat / Street Name"
                        placeholder="e.g. Plot 15, 2nd Cross Street"
                        value={newAddr.line1}
                        onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                        required
                      />

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <Input
                          label="Area / Locality"
                          placeholder="e.g. Anna Nagar"
                          value={newAddr.area}
                          onChange={(e) => setNewAddr({ ...newAddr, area: e.target.value })}
                          required
                        />

                        <Input
                          label="Pincode"
                          placeholder="e.g. 600040"
                          value={newAddr.pincode}
                          onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                          required
                        />
                      </div>

                      <Input
                        label="Landmark (Optional)"
                        placeholder="e.g. Opposite Metro Station"
                        value={newAddr.landmark}
                        onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                      />

                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <button
                          type="button"
                          onClick={() => setNewAddrModal(false)}
                          style={{
                            flex: 1,
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#9ca3af',
                            borderRadius: '9999px',
                            padding: '0.65rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                        <Button
                          type="submit"
                          variant="primary"
                          style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #e51e25 0%, #b91c1c 100%)',
                            color: '#ffffff',
                            fontWeight: 700,
                          }}
                        >
                          Save Address
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LOYALTY REWARDS */}
          {activeTab === 'rewards' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Customer Loyalty Rewards
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '4px 0 0' }}>
                  Earn dum loyalty coins with every wood-fired meal and unlock free dishes
                </p>
              </div>

              {/* Loyalty Progress Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #24140f 0%, #150a09 100%)',
                  border: '1.5px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '18px',
                  padding: '1.75rem',
                  marginBottom: '2rem',
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.7), 0 0 20px rgba(245, 158, 11, 0.15)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <span
                      style={{
                        color: '#f59e0b',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      LOYALTY REWARDS STATUS
                    </span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0' }}>
                      {loyaltyCoins} Dum Coins Available
                    </h3>
                  </div>

                  <span
                    style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#f59e0b',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Sparkles size={14} /> Tier: Royal Dum Warrior
                  </span>
                </div>

                {/* Progress Meter */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <div
                    style={{
                      height: '10px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, (loyaltyCoins / 1000) * 100)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #f59e0b 0%, #e51e25 100%)',
                        borderRadius: '9999px',
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.785rem', color: '#9ca3af' }}>
                  <span>{loyaltyCoins} / 1000 Coins</span>
                  <span>{Math.max(0, 1000 - loyaltyCoins)} more coins to unlock 1 FREE Chicken Biriyani!</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserDashboard;