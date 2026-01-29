import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, 
    ShieldCheck, Globe, CheckCircle, Layers, Plus, Trash2 
} from 'lucide-react';

const Login = ({ setUser, setView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState('');
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    // Admin Category Sync State
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState('');
    const [showAdminPanel, setShowAdminPanel] = useState(false);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        fetchCategories();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- CATEGORY SYNC LOGIC ---
    const fetchCategories = async () => {
        try {
            // Updated to use the public categories endpoint
            const res = await axios.get('http://localhost:5000/api/categories?group=job');
            // SYNC FIX: Access the categories array inside the response object
            setCategories(res.data.categories || []);
        } catch (err) { 
            console.warn("Syncing with local cache..."); 
            setCategories([]);
        }
    };

    const addCategory = async () => {
        if (!newCat) return;
        // SYNC FIX: Get token for Admin authorization
        const storedUser = JSON.parse(localStorage.getItem('talentbd_v1'));
        
        try {
            await axios.post('http://localhost:5000/api/auth/admin/categories', 
                { name: newCat, group: 'job' },
                { headers: { Authorization: `Bearer ${storedUser?.token}` } }
            );
            setNewCat('');
            fetchCategories();
        } catch (err) { 
            alert(err.response?.data?.message || "Admin sync error: Check privileges"); 
        }
    };

    const deleteCategory = async (id) => {
        const storedUser = JSON.parse(localStorage.getItem('talentbd_v1'));
        try {
            await axios.delete(`http://localhost:5000/api/auth/admin/categories/${id}`, {
                headers: { Authorization: `Bearer ${storedUser?.token}` }
            });
            fetchCategories();
        } catch (err) { 
            console.error("Delete failed:", err); 
        }
    };

    const isMobile = windowWidth < 768;

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // SYNC FIX: Endpoint updated to /api/auth/login
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.toLowerCase().trim(), password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // SYNC FIX: Backend returns { success: true, user: { ... } }
                localStorage.setItem('talentbd_v1', JSON.stringify(data.user));
                setUser(data.user); 
                setView('home'); 
            } else {
                setError(data.message || 'Invalid credentials.');
            }
        } catch (err) {
            setError('Cloud Sync Offline: Connect to Node.js Port 5000.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{...loginStyles.pageWrapper, padding: isMobile ? '15px' : '40px', flexDirection: isMobile ? 'column' : 'row'}}>
            
            {/* LEFT SIDE: LOGIN CARD */}
            <div style={{
                ...loginStyles.card,
                maxWidth: isMobile ? '100%' : '450px',
                padding: isMobile ? '40px 24px' : '48px 40px',
                borderRadius: isMobile ? '24px' : '32px'
            }}>
                <div style={loginStyles.header}>
                    <div style={styles.topStatus}>
                        <Globe size={12} color="#16a34a" /> 
                        <span style={{fontSize: '10px', fontWeight: '900', color: '#16a34a'}}>SECURE PORTAL 2026</span>
                    </div>

                    <div style={loginStyles.logoIcon}>
                        <ShieldCheck color="#fff" size={26} />
                    </div>
                    <h2 style={{...loginStyles.title, fontSize: isMobile ? '24px' : '28px'}}>TalentBD <span style={{color: '#2563eb'}}>ID</span></h2>
                    <p style={loginStyles.subtitle}>Bridge your skills to global markets.</p>
                </div>

                {error && (
                    <div style={loginStyles.errorBox}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}
                
                <form onSubmit={handleLogin} style={loginStyles.form}>
                    <div style={loginStyles.inputGroup}>
                        <label style={loginStyles.label}>Registered Email</label>
                        <div style={{...loginStyles.inputWrapper, borderColor: isFocused === 'email' ? '#2563eb' : '#e2e8f0'}}>
                            <Mail style={{...loginStyles.fieldIcon, color: isFocused === 'email' ? '#2563eb' : '#94a3b8'}} size={18} />
                            <input 
                                type="email" 
                                placeholder="name@company.com" 
                                style={loginStyles.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setIsFocused('email')}
                                onBlur={() => setIsFocused('')}
                                required
                            />
                        </div>
                    </div>

                    <div style={loginStyles.inputGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={loginStyles.label}>Password</label>
                            <span style={loginStyles.forgotLink}>Reset?</span>
                        </div>
                        <div style={{...loginStyles.inputWrapper, borderColor: isFocused === 'password' ? '#2563eb' : '#e2e8f0'}}>
                            <Lock style={{...loginStyles.fieldIcon, color: isFocused === 'password' ? '#2563eb' : '#94a3b8'}} size={18} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                style={loginStyles.input}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setIsFocused('password')}
                                onBlur={() => setIsFocused('')}
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={loginStyles.eyeBtn}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    
                    <button type="submit" style={{...loginStyles.btn, background: loading ? '#64748b' : '#2563eb'}} disabled={loading}>
                        {loading ? 'Decrypting...' : 'Sign In'} <LogIn size={20} />
                    </button>
                </form>

                <div style={loginStyles.footer}>
                    <p style={loginStyles.footerText}>New here? <span style={loginStyles.link} onClick={() => setView('signup')}>Create ID</span></p>
                    <div style={styles.syncStatus}>
                        <CheckCircle size={12} color="#94a3b8" />
                        <span>Connected to TalentBD Cloud v1.0</span>
                    </div>
                    {/* Admin Access Trigger */}
                    <button onClick={() => setShowAdminPanel(!showAdminPanel)} style={styles.adminTrigger}>
                        {showAdminPanel ? 'Hide Management' : 'Global Category Manager'}
                    </button>
                </div>
            </div>

            {/* RIGHT SIDE: ADMIN CATEGORY MANAGER */}
            {showAdminPanel && (
                <div style={{...styles.adminFlyout, width: isMobile ? '100%' : '350px', marginLeft: isMobile ? '0' : '20px', marginTop: isMobile ? '20px' : '0'}}>
                    <div style={styles.adminHeader}>
                        <Layers size={18} color="#2563eb" />
                        <h4 style={{margin:0}}>System Categories</h4>
                    </div>
                    <p style={{fontSize:'12px', color:'#64748b', marginBottom:'15px'}}>Add categories to sync with Jobs and Learning modules.</p>
                    
                    <div style={styles.adminControls}>
                        <input 
                            style={styles.adminInput} 
                            placeholder="New Job Category..." 
                            value={newCat} 
                            onChange={(e) => setNewCat(e.target.value)}
                        />
                        <button onClick={addCategory} style={styles.adminAddBtn}><Plus size={16}/></button>
                    </div>

                    <div style={styles.catScroll}>
                        {categories.map(c => (
                            <div key={c._id} style={styles.catItem}>
                                <span>{c.name}</span>
                                <Trash2 size={14} color="#ef4444" style={{cursor:'pointer'}} onClick={() => deleteCategory(c._id)} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    topStatus: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '15px', background: '#f0fdf4', padding: '4px 12px', borderRadius: '50px', border: '1px solid #dcfce7' },
    syncStatus: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '20px', color: '#94a3b8', fontSize: '11px', fontWeight: '700' },
    adminTrigger: { background: 'none', border: 'none', color: '#2563eb', fontSize: '11px', fontWeight: '800', cursor: 'pointer', marginTop: '15px', textDecoration: 'underline' },
    adminFlyout: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', height: 'fit-content' },
    adminHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
    adminControls: { display: 'flex', gap: '10px', marginBottom: '20px' },
    adminInput: { flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' },
    adminAddBtn: { background: '#0f172a', color: '#fff', border: 'none', width: '45px', borderRadius: '12px', cursor: 'pointer' },
    catScroll: { display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' },
    catItem: { display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }
};

const loginStyles = {
    pageWrapper: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f1f5f9' },
    card: { background: '#fff', border: '1px solid #e2e8f0', boxSizing: 'border-box', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)' },
    header: { textAlign: 'center', marginBottom: '30px' },
    logoIcon: { background: '#2563eb', width: '55px', height: '55px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' },
    title: { margin: 0, fontWeight: '900', color: '#0f172a' },
    subtitle: { color: '#64748b', fontSize: '14px', marginTop: '8px' },
    errorBox: { background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', padding: '14px', borderRadius: '14px', fontSize: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '13px', fontWeight: '800', color: '#475569' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '14px' },
    fieldIcon: { position: 'absolute', left: '16px' },
    input: { width: '100%', padding: '16px 16px 16px 48px', borderRadius: '14px', border: 'none', fontSize: '14px', outline: 'none', background: 'transparent' },
    eyeBtn: { position: 'absolute', right: '16px', background: 'none', border: 'none', cursor: 'pointer' },
    btn: { width: '100%', padding: '16px', color: '#fff', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '900', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' },
    footer: { marginTop: '30px', textAlign: 'center' },
    footerText: { fontSize: '14px', color: '#64748b' },
    link: { color: '#2563eb', fontWeight: '900', cursor: 'pointer' },
    forgotLink: { fontSize: '12px', color: '#2563eb', fontWeight: '800', cursor: 'pointer' }
};

export default Login;