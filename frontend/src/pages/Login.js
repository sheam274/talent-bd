import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, ShieldCheck, Globe, CheckCircle } from 'lucide-react';

const Login = ({ setUser, setView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState('');
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    // Track window size for responsive style adjustments
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const credentials = { 
            email: email.toLowerCase().trim(), 
            password: password 
        };

        try {
            // SYNC: Attempting local API connection
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('talentbd_v1', JSON.stringify(data));
                setUser(data); 
                setView('home'); 
            } else {
                setError(data.error || 'Invalid credentials. Please check your email or password.');
            }
        } catch (err) {
            // SYNC: Fallback message for development sync
            setError('Cloud Sync Offline: Please ensure the Node.js API is running on Port 5000.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            ...loginStyles.pageWrapper,
            padding: isMobile ? '15px' : '40px'
        }}>
            <div style={{
                ...loginStyles.card,
                maxWidth: isMobile ? '100%' : '450px',
                padding: isMobile ? '40px 24px' : '48px 40px',
                borderRadius: isMobile ? '24px' : '32px'
            }}>
                <div style={loginStyles.header}>
                    {/* ADDED: Trust Badge for 2026 Ecosystem */}
                    <div style={styles.topStatus}>
                        <Globe size={12} color="#16a34a" /> 
                        <span style={{fontSize: '10px', fontWeight: '900', color: '#16a34a'}}>VERIFIED SECURE</span>
                    </div>

                    <div style={loginStyles.logoIcon}>
                        <ShieldCheck color="#fff" size={26} />
                    </div>
                    <h2 style={{...loginStyles.title, fontSize: isMobile ? '24px' : '28px'}}>TalentBD <span style={{color: '#2563eb'}}>ID</span></h2>
                    <p style={loginStyles.subtitle}>Access your verified skills and marketplace gigs.</p>
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
                        <div style={{
                            ...loginStyles.inputWrapper,
                            borderColor: isFocused === 'email' ? '#2563eb' : '#e2e8f0',
                            background: isFocused === 'email' ? '#fff' : '#fcfdfe',
                            boxShadow: isFocused === 'email' ? '0 0 0 4px rgba(37,99,235,0.1)' : 'none'
                        }}>
                            <Mail style={{...loginStyles.fieldIcon, color: isFocused === 'email' ? '#2563eb' : '#94a3b8'}} size={18} />
                            <input 
                                type="email" 
                                placeholder="e.g. jason@talentbd.com" 
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
                            <span style={loginStyles.forgotLink}>Forgot?</span>
                        </div>
                        <div style={{
                            ...loginStyles.inputWrapper,
                            borderColor: isFocused === 'password' ? '#2563eb' : '#e2e8f0',
                            background: isFocused === 'password' ? '#fff' : '#fcfdfe',
                            boxShadow: isFocused === 'password' ? '0 0 0 4px rgba(37,99,235,0.1)' : 'none'
                        }}>
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
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                style={loginStyles.eyeBtn}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        style={{
                            ...loginStyles.btn,
                            opacity: loading ? 0.7 : 1,
                            transform: loading ? 'scale(0.98)' : 'scale(1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            background: loading ? '#64748b' : '#2563eb'
                        }} 
                        disabled={loading}
                    >
                        {loading ? 'Decrypting...' : (
                            <>
                                Login to Dashboard <LogIn size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div style={loginStyles.footer}>
                    <p style={loginStyles.footerText}>
                        New Talent?{' '}
                        <span style={loginStyles.link} onClick={() => setView('signup')}>
                            Create Account
                        </span>
                    </p>
                    
                    {/* ADDED: Feature Sync Note */}
                    <div style={styles.syncStatus}>
                        <CheckCircle size={12} color="#94a3b8" />
                        <span>Connected to TalentBD Auth Engine v1.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal styles for newly added visual elements
const styles = {
    topStatus: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '15px', background: '#f0fdf4', width: 'fit-content', margin: '0 auto 15px', padding: '4px 12px', borderRadius: '50px', border: '1px solid #dcfce7' },
    syncStatus: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '25px', color: '#94a3b8', fontSize: '11px', fontWeight: '600' }
};

const loginStyles = {
    pageWrapper: { 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        background: 'radial-gradient(circle at top, #f8fafc 0%, #e2e8f0 100%)'
    },
    card: { 
        background: '#fff', 
        width: '95%', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.12)', 
        border: '1px solid #e2e8f0',
        boxSizing: 'border-box'
    },
    header: { textAlign: 'center', marginBottom: '35px' },
    logoIcon: { 
        background: '#2563eb', 
        width: '60px', 
        height: '60px', 
        borderRadius: '18px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        margin: '0 auto 20px',
        boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)'
    },
    title: { margin: 0, fontWeight: '900', color: '#0f172a', letterSpacing: '-1.5px' },
    subtitle: { color: '#64748b', fontSize: '15px', marginTop: '10px', lineHeight: '1.5' },
    errorBox: { 
        background: '#fff1f2', 
        border: '1px solid #fecdd3', 
        color: '#be123c', 
        padding: '16px', 
        borderRadius: '16px', 
        fontSize: '13px', 
        marginBottom: '25px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        fontWeight: '700'
    },
    form: { display: 'flex', flexDirection: 'column', gap: '24px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
    label: { fontSize: '14px', fontWeight: '800', color: '#334155' },
    inputWrapper: { 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        transition: 'all 0.3s ease'
    },
    fieldIcon: { position: 'absolute', left: '18px', transition: '0.2s' },
    input: { 
        width: '100%', 
        padding: '18px 18px 18px 52px', 
        borderRadius: '16px', 
        border: 'none', 
        fontSize: '15px', 
        outline: 'none', 
        boxSizing: 'border-box',
        color: '#1e293b',
        fontWeight: '600',
        background: 'transparent'
    },
    eyeBtn: { position: 'absolute', right: '18px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' },
    btn: { 
        width: '100%', 
        padding: '18px', 
        color: '#fff', 
        border: 'none', 
        borderRadius: '16px', 
        cursor: 'pointer', 
        fontWeight: '900', 
        fontSize: '16px', 
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
        marginTop: '10px',
        boxShadow: '0 15px 25px -5px rgba(37, 99, 235, 0.4)'
    },
    footer: { marginTop: '35px', textAlign: 'center' },
    footerText: { fontSize: '15px', color: '#64748b', fontWeight: '600' },
    link: { color: '#2563eb', fontWeight: '900', cursor: 'pointer', textDecoration: 'none' },
    forgotLink: { fontSize: '13px', color: '#2563eb', fontWeight: '800', cursor: 'pointer' }
};

export default Login;