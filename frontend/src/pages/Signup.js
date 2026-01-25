import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    User, Mail, Lock, Rocket, ChevronRight, CheckCircle2, 
    AlertCircle, ShieldCheck, Sparkles, Layers, Plus, Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Signup({ setView }) {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [serverError, setServerError] = useState("");
    const [focusedField, setFocusedField] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Admin Category Sync State
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState('');
    const [showAdminSync, setShowAdminSync] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        fetchCategories();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- CATEGORY SYNC LOGIC ---
    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data);
        } catch (err) { console.warn("Waiting for Node.js sync..."); }
    };

    const addCategory = async () => {
        if (!newCat) return;
        try {
            await axios.post('http://localhost:5000/api/admin/categories', { name: newCat, group: 'global' });
            setNewCat('');
            fetchCategories();
        } catch (err) { alert("Admin sync error"); }
    };

    const deleteCategory = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/admin/categories/${id}`);
            fetchCategories();
        } catch (err) { console.error(err); }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setServerError("");
        
        try {
            const res = await fetch('http://localhost:5000/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.toLowerCase().trim(),
                    password: formData.password
                })
            });
            const data = await res.json();
            if (res.ok) {
                setIsSuccess(true);
                setTimeout(() => setView('login'), 2500);
            } else {
                setServerError(data.error || "Signup failed.");
            }
        } catch (err) {
            setServerError("Cloud Sync Offline: Connect to Node.js Port 5000.");
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div style={styles.container}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{...styles.card, textAlign: 'center', padding: isMobile ? '40px 20px' : '60px 40px'}}>
                    <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} style={styles.successIcon}>
                        <CheckCircle2 size={40} color="#fff" />
                    </motion.div>
                    <h2 style={{margin: '0 0 12px 0', fontSize: isMobile ? '24px' : '28px', fontWeight: '900'}}>Welcome Aboard!</h2>
                    <p style={{color: '#64748b'}}>Redirecting to secure login...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{...styles.container, padding: isMobile ? '20px 15px' : '40px', flexDirection: isMobile ? 'column' : 'row'}}>
            
            {/* MAIN SIGNUP CARD */}
            <div style={{
                ...styles.card, 
                padding: isMobile ? '40px 24px' : '48px 40px',
                borderRadius: isMobile ? '24px' : '32px',
                width: isMobile ? '100%' : '480px'
            }}>
                <div style={styles.header}>
                    <div style={styles.brandIcon}><ShieldCheck size={26} color="#fff" /></div>
                    <h2 style={{...styles.title, fontSize: isMobile ? '24px' : '30px'}}>Join <span style={{color: '#2563eb'}}>TalentBD</span></h2>
                    <p style={styles.subtitle}>Build a verified career with AI-driven insights.</p>
                </div>

                <AnimatePresence mode="wait">
                    {serverError && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={styles.errorBanner}>
                            <AlertCircle size={18} /> <span>{serverError}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSignup} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Full Name</label>
                        <div style={{...styles.inputWrapper, borderColor: focusedField === 'name' ? '#2563eb' : '#e2e8f0'}}>
                            <User style={{...styles.fieldIcon, color: focusedField === 'name' ? '#2563eb' : '#94a3b8'}} size={18} />
                            <input style={styles.input} placeholder="Tanvir Ahmed" value={formData.name} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField('')} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <div style={{...styles.inputWrapper, borderColor: focusedField === 'email' ? '#2563eb' : '#e2e8f0'}}>
                            <Mail style={{...styles.fieldIcon, color: focusedField === 'email' ? '#2563eb' : '#94a3b8'}} size={18} />
                            <input style={styles.input} type="email" placeholder="name@career.com" value={formData.email} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Secure Password</label>
                        <div style={{...styles.inputWrapper, borderColor: focusedField === 'password' ? '#2563eb' : '#e2e8f0'}}>
                            <Lock style={{...styles.fieldIcon, color: focusedField === 'password' ? '#2563eb' : '#94a3b8'}} size={18} />
                            <input style={styles.input} type="password" placeholder="Min. 6 characters" value={formData.password} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField('')} onChange={e => setFormData({...formData, password: e.target.value})} required minLength="6"/>
                        </div>
                    </div>

                    <button type="submit" style={{...styles.btn, background: loading ? '#64748b' : '#0f172a'}} disabled={loading}>
                        {loading ? "Establishing ID..." : "Get Started"} <Rocket size={20} />
                    </button>
                </form>

                <div style={styles.footer}>
                    <p style={styles.footerText}>Already a member? <span onClick={() => setView('login')} style={styles.link}>Login here</span></p>
                    <button onClick={() => setShowAdminSync(!showAdminSync)} style={styles.adminToggle}>
                        {showAdminSync ? "Hide Category Architect" : "Ecosystem Settings"}
                    </button>
                </div>
            </div>

            {/* ADMIN CATEGORY ARCHITECT (Responsive reveal on side or bottom) */}
            {showAdminSync && (
                <div style={{...styles.adminPanel, marginLeft: isMobile ? 0 : '30px', marginTop: isMobile ? '20px' : 0}}>
                    <div style={styles.adminHeader}>
                        <Layers size={18} color="#2563eb" />
                        <h4 style={{margin:0}}>Global Categories</h4>
                    </div>
                    <div style={styles.adminInputs}>
                        <input style={styles.adminInput} placeholder="New Skill/Job Tag..." value={newCat} onChange={e => setNewCat(e.target.value)} />
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
}

const styles = {
    container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' },
    card: { background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)', position: 'relative' },
    header: { textAlign: 'center', marginBottom: '35px' },
    brandIcon: { background: '#2563eb', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
    title: { margin: 0, fontWeight: '900', color: '#0f172a', letterSpacing: '-1.5px' },
    subtitle: { color: '#64748b', fontSize: '15px', marginTop: '10px' },
    form: { display: 'flex', flexDirection: 'column', gap: '22px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '12px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '16px' },
    fieldIcon: { position: 'absolute', left: '18px' },
    input: { width: '100%', padding: '18px 18px 18px 52px', borderRadius: '16px', border: 'none', fontSize: '15px', outline: 'none' },
    btn: { width: '100%', padding: '18px', color: '#fff', border: 'none', borderRadius: '18px', cursor: 'pointer', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' },
    footer: { marginTop: '35px', textAlign: 'center' },
    footerText: { fontSize: '15px', color: '#64748b', fontWeight: '600' },
    link: { color: '#2563eb', fontWeight: '900', cursor: 'pointer', textDecoration: 'underline' },
    adminToggle: { background: 'none', border: 'none', color: '#64748b', fontSize: '11px', fontWeight: 'bold', marginTop: '15px', cursor: 'pointer', textDecoration: 'underline' },
    adminPanel: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '25px', width: '320px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', height: 'fit-content' },
    adminHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
    adminInputs: { display: 'flex', gap: '10px', marginBottom: '15px' },
    adminInput: { flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' },
    adminAddBtn: { background: '#0f172a', color: '#fff', border: 'none', width: '40px', borderRadius: '10px', cursor: 'pointer' },
    catScroll: { maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
    catItem: { display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', fontWeight: '600' },
    successIcon: { background: '#10b981', width: '80px', height: '80px', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
    errorBanner: { background: '#fff1f2', color: '#be123c', padding: '16px', borderRadius: '16px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #fecdd3' }
};