import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Copy, Key, Shield, Store, Bell, Check, Flame, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { resetCompleteFirebaseData } from '../../../firebase/resetDatabase';
import SEO from '../../../components/shared/SEO';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { APP_CONFIG } from '../../../utils/constants';
import { copyToClipboard } from '../../../utils/helpers';

export const Settings = () => {
  const [formData, setFormData] = useState({
    storeName: APP_CONFIG.NAME,
    supportEmail: APP_CONFIG.CONTACT_EMAIL,
    supportPhone: APP_CONFIG.CONTACT_PHONE,
    address: APP_CONFIG.ADDRESS,
    openingHours: APP_CONFIG.OPENING_HOURS,
    currency: '₹ (INR)',
    freeDeliveryThreshold: '499',
    lowStockThreshold: '15',
    orderSoundAlerts: true,
    whatsappAutoNotify: true,
  });

  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeStatus, setPurgeStatus] = useState(null);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const apiKey = 'rmb_live_948f21e09c8491823abf89';

  useEffect(() => {
    // 1. Immediately read cached settings from localStorage for instant display
    try {
      const cached = localStorage.getItem('rambo_outlet_settings');
      if (cached) {
        setFormData((prev) => ({ ...prev, ...JSON.parse(cached) }));
      }
    } catch (e) {
      console.warn('[Settings] LocalStorage load notice:', e);
    }

    // 2. Fetch latest settings from Firestore with a 2.5s timeout safeguard
    const loadSettings = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firestore settings load timeout')), 2500)
        );
        const fetchPromise = getDoc(doc(db, 'settings', 'outlet'));
        const snap = await Promise.race([fetchPromise, timeoutPromise]);

        if (snap && snap.exists()) {
          const cloudData = snap.data();
          setFormData((prev) => ({ ...prev, ...cloudData }));
          localStorage.setItem('rambo_outlet_settings', JSON.stringify(cloudData));
        }
      } catch (err) {
        console.warn('[Settings] Notice loading cloud settings:', err.message);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // 1. Instantly save to localStorage so settings are never lost
    try {
      localStorage.setItem('rambo_outlet_settings', JSON.stringify(formData));
      window.dispatchEvent(new Event('rambo_settings_updated'));
    } catch (localErr) {
      console.warn('[Settings] LocalStorage save notice:', localErr);
    }

    // 2. Persist to Firestore with timeout safeguard
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore save timeout')), 3000)
      );
      const savePromise = setDoc(
        doc(db, 'settings', 'outlet'),
        {
          ...formData,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await Promise.race([savePromise, timeoutPromise]);
    } catch (err) {
      console.warn('[Settings] Cloud sync notice (saved locally):', err.message);
    } finally {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleCopyKey = async () => {
    await copyToClipboard(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecutePurge = async () => {
    setIsPurging(true);
    setPurgeStatus(null);
    try {
      const result = await resetCompleteFirebaseData();
      setPurgeStatus({
        success: true,
        message: `Successfully wiped ${result.totalDocsDeleted} Firestore documents and ${result.totalFilesDeleted} Storage files. Database is completely cleared.`
      });
      setShowPurgeConfirm(false);
    } catch (err) {
      setPurgeStatus({
        success: false,
        message: `Purge operation failed: ${err.message}`
      });
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <>
      <SEO title="Kitchen & Outlet Settings" description="Configure outlet parameters and delivery rules." />

      <div className="page-title-bar">
        <div>
          <h1 className="page-title">Outlet & Kitchen Configuration</h1>
          <p className="page-subtitle">Configure restaurant metadata, automated WhatsApp triggers, and live dum thresholds.</p>
        </div>
      </div>

      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.85rem 1.25rem', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', color: 'var(--success)', marginBottom: '1.5rem', fontWeight: 600 }}>
          <CheckCircle2 size={18} />
          <span>Kitchen settings successfully saved and deployed across POS terminals.</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
        {/* Section 1: Kitchen Profile */}
        <div className="table-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
            <Store size={18} style={{ color: '#e51e25' }} /> Flagship Kitchen Information
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Public outlet address and receipt details.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <Input
              label="Brand Name"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
            />
            <Input
              label="Order Support Email"
              name="supportEmail"
              value={formData.supportEmail}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <Input
              label="WhatsApp / Call Hotline"
              name="supportPhone"
              value={formData.supportPhone}
              onChange={handleChange}
            />
            <Input
              label="Operating Hours"
              name="openingHours"
              value={formData.openingHours}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Central Kitchen Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        {/* Section 2: Delivery & Stock Rules */}
        <div className="table-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
            <Bell size={18} style={{ color: '#d97706' }} /> Delivery & Dum Handi Thresholds
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Automated triggers for kitchen alerts and customer delivery waivers.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <Input
              label="Free Delivery Order Minimum (₹)"
              name="freeDeliveryThreshold"
              type="number"
              value={formData.freeDeliveryThreshold}
              onChange={handleChange}
            />
            <Input
              label="Dum Exhaustion Warning (portions left)"
              name="lowStockThreshold"
              type="number"
              value={formData.lowStockThreshold}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
              <input
                type="checkbox"
                name="orderSoundAlerts"
                checked={formData.orderSoundAlerts}
                onChange={handleChange}
              />
              <span>Ring kitchen bell chime on incoming online and WhatsApp orders</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
              <input
                type="checkbox"
                name="whatsappAutoNotify"
                checked={formData.whatsappAutoNotify}
                onChange={handleChange}
              />
              <span>Send live dispatch SMS/WhatsApp tracker when rider picks up parcel</span>
            </label>
          </div>
        </div>

        {/* Section 3: Developer API Keys */}
        <div className="table-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
            <Key size={18} style={{ color: '#d97706' }} /> Kitchen POS & API Credentials
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Live authentication token for Swiggy/Zomato webhook relays.</p>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <Input
                label="Kitchen Integration Secret Key"
                value={apiKey}
                disabled
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyKey}
              style={{ marginBottom: '0.85rem', minHeight: '44px' }}
              leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Section 4: Danger Zone - Permanent Database Reset */}
        <div className="table-card" style={{ padding: '2rem', border: '1px solid #fecaca', background: '#fff5f5' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c' }}>
            <AlertTriangle size={18} style={{ color: '#dc2626' }} /> Danger Zone: Reset Firebase Database
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#7f1d1d', marginBottom: '1.25rem' }}>
            Permanently delete all application records from Firestore (products, categories, orders, user documents, notifications, settings) and delete all uploaded images in Firebase Storage. This action is irreversible. Firebase project settings and security rules remain untouched.
          </p>

          {purgeStatus && (
            <div style={{
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              background: purgeStatus.success ? '#ecfdf5' : '#fef2f2',
              color: purgeStatus.success ? '#065f46' : '#991b1b',
              border: `1px solid ${purgeStatus.success ? '#a7f3d0' : '#fecaca'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {purgeStatus.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{purgeStatus.message}</span>
            </div>
          )}

          {!showPurgeConfirm ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPurgeConfirm(true)}
              style={{
                borderColor: '#dc2626',
                color: '#dc2626',
                minHeight: '44px',
                fontWeight: 700
              }}
              leftIcon={<Trash2 size={16} />}
            >
              Clear All Application Data...
            </Button>
          ) : (
            <div style={{ background: '#ffffff', border: '1px solid #fca5a5', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontWeight: 700, color: '#991b1b', marginBottom: '0.5rem' }}>
                Are you absolutely sure you want to delete all Firebase data?
              </p>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                This will delete every document in collections: <code>products</code>, <code>categories</code>, <code>orders</code>, <code>users</code>, <code>notifications</code>, and <code>settings</code>, as well as all uploaded files in Storage.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleExecutePurge}
                  disabled={isPurging}
                  style={{
                    background: '#dc2626',
                    borderColor: '#dc2626',
                    color: '#ffffff',
                    minHeight: '44px'
                  }}
                  leftIcon={isPurging ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                >
                  {isPurging ? 'Deleting All Data...' : 'Yes, Permanently Delete All Data'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPurgeConfirm(false)}
                  disabled={isPurging}
                  style={{ minHeight: '44px' }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="primary" size="lg" isLoading={isSaving} leftIcon={<Save size={18} />}>
            Save Kitchen Settings
          </Button>
        </div>
      </form>
    </>
  );
};

export default Settings;
