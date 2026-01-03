import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';

const Login = ({ setUser, setView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // SYNC: Standardizing data for the backend
        const credentials = { 
            email: email.toLowerCase().trim(), 
            password: password 
        };

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok) {
                // FIXED: Using versioned key to match App.js state persistence
                localStorage.setItem('talentbd_v1', JSON.stringify(data));
                setUser(data); 
                setView('home'); 
            } else {
                setError(data.error || 'Invalid credentials. Please check your email or password.');
            }
        } catch (err) {
            setError('System Offline: Please ensure the Node.js API is running on localhost:5000.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={loginStyles.pageWrapper}>
            <div style={loginStyles.card}>
                <div style={loginStyles.header}>
                    <div style={loginStyles.logoIcon}>
                        <ShieldCheck color="#fff" size={26} />
                    </div>
                    <h2 style={loginStyles.title}>TalentBD Login</h2>
                    <p style={loginStyles.subtitle}>Access your verified skills and marketplace gigs.</p>
                </div>

                {error && (
                    <div style={loginStyles.errorBox}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}
                
                <form onSubmit={handleLogin} style={loginStyles.form}>
                    {/* EMAIL FIELD */}
                    <div style={loginStyles.inputGroup}>
                        <label style={loginStyles.label}>Registered Email</label>
                        <div style={{
                            ...loginStyles.inputWrapper,
                            borderColor: isFocused === 'email' ? '#2563eb' : '#e2e8f0',
                            boxShadow: isFocused === 'email' ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none'
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

                    {/* PASSWORD FIELD */}
                    <div style={loginStyles.inputGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={loginStyles.label}>Password</label>
                            <span style={loginStyles.forgotLink}>Reset Password?</span>
                        </div>
                        <div style={{
                            ...loginStyles.inputWrapper,
                            borderColor: isFocused === 'password' ? '#2563eb' : '#e2e8f0',
                            boxShadow: isFocused === 'password' ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none'
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
                            transform: loading ? 'scale(0.98)' : 'scale(1)'
                        }} 
                        disabled={loading}
                    >
                        {loading ? 'Verifying Account...' : 'Sign In'}
                    </button>
                </form>

                <div style={loginStyles.footer}>
                    <p style={loginStyles.footerText}>
                        New to TalentBD?{' '}
                        <span style={loginStyles.link} onClick={() => setView('signup')}>
                            Create an ID
                        </span>
                    </p>
                    <div style={loginStyles.demoBox}>
                        <div style={{fontWeight:'900', color:'#2563eb', marginBottom:'4px'}}>DEMO ACCOUNT</div>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                            <span>User: admin@test.com</span>
                            <span>Pass: 123456</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const loginStyles = {
    pageWrapper: { 
        minHeight: '85vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '20px',
        background: 'radial-gradient(circle at top, #f8fafc 0%, #f1f5f9 100%)'
    },
    card: { 
        background: '#fff', 
        padding: '48px 40px', 
        borderRadius: '32px', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)', 
        width: '100%', 
        maxWidth: '450px', 
        border: '1px solid #e2e8f0' 
    },
    header: { textAlign: 'center', marginBottom: '35px' },
    logoIcon: { 
        background: '#2563eb', 
        width: '56px', 
        height: '56px', 
        borderRadius: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        margin: '0 auto 20px',
        boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
    },
    title: { margin: 0, fontSize: '28px', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px' },
    subtitle: { color: '#64748b', fontSize: '15px', marginTop: '8px', lineHeight: '1.5' },
    errorBox: { 
        background: '#fff1f2', 
        border: '1px solid #fecdd3', 
        color: '#be123c', 
        padding: '14px', 
        borderRadius: '12px', 
        fontSize: '13px', 
        marginBottom: '25px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        fontWeight: '600'
    },
    form: { display: 'flex', flexDirection: 'column', gap: '22px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
    label: { fontSize: '14px', fontWeight: '800', color: '#1e293b' },
    inputWrapper: { 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        transition: 'all 0.2s ease',
        background: '#fff'
    },
    fieldIcon: { position: 'absolute', left: '16px', transition: '0.2s' },
    input: { 
        width: '100%', 
        padding: '16px 16px 16px 48px', 
        borderRadius: '14px', 
        border: 'none', 
        fontSize: '15px', 
        outline: 'none', 
        boxSizing: 'border-box',
        color: '#1e293b',
        fontWeight: '500'
    },
    eyeBtn: { position: 'absolute', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' },
    btn: { 
        width: '100%', 
        padding: '16px', 
        background: '#2563eb', 
        color: '#fff', 
        border: 'none', 
        borderRadius: '14px', 
        cursor: 'pointer', 
        fontWeight: '900', 
        fontSize: '16px', 
        transition: 'all 0.3s', 
        marginTop: '10px',
        boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)'
    },
    footer: { marginTop: '35px', textAlign: 'center' },
    footerText: { fontSize: '15px', color: '#64748b', fontWeight: '500' },
    link: { color: '#2563eb', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' },
    forgotLink: { fontSize: '12px', color: '#2563eb', fontWeight: '700', cursor: 'pointer' },
    demoBox: { 
        marginTop: '25px', 
        padding: '15px', 
        background: '#f8fafc', 
        borderRadius: '16px', 
        fontSize: '12px', 
        color: '#64748b', 
        border: '1px dashed #cbd5e1',
        textAlign: 'left'
    }
};

export default Login;