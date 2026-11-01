import React, { useState, useEffect } from 'react';
import { 
  Building2, Bot, ShieldCheck, CreditCard, Clock, CheckCircle2, 
  AlertTriangle, Phone, FileText, ChevronRight, Mic, 
  Check, RefreshCw, Smartphone, TrendingUp, Users, MapPin, 
  ArrowRight, ShieldAlert, Sparkles, Send, Download, LogIn, LogOut, Lock, KeyRound
} from 'lucide-react';

const API_BASE = "http://127.0.0.1:8000";

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(null); // { email, role, name, portal }
  const [authRole, setAuthRole] = useState('business'); // 'business' | 'admin'
  const [loginEmail, setLoginEmail] = useState('owner@balajidental.in');
  const [loginPass, setLoginPass] = useState('password123');
  const [authLoading, setAuthLoading] = useState(false);

  // Interface active view (Synced with user role)
  const [activeTab, setActiveTab] = useState('portal'); // 'portal' | 'ops'
  const [lang, setLang] = useState('en'); // 'en' | 'hi'

  // Owner Portal Step state
  const [step, setStep] = useState(1);

  // Business profile input
  const [profile, setProfile] = useState({
    businessType: 'Dental Clinic',
    employees: 3,
    sites: 1,
    city: 'Kochi',
    cityTier: 2,
    hasGstin: true,
    gstin: '32TTNXB7384T1ZW',
    phone: '9845012345',
    customerName: 'Dr. Vivek Menon',
    businessName: 'Balaji Dental Care LLP'
  });

  // Recommendation State (Powered by Grok AI + Catalogue)
  const [recommendation, setRecommendation] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [contractMonths, setContractMonths] = useState(12);

  // KYC state
  const [kycConsent, setKycConsent] = useState(false);
  const [kycResults, setKycResults] = useState({});

  // Paytm Sandbox Payment state
  const [paytmData, setPaytmData] = useState(null);
  const [paytmModalOpen, setPaytmModalOpen] = useState(false);
  const [paytmProcessing, setPaytmProcessing] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [orderData, setOrderData] = useState(null);

  // Order Tracker chat
  const [orderQuery, setOrderQuery] = useState('');
  const [orderChatHistory, setOrderChatHistory] = useState([
    { sender: 'bot', text: 'Hello! I am your Accel Service Assistant. Ask me anything regarding your installation schedule, technician details, or paperwork.' }
  ]);

  // Ops Console State
  const [opsData, setOpsData] = useState(null);

  // Login handler
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, role: authRole })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setActiveTab(data.user.portal === 'ops' ? 'ops' : 'portal');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Fetch Grok AI recommendations
  const fetchRecommendation = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/advisor/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_type: profile.businessType,
          employee_count: profile.employees,
          num_sites: profile.sites,
          city: profile.city,
          city_tier: profile.cityTier,
          has_gstin: profile.hasGstin,
          gstin: profile.gstin,
          language: lang
        })
      });
      const data = await res.json();
      setRecommendation(data);
      const autoSel = data.addons.filter(a => a.recommended && a.eligible).map(a => a.product_id);
      setSelectedAddons(autoSel);
    } catch (e) {
      console.error("Failed to fetch recommendation", e);
    }
  };

  const fetchOpsData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ops/dashboard`);
      const data = await res.json();
      setOpsData(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'ops') {
      fetchOpsData();
    }
  }, [activeTab]);

  // Handle KYC Document upload
  const handleKycUpload = async (docType, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_type", docType);
    formData.append("expected_name", profile.businessName);
    if (profile.hasGstin && profile.gstin) {
      formData.append("expected_gstin", profile.gstin);
    }

    try {
      const res = await fetch(`${API_BASE}/api/kyc/analyze`, {
        method: "POST",
        body: formData
      });
      const result = await res.json();
      setKycResults(prev => ({ ...prev, [docType]: result }));
    } catch (e) {
      console.error("KYC OCR error:", e);
    }
  };

  // Calculate live price
  const calculateTotal = () => {
    if (!recommendation || !recommendation.main_product) return { monthly: 0, setup: 0 };
    let monthly = Number(recommendation.main_product.price_min_inr_per_month) || 0;
    let setup = Number(recommendation.main_product.one_time_setup_inr) || 0;

    selectedAddons.forEach(pid => {
      const p = recommendation.addons.find(a => a.product_id === pid);
      if (p) {
        monthly += Number(p.price_min_inr_per_month) || 0;
        setup += Number(p.one_time_setup_inr) || 0;
      }
    });

    if (contractMonths === 12) {
      monthly = Math.round(monthly * 0.9);
    }

    return { monthly, setup };
  };

  // 1. Initiate Paytm Sandbox Payment
  const initiatePaytm = async () => {
    const total = calculateTotal();
    const tempOrderId = `ORD-${intTimestamp()}`;
    try {
      const res = await fetch(`${API_BASE}/api/payment/paytm/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: tempOrderId,
          amount: total.monthly + total.setup,
          customer_phone: profile.phone,
          customer_email: currentUser ? currentUser.email : "user@biz.in"
        })
      });
      const data = await res.json();
      setPaytmData(data);
      setPaytmModalOpen(true);
    } catch (e) {
      console.error("Paytm Initiate Error", e);
    }
  };

  // 2. Complete Paytm Sandbox Payment
  const confirmPaytmSandboxTxn = async () => {
    setPaytmProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/payment/paytm/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: paytmData.order_id,
          txn_token: paytmData.txn_token,
          status: "TXN_SUCCESS"
        })
      });
      const verifyData = await res.json();
      setPaymentSuccessData(verifyData);
      setPaytmModalOpen(false);

      // Create Order in DB
      const total = calculateTotal();
      const payload = {
        customer_name: profile.customerName,
        phone: profile.phone,
        business_name: profile.businessName,
        business_type: profile.businessType,
        city: profile.city,
        city_tier: profile.cityTier,
        bundle_name: `${recommendation.main_product.product_name} + ${selectedAddons.length} Digital Add-ons`,
        monthly_inr: total.monthly,
        setup_fee_inr: total.setup,
        contract_months: contractMonths,
        selected_products: [recommendation.main_product.product_id, ...selectedAddons],
        payment_method: "Paytm Gateway / UPI",
        payment_status: "SUCCESS",
        kyc_status: "VERIFIED"
      };

      const ordRes = await fetch(`${API_BASE}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const ord = await ordRes.json();
      setOrderData(ord);
      setStep(5);
    } catch (err) {
      console.error(err);
    } finally {
      setPaytmProcessing(false);
    }
  };

  // Query order AI assistant
  const handleOrderQuery = async (e) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    const userText = orderQuery;
    setOrderQuery('');
    setOrderChatHistory(prev => [...prev, { sender: 'user', text: userText }]);

    try {
      const res = await fetch(`${API_BASE}/api/orders/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderData ? orderData.order_id : "ORD-DEMO",
          query: userText
        })
      });
      const data = await res.json();
      setOrderChatHistory(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      console.error(err);
    }
  };

  const intTimestamp = () => Math.floor(Date.now() / 1000);
  const totals = calculateTotal();

  // If not logged in, render dual OAuth / Supabase login screen
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'radial-gradient(circle at 50% 20%, #1e293b 0%, #0a0e17 80%)' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <div className="brand-dot"></div>
              <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>Airtel SYNC · Udyam</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Select portal & sign in via Supabase / OAuth
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
            <button 
              type="button"
              className={`nav-pill ${authRole === 'business' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center', padding: '8px' }}
              onClick={() => {
                setAuthRole('business');
                setLoginEmail('owner@balajidental.in');
              }}
            >
              🏢 Business Portal
            </button>
            <button 
              type="button"
              className={`nav-pill ${authRole === 'admin' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center', padding: '8px' }}
              onClick={() => {
                setAuthRole('admin');
                setLoginEmail('admin@airtel.com');
              }}
            >
              🛡️ Admin / Ops
            </button>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Work Email / Mobile ID</label>
              <input 
                type="email" 
                required
                className="input-field" 
                style={{ marginTop: '4px' }}
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Password</label>
              <input 
                type="password" 
                required
                className="input-field" 
                style={{ marginTop: '4px' }}
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.85rem' }}
              disabled={authLoading}
            >
              {authLoading ? 'Authenticating...' : `Enter as ${authRole === 'admin' ? 'Airtel Ops Admin' : 'Business Owner'}`}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Or sign in with SSO</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn-secondary" 
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}
                onClick={() => handleLogin()}
              >
                ⚡ Supabase Auth
              </button>
              <button 
                className="btn-secondary" 
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}
                onClick={() => handleLogin()}
              >
                Google OAuth
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-dot"></div>
          <div>
            <div className="brand-heading">Airtel SYNC · Project Udyam Digital</div>
            <div className="brand-caption">
              {currentUser.role === 'admin' ? '🛡️ Enterprise Operations & Field Sales Console' : '🏪 Small Business One-Sitting Digital Onboarding'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {currentUser.role === 'admin' ? (
            <span className="tag tag-warning">Admin Console Mode</span>
          ) : (
            <div className="nav-pill-group">
              <button 
                className={`nav-pill ${activeTab === 'portal' ? 'active' : ''}`}
                onClick={() => setActiveTab('portal')}
              >
                Owner Portal
              </button>
              <button 
                className={`nav-pill ${activeTab === 'ops' ? 'active' : ''}`}
                onClick={() => setActiveTab('ops')}
              >
                Ops View
              </button>
            </div>
          )}

          <button 
            className="btn-secondary" 
            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
            onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
          >
            {lang === 'en' ? '🌐 English' : '🌐 हिन्दी'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', borderLeft: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentUser.name}</span>
            <button 
              className="btn-secondary" 
              style={{ padding: '6px 8px' }} 
              title="Sign Out"
              onClick={handleLogout}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      <div className="app-container">
        {/* =======================
            VIEW 1: OWNER PORTAL
        ======================== */}
        {activeTab === 'portal' && (
          <div>
            {/* Stepper */}
            <div className="stepper-bar">
              {[
                { n: 1, label: lang === 'hi' ? 'सलाहकार (Chat)' : '1. AI Advisor' },
                { n: 2, label: lang === 'hi' ? 'बंडल और कोट्स' : '2. Bundle & Quote' },
                { n: 3, label: lang === 'hi' ? 'डिजिटल केवाईसी' : '3. Smart KYC' },
                { n: 4, label: lang === 'hi' ? 'पेटीएम चेकआउट' : '4. Paytm Checkout' },
                { n: 5, label: lang === 'hi' ? 'ऑर्डर ट्रैकर' : '5. Order Tracker' }
              ].map(s => (
                <div 
                  key={s.n} 
                  className={`step-item ${step === s.n ? 'active' : ''} ${step > s.n ? 'completed' : ''}`}
                  onClick={() => s.n <= step && setStep(s.n)}
                  style={{ cursor: s.n <= step ? 'pointer' : 'default' }}
                >
                  <div className="step-num">{step > s.n ? '✓' : s.n}</div>
                  <div>{s.label}</div>
                </div>
              ))}
            </div>

            {/* STEP 1: AI ADVISOR (GROK AI POWERED) */}
            {step === 1 && (
              <div className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                      {lang === 'hi' ? 'एआई सलाहकार: बिना सेल्स कॉल तुरंत बंडल' : 'AI Advisor: Intelligent Needs Discovery'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                      Powered by Grok AI engine & Accel Business Product Catalogue.
                    </p>
                  </div>
                  <span className="tag tag-success">9.6% GSTIN Activation</span>
                </div>

                <div className="chat-window">
                  <div className="chat-bubble bot">
                    👋 <b>Namaste!</b> What business category best describes your establishment?
                    <div className="chip-container">
                      {['Kirana / Retail Store', 'Clinic / Pharmacy', 'CA / Lawyer Office', 'Restaurant / Multi-outlet', 'Small Workshop / Factory'].map(opt => (
                        <button 
                          key={opt} 
                          className="chip-btn"
                          onClick={() => setProfile(p => ({ ...p, businessType: opt }))}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="chat-bubble user">
                    Category: <b>{profile.businessType}</b>
                  </div>

                  <div className="chat-bubble bot">
                    Specify staff headcount and operating locations:
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Employees:</label>
                        <input 
                          type="number" 
                          min="1" 
                          className="input-field" 
                          style={{ width: '90px', marginTop: '4px' }}
                          value={profile.employees}
                          onChange={e => setProfile(p => ({ ...p, employees: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Locations / Outlets:</label>
                        <input 
                          type="number" 
                          min="1" 
                          className="input-field" 
                          style={{ width: '90px', marginTop: '4px' }}
                          value={profile.sites}
                          onChange={e => setProfile(p => ({ ...p, sites: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>City Tier:</label>
                        <select 
                          className="input-field" 
                          style={{ width: '120px', marginTop: '4px' }}
                          value={profile.cityTier}
                          onChange={e => setProfile(p => ({ ...p, cityTier: Number(e.target.value) }))}
                        >
                          <option value="1">Tier 1</option>
                          <option value="2">Tier 2</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="chat-bubble bot">
                    Do you have a registered GSTIN? (Unlocks high-SLA fibre & priority enterprise routing).
                    <div className="chip-container">
                      <button 
                        className={`chip-btn ${profile.hasGstin ? 'selected' : ''}`}
                        onClick={() => setProfile(p => ({ ...p, hasGstin: true }))}
                      >
                        ✓ Yes, have GSTIN
                      </button>
                      <button 
                        className={`chip-btn ${!profile.hasGstin ? 'selected' : ''}`}
                        onClick={() => setProfile(p => ({ ...p, hasGstin: false, gstin: '' }))}
                      >
                        No GSTIN (AirFiber FWA)
                      </button>
                    </div>

                    {profile.hasGstin && (
                      <div style={{ marginTop: '0.8rem' }}>
                        <input 
                          type="text" 
                          placeholder="e.g. 32TTNXB7384T1ZW" 
                          className="input-field"
                          value={profile.gstin}
                          onChange={e => setProfile(p => ({ ...p, gstin: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn-primary" 
                    onClick={async () => {
                      await fetchRecommendation();
                      setStep(2);
                    }}
                  >
                    Generate AI Bundle <Sparkles size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: BUNDLE QUOTE & ADDONS */}
            {step === 2 && recommendation && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
                <div>
                  <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className="tag tag-success">Grok AI Recommended · {recommendation.segment}</span>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '6px' }}>
                          {recommendation.main_product.product_name}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.9rem' }}>
                          {recommendation.main_product.description}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                          ₹{recommendation.main_product.price_min_inr_per_month}
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/mo</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Setup: ₹{recommendation.main_product.one_time_setup_inr || 0}
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(225, 25, 0, 0.08)', borderLeft: '3px solid var(--airtel-red)', padding: '0.8rem 1rem', marginTop: '1rem', borderRadius: '4px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#ff664b' }}>
                        Reasoning ({recommendation.ai_source}):
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#e5e7eb', marginTop: '2px' }}>
                        {recommendation.why}
                      </div>
                    </div>
                  </div>

                  {/* Add-ons */}
                  <div className="glass-panel">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Modular Add-ons (Catalogue Rules Enforced)</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      Add or remove services. Ineligible add-ons are locked per competition guidelines.
                    </p>

                    <div className="grid-cards">
                      {recommendation.addons.map(addon => {
                        const isSelected = selectedAddons.includes(addon.product_id);
                        return (
                          <div 
                            key={addon.product_id}
                            className={`prod-card ${isSelected ? 'selected' : ''} ${!addon.eligible ? 'disabled' : ''}`}
                            onClick={() => {
                              if (!addon.eligible) return;
                              setSelectedAddons(prev => 
                                isSelected ? prev.filter(x => x !== addon.product_id) : [...prev, addon.product_id]
                              );
                            }}
                            style={{ cursor: addon.eligible ? 'pointer' : 'not-allowed' }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{addon.category}</span>
                                {addon.recommended && <span className="tag tag-warning">Recommended</span>}
                              </div>
                              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '4px' }}>
                                {addon.product_name}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {addon.description}
                              </div>
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                ₹{addon.price_min_inr_per_month}
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/mo</span>
                              </div>
                              {addon.eligible ? (
                                <button className={`chip-btn ${isSelected ? 'selected' : ''}`}>
                                  {isSelected ? '✓ Added' : '+ Add'}
                                </button>
                              ) : (
                                <span className="tag tag-danger" style={{ fontSize: '0.65rem' }}>
                                  {addon.ineligibility_reason}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Summary Column */}
                <div>
                  <div className="glass-panel" style={{ position: 'sticky', top: '5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Quote Summary</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{recommendation.main_product.product_name}</span>
                        <span>₹{recommendation.main_product.price_min_inr_per_month}</span>
                      </div>
                      {selectedAddons.map(pid => {
                        const p = recommendation.addons.find(a => a.product_id === pid);
                        return p ? (
                          <div key={pid} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                            <span>{p.product_name}</span>
                            <span>₹{p.price_min_inr_per_month}</span>
                          </div>
                        ) : null;
                      })}
                    </div>

                    <div style={{ margin: '1rem 0' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contract Term:</label>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <button 
                          className={`nav-pill ${contractMonths === 1 ? 'active' : ''}`}
                          onClick={() => setContractMonths(1)}
                          style={{ flex: 1, padding: '4px' }}
                        >
                          Monthly
                        </button>
                        <button 
                          className={`nav-pill ${contractMonths === 12 ? 'active' : ''}`}
                          onClick={() => setContractMonths(12)}
                          style={{ flex: 1, padding: '4px' }}
                        >
                          12 Mo (10% OFF)
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, marginTop: '1rem' }}>
                      <span>Monthly Total:</span>
                      <span>₹{totals.monthly}/mo</span>
                    </div>

                    <button 
                      className="btn-primary" 
                      style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}
                      onClick={() => setStep(3)}
                    >
                      Proceed to Smart KYC <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SMART KYC & DPDP CONSENT */}
            {step === 3 && (
              <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Smart KYC & Identity Extraction</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Compliant with the DPDP Act 2023. Real-time OCR and fraud prevention.
                </p>

                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '1.25rem 0' }}>
                  <div style={{ fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={18} /> Purpose Limitation & Data Minimisation Notice
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#d1d5db', marginTop: '4px' }}>
                    Uploaded documents are analyzed only for service activation. Retained for 30 days then automatically purged.
                  </p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.8rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input 
                      type="checkbox" 
                      checked={kycConsent} 
                      onChange={e => setKycConsent(e.target.checked)} 
                    />
                    I give explicit consent for digital KYC verification.
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                  {[
                    { key: 'gst_certificate', title: '1. GST Certificate' },
                    { key: 'udyam_certificate', title: '2. Udyam Certificate' },
                    { key: 'signatory_id', title: '3. Signatory ID Proof' },
                    { key: 'address_proof', title: '4. Utility Bill (Max 90 days)' }
                  ].map(doc => (
                    <div key={doc.key} className="glass-panel" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{doc.title}</div>
                      <div style={{ marginTop: '0.8rem' }}>
                        <input 
                          type="file" 
                          accept="image/*"
                          disabled={!kycConsent}
                          onChange={e => {
                            if (e.target.files[0]) {
                              handleKycUpload(doc.key, e.target.files[0]);
                            }
                          }}
                        />
                      </div>

                      {kycResults[doc.key] && (
                        <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Status:</span>
                            <span className={kycResults[doc.key].status === 'VERIFIED' ? 'tag tag-success' : 'tag tag-danger'}>
                              {kycResults[doc.key].status}
                            </span>
                          </div>
                          {kycResults[doc.key].extracted_gstin && (
                            <div>GSTIN: <b>{kycResults[doc.key].extracted_gstin}</b></div>
                          )}
                          {kycResults[doc.key].issues && kycResults[doc.key].issues.length > 0 && (
                            <div style={{ color: 'var(--danger)', marginTop: '4px' }}>
                              ⚠️ {kycResults[doc.key].issues.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                  <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
                  <button 
                    className="btn-primary" 
                    disabled={!kycConsent}
                    onClick={() => setStep(4)}
                  >
                    Proceed to Paytm Checkout <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: PAYTM PAYMENT GATEWAY & UPI */}
            {step === 4 && (
              <div className="glass-panel" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <span className="tag tag-paytm" style={{ fontSize: '0.85rem' }}>Paytm Payment Gateway</span>
                  <span className="tag tag-warning">Sandbox Environment</span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Instant Checkout & AutoPay Mandate</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Pay 1st Month + Setup Fee securely via Paytm UPI / NetBanking / Cards.
                </p>

                <div style={{ margin: '1.5rem auto', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-md)', maxWidth: '400px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Amount Payable Now</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', margin: '0.5rem 0' }}>
                    ₹{totals.monthly + totals.setup}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                    ✓ 10% Discount on 12-Month Plan Applied
                  </div>

                  <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(0, 46, 110, 0.25)', border: '1px solid rgba(0, 185, 245, 0.3)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#00b9f5' }}>Paytm AutoPay Mandate</div>
                    <div style={{ fontSize: '0.75rem', color: '#d1d5db', marginTop: '2px' }}>
                      Subsequent months billed at ₹{totals.monthly}/mo automatically. Zero paper mandates.
                    </div>
                  </div>

                  <button 
                    className="btn-paytm" 
                    style={{ width: '100%', marginTop: '1.5rem' }}
                    onClick={initiatePaytm}
                  >
                    Pay with Paytm Sandbox <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: REAL-TIME ORDER TRACKER */}
            {step === 5 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                <div className="glass-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="tag tag-success">Order Active & Scheduled</span>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '6px' }}>
                        Order #{orderData ? orderData.order_id : 'ORD-2026-X'}
                      </h2>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Customer: {profile.businessName} ({profile.city})
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>ETA: 2 Days</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: &lt; 3 Days vs 17.6d baseline</div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="timeline">
                    {[
                      { title: 'Order Placed & Digital Consent', status: 'completed', time: 'Today 10:15 AM' },
                      { title: 'Smart KYC Validated (Mock Registries)', status: 'completed', time: 'Today 10:18 AM' },
                      { title: 'Paytm Payment Confirmed (Sandbox TXN)', status: 'completed', time: 'Today 10:20 AM' },
                      { title: 'Hardware Provisioned & Scheduled', status: 'in-progress', time: 'Tomorrow, 10:30 AM' },
                      { title: 'Broadband / AirFiber Live', status: 'pending', time: 'Within 48 hours' }
                    ].map((stepItem, i) => (
                      <div key={i} className={`timeline-step ${stepItem.status}`}>
                        <div className="timeline-dot"></div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{stepItem.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stepItem.time}</div>
                      </div>
                    ))}
                  </div>

                  {/* Technician Card */}
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned Field Engineer</div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>Rajesh Kumar (ID #509)</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>+91 98110 54321</div>
                    </div>
                    <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      <Phone size={14} /> Call Engineer
                    </button>
                  </div>
                </div>

                {/* AI Assistant for Status Tracking */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                    <Bot size={20} color="var(--airtel-red)" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>"Ask About My Order" AI</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Eliminates 3x customer follow-up status chases</div>
                    </div>
                  </div>

                  <div className="chat-window" style={{ flex: 1, minHeight: '260px' }}>
                    {orderChatHistory.map((msg, i) => (
                      <div key={i} className={`chat-bubble ${msg.sender}`}>
                        {msg.text}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleOrderQuery} style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. When will the technician come?"
                      value={orderQuery}
                      onChange={e => setOrderQuery(e.target.value)}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0.75rem' }}>
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =======================
            VIEW 2: OPS CONSOLE & SALES DASHBOARD
        ======================== */}
        {activeTab === 'ops' && opsData && (
          <div>
            {/* KPI Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="glass-panel">
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lead-to-Activation</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
                  {opsData.kpis.conversion_rate_pct}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: 12-15% (Baseline 7.0%)</div>
              </div>

              <div className="glass-panel">
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Time to Activate</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                  {opsData.kpis.target_activation_days} Days
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Baseline: 17.6 Days</div>
              </div>

              <div className="glass-panel">
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Blended CAC</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#facc15', marginTop: '4px' }}>
                  ₹{opsData.kpis.target_cac_inr}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Baseline: ₹15,000 / lead</div>
              </div>

              <div className="glass-panel">
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status Chases</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4ade80', marginTop: '4px' }}>
                  &lt; 1 / cust
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attacked via AI Order Assistant</div>
              </div>
            </div>

            {/* Funnel Stage Breakdown */}
            <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Q1 Funnel Conversion Analysis (5,000 Leads)</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Dataset source: <code>YTL_TrackA_Udyam_Digital_Data/smb_leads.csv</code>
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem' }}>
                {opsData.funnel.map((item, idx) => (
                  <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.8rem', borderRadius: '8px', borderLeft: '3px solid var(--airtel-red)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.stage}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, margin: '2px 0' }}>{item.count.toLocaleString()}</div>
                    {item.drop_pct > 0 && (
                      <span className="tag tag-danger" style={{ fontSize: '0.65rem' }}>
                        -{item.drop_pct}% drop
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Stuck Leads & AI Propensity Call Queue */}
            <div className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Priority Callback Queue (Top Propensity Leads)</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Rule-based ML score based on GSTIN presence, segment, employee count, and stage reached.
                  </p>
                </div>
                <span className="tag tag-success">Call These 20 First</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px' }}>Propensity</th>
                      <th style={{ padding: '8px' }}>Business</th>
                      <th style={{ padding: '8px' }}>Segment</th>
                      <th style={{ padding: '8px' }}>City</th>
                      <th style={{ padding: '8px' }}>Stage Dropped</th>
                      <th style={{ padding: '8px' }}>Drop Reason</th>
                      <th style={{ padding: '8px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opsData.top_call_priority_leads.map(lead => (
                      <tr key={lead.lead_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '8px' }}>
                          <span className="tag tag-success" style={{ fontWeight: 700 }}>
                            {lead.propensity_score} / 100
                          </span>
                        </td>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{lead.business_name}</td>
                        <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{lead.segment}</td>
                        <td style={{ padding: '8px' }}>{lead.city}</td>
                        <td style={{ padding: '8px' }}>{lead.stage_reached}</td>
                        <td style={{ padding: '8px', color: 'var(--warning)', fontSize: '0.75rem' }}>{lead.drop_reason}</td>
                        <td style={{ padding: '8px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                              <Phone size={12} /> Call
                            </button>
                            <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                              WhatsApp
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =======================
          PAYTM SANDBOX MODAL
      ======================== */}
      {paytmModalOpen && paytmData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00b9f5' }}>Paytm</span>
                <span className="tag tag-paytm">Sandbox Gateway</span>
              </div>
              <button 
                className="btn-secondary" 
                style={{ padding: '4px 8px' }}
                onClick={() => setPaytmModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Order ID:</span>
                <span style={{ color: '#fff' }}>{paytmData.order_id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>Merchant:</span>
                <span style={{ color: '#fff' }}>Airtel Enterprise B2B</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, marginTop: '8px' }}>
                <span>Amount:</span>
                <span style={{ color: '#00b9f5' }}>₹{paytmData.amount}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '1rem', background: '#fff', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div style={{ width: '150px', height: '150px', background: '#0a0e17', color: '#fff', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', textAlign: 'center', padding: '8px' }}>
                Paytm Sandbox UPI QR: Scan with Paytm / UPI App
              </div>
              <div style={{ color: '#111827', fontSize: '0.75rem', marginTop: '6px', fontWeight: 600 }}>
                MID: {paytmData.mid}
              </div>
            </div>

            <button 
              className="btn-paytm" 
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={paytmProcessing}
              onClick={confirmPaytmSandboxTxn}
            >
              {paytmProcessing ? 'Verifying with Bank Simulator...' : 'Simulate Successful Payment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
