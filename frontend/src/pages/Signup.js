import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Rocket, ChevronRight, CheckCircle2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Signup({ setView }) {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [serverError, setServerError] = useState("");
    const [focusedField, setFocusedField] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Responsive Tracker
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setServerError("");
        
        try {
            const res = await fetch('http://localhost:5000/api/signup', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' 
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.toLowerCase().trim(),
                    password: formData.password
                })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setIsSuccess(true);
                localStorage.removeItem('talentbd_v1');
                setTimeout(() => setView('login'), 2500);
            } else {
                setServerError(data.error || "Signup failed. Please try again.");
            }
        } catch (err) {
            setServerError("Cloud Sync Offline: Ensure Node.js is running on Port 5000.");
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div style={styles.container}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    style={{...styles.card, textAlign: 'center', padding: isMobile ? '40px 20px' : '60px 40px'}}
                >
                    <motion.div 
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={styles.successIcon}
                    >
                        <CheckCircle2 size={40} color="#fff" />
                    </motion.div>
                    <h2 style={{margin: '0 0 12px 0', fontSize: isMobile ? '24px' : '28px', fontWeight: '900'}}>Welcome Aboard!</h2>
                    <p style={{color: '#64748b', fontSize: '16px', lineHeight: '1.6'}}>
                        Your professional profile has been created. <br/>
                        Redirecting to secure login...
                    </p>
                    <div style={styles.loadingDots}>
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }}>.</motion.span>
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>.</motion.span>
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>.</motion.span>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{...styles.container, padding: isMobile ? '15px' : '40px'}}>
            <div style={{
                ...styles.card, 
                padding: isMobile ? '40px 24px' : '48px 40px',
                borderRadius: isMobile ? '24px' : '32px'
            }}>
                <div style={styles.header}>
                    <div style={styles.brandIcon}>
                        <ShieldCheck size={26} color="#fff" />
                    </div>
                    <h2 style={{...styles.title, fontSize: isMobile ? '24px' : '30px'}}>Join <span style={{color: '#2563eb'}}>TalentBD</span></h2>
                    <p style={styles.subtitle}>Build a verified career with AI-driven insights.</p>
                </div>

                <AnimatePresence mode="wait">
                    {serverError && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={styles.errorBanner}
                        >
                            <AlertCircle size={18} /> <span>{serverError}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSignup} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Full Name</label>
                        <div style={{
                            ...styles.inputWrapper, 
                            borderColor: focusedField === 'name' ? '#2563eb' : '#e2e8f0',
                            background: focusedField === 'name' ? '#fff' : '#fcfdfe'
                        }}>
                            <User style={{...styles.fieldIcon, color: focusedField === 'name' ? '#2563eb' : '#94a3b8'}} size={18} />
                            <input 
                                style={styles.input} 
                                placeholder="Tanvir Ahmed" 
                                value={formData.name}
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField('')}
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <div style={{
                            ...styles.inputWrapper, 
                            borderColor: focusedField === 'email' ? '#2563eb' : '#e2e8f0',
                            background: focusedField === 'email' ? '#fff' : '#fcfdfe'
                        }}>
                            <Mail style={{...styles.fieldIcon, color: focusedField === 'email' ? '#2563eb' : '#94a3b8'}} size={18} />
                            <input 
                                style={styles.input} 
                                type="email" 
                                placeholder="name@career.com" 
                                value={formData.email}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField('')}
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Secure Password</label>
                        <div style={{
                            ...styles.inputWrapper, 
                            borderColor: focusedField === 'password' ? '#2563eb' : '#e2e8f0',
                            background: focusedField === 'password' ? '#fff' : '#fcfdfe'
                        }}>
                            <Lock style={{...styles.fieldIcon, color: focusedField === 'password' ? '#2563eb' : '#94a3b8'}} size={18} />
                            <input 
                                style={styles.input} 
                                type="password" 
                                placeholder="Min. 6 characters" 
                                value={formData.password}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField('')}
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                required 
                                minLength="6"
                            />
                        </div>
                        <div style={styles.passStrength}>
                            <motion.div 
                                animate={{ width: formData.password.length > 5 ? '100%' : '30%' }}
                                style={{
                                    ...styles.strengthBar, 
                                    background: formData.password.length > 5 ? '#10b981' : '#f59e0b'
                                }}
                            ></motion.div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        style={{
                            ...styles.btn, 
                            opacity: loading ? 0.8 : 1,
                            backgroundColor: loading ? '#64748b' : '#0f172a'
                        }} 
                        disabled={loading}
                    >
                        {loading ? "Establishing ID..." : (
                            <>
                                Get Started <Rocket size={20} />
                            </>
                        )}
                        {!loading && <ChevronRight size={18} style={{marginLeft: 'auto'}} />}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        Already a member? <span onClick={() => setView('login')} style={styles.link}>Login here</span>
                    </p>
                    <div style={styles.secureNote}>
                        <Sparkles size={12} /> Encrypted by TalentBD Protocol
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at bottom, #f1f5f9 0%, #fff 100%)' },
    card: { background: '#fff', width: '100%', maxWidth: '480px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)' },
    header: { textAlign: 'center', marginBottom: '35px' },
    brandIcon: { background: '#2563eb', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)' },
    title: { margin: 0, fontWeight: '900', color: '#0f172a', letterSpacing: '-1.5px' },
    subtitle: { color: '#64748b', fontSize: '15px', marginTop: '10px', lineHeight: '1.6' },
    form: { display: 'flex', flexDirection: 'column', gap: '22px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '13px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '16px', transition: 'all 0.3s ease' },
    fieldIcon: { position: 'absolute', left: '18px', transition: '0.2s' },
    input: { width: '100%', padding: '18px 18px 18px 52px', borderRadius: '16px', border: 'none', fontSize: '15px', outline: 'none', boxSizing: 'border-box', color: '#1e293b', fontWeight: '600', background: 'transparent' },
    passStrength: { height: '6px', width: '100%', background: '#f1f5f9', borderRadius: '10px', marginTop: '8px', overflow: 'hidden' },
    strengthBar: { height: '100%', transition: '0.5s cubic-bezier(0.4, 0, 0.2, 1)' },
    btn: { width: '100%', padding: '18px', color: '#fff', border: 'none', borderRadius: '18px', cursor: 'pointer', fontWeight: '900', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', marginTop: '10px', boxShadow: '0 15px 30px -5px rgba(15, 23, 42, 0.3)' },
    footer: { marginTop: '35px', textAlign: 'center' },
    footerText: { fontSize: '15px', color: '#64748b', fontWeight: '600' },
    link: { color: '#2563eb', fontWeight: '900', cursor: 'pointer', textDecoration: 'underline' },
    successIcon: { background: '#10b981', width: '85px', height: '85px', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)' },
    errorBanner: { background: '#fff1f2', color: '#be123c', padding: '16px', borderRadius: '16px', fontSize: '13px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #fecdd3', fontWeight: '800' },
    loadingDots: { display: 'flex', justifyContent: 'center', gap: '6px', fontSize: '32px', color: '#2563eb', height: '40px', alignItems: 'center' },
    secureNote: { marginTop: '20px', fontSize: '10px', fontWeight: '900', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', textTransform: 'uppercase' }
};