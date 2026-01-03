import React, { useState } from 'react';
import { User, Mail, Lock, Rocket, ChevronRight, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Signup({ setView }) {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [serverError, setServerError] = useState("");
    const [focusedField, setFocusedField] = useState("");

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
                // Clear any old sessions to prevent conflict
                localStorage.removeItem('talentbd_v1');
                setTimeout(() => setView('login'), 2200);
            } else {
                setServerError(data.error || "Signup failed. Please try again.");
            }
        } catch (err) {
            setServerError("Cannot connect to server. Is your backend running on port 5000?");
        } finally {
            setLoading(false);
        }
    };

    // Render Success State
    if (isSuccess) {
        return (
            <div style={styles.container}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    style={{...styles.card, textAlign: 'center', padding: '60px 40px'}}
                >
                    <div style={styles.successIcon}>
                        <CheckCircle2 size={40} color="#fff" />
                    </div>
                    <h2 style={{margin: '0 0 10px 0', fontSize: '26px', fontWeight: '900'}}>Welcome Aboard!</h2>
                    <p style={{color: '#64748b', fontSize: '15px', lineHeight: '1.6'}}>
                        Your professional profile has been created. <br/>
                        Redirecting you to the secure login...
                    </p>
                    <div style={styles.loadingDots}>
                        <span>.</span><span>.</span><span>.</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.brandIcon}>
                        <ShieldCheck size={26} color="#fff" />
                    </div>
                    <h2 style={styles.title}>Join TalentBD</h2>
                    <p style={styles.subtitle}>Build a verified career with AI-driven insights.</p>
                </div>

                <AnimatePresence>
                    {serverError && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: 'auto', opacity: 1 }}
                            style={styles.errorBanner}
                        >
                            <AlertCircle size={16} /> <span>{serverError}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSignup} style={styles.form}>
                    {/* NAME FIELD */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Full Name</label>
                        <div style={{
                            ...styles.inputWrapper, 
                            borderColor: focusedField === 'name' ? '#2563eb' : '#e2e8f0',
                            boxShadow: focusedField === 'name' ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none'
                        }}>
                            <User style={{...styles.fieldIcon, color: focusedField === 'name' ? '#2563eb' : '#94a3b8'}} size={18} />
                            <input 
                                style={styles.input} 
                                placeholder="e.g. Tanvir Ahmed" 
                                value={formData.name}
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField('')}
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    {/* EMAIL FIELD */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <div style={{
                            ...styles.inputWrapper, 
                            borderColor: focusedField === 'email' ? '#2563eb' : '#e2e8f0',
                            boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none'
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

                    {/* PASSWORD FIELD */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Secure Password</label>
                        <div style={{
                            ...styles.inputWrapper, 
                            borderColor: focusedField === 'password' ? '#2563eb' : '#e2e8f0',
                            boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none'
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
                            <div style={{...styles.strengthBar, width: formData.password.length > 5 ? '100%' : '30%', background: formData.password.length > 5 ? '#10b981' : '#f59e0b'}}></div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        style={{...styles.btn, opacity: loading ? 0.8 : 1}} 
                        disabled={loading}
                    >
                        {loading ? "Establishing Profile..." : "Create My Account"} 
                        {!loading && <ChevronRight size={18} />}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        Already a member? <span onClick={() => setView('login')} style={styles.link}>Login here</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '90vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', background: '#f8fafc' },
    card: { background: '#fff', padding: '48px 40px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)', width: '100%', maxWidth: '460px', border: '1px solid #e2e8f0' },
    header: { textAlign: 'center', marginBottom: '35px' },
    brandIcon: { background: '#2563eb', width: '54px', height: '54px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)' },
    title: { margin: 0, fontSize: '28px', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px' },
    subtitle: { color: '#64748b', fontSize: '15px', marginTop: '8px', lineHeight: '1.5' },
    form: { display: 'flex', flexDirection: 'column', gap: '24px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
    label: { fontSize: '14px', fontWeight: '800', color: '#1e293b' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '14px', transition: 'all 0.2s ease' },
    fieldIcon: { position: 'absolute', left: '16px', transition: '0.2s' },
    input: { width: '100%', padding: '16px 16px 16px 48px', borderRadius: '14px', border: 'none', fontSize: '15px', outline: 'none', boxSizing: 'border-box', color: '#1e293b' },
    passStrength: { height: '4px', width: '100%', background: '#f1f5f9', borderRadius: '10px', marginTop: '8px', overflow: 'hidden' },
    strengthBar: { height: '100%', transition: '0.3s ease' },
    btn: { width: '100%', padding: '18px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '800', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.3s ease', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.3)' },
    footer: { marginTop: '35px', textAlign: 'center' },
    footerText: { fontSize: '15px', color: '#64748b', fontWeight: '500' },
    link: { color: '#2563eb', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' },
    successIcon: { background: '#10b981', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', boxShadow: '0 15px 30px rgba(16, 185, 129, 0.4)', transform: 'rotate(-5deg)' },
    errorBanner: { background: '#fff1f2', color: '#be123c', padding: '14px', borderRadius: '12px', fontSize: '13px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #fecdd3', fontWeight: '600' },
    loadingDots: { display: 'flex', justifyContent: 'center', gap: '5px', fontSize: '24px', color: '#2563eb', marginTop: '10px' }
};