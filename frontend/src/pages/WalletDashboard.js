import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wallet, TrendingUp, Landmark, History, AlertCircle, 
    CheckCircle2, ArrowRight, Smartphone, ShieldCheck, 
    Zap, CreditCard, Plus, Trash2, Settings, Layers 
} from 'lucide-react';

export default function WalletDashboard({ user, setView, setUser }) {
    const [withdrawMode, setWithdrawMode] = useState(false);
    const [payoutMethod, setPayoutMethod] = useState('bKash');
    const [phone, setPhone] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Admin Category State
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState('');
    const isAdmin = user?.role === 'admin' || user?.email === 'admin@talentbd.com';

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        if (isAdmin) fetchCategories();
        return () => window.removeEventListener('resize', handleResize);
    }, [isAdmin]);

    // --- ADMIN CATEGORY MANAGEMENT ---
    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data);
        } catch (err) { console.warn("Syncing with Node.js Port 5000..."); }
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

    // XP & Level Logic
    const currentPoints = user?.points || 0;
    const nextLevelXP = 1000;
    const currentLevel = Math.floor(currentPoints / nextLevelXP) + 1;
    const progress = (currentPoints % nextLevelXP) / 10;
    const balance = user?.walletBalance || 0;
    const bdtRate = 118;

    const handleWithdrawRequest = () => {
        if (balance < 10) {
            alert("Minimum withdrawal is $10. Verify more skills to unlock cash out!");
            return;
        }
        if (!phone.match(/^01[3-9]\d{8}$/)) {
            alert("Enter a valid 11-digit mobile number.");
            return;
        }
        alert(`Success! ৳${(balance * bdtRate).toLocaleString()} will be sent to ${payoutMethod} within 24 hours.`);
        setWithdrawMode(false);
        setPhone('');
    };

    return (
        <div style={{...dashStyles.container, padding: isMobile ? '20px 15px' : '40px 25px'}}>
            
            {/* 1. ADMIN CATEGORY SYSTEM (Integrated for Global Control) */}
            {isAdmin && (
                <div style={dashStyles.adminPanel}>
                    <div style={dashStyles.adminHeader}>
                        <Settings size={16} color="#2563eb" />
                        <h4 style={{margin:0, fontSize:'14px', fontWeight:'900'}}>Ecosystem Infrastructure</h4>
                    </div>
                    <div style={{...dashStyles.adminRow, flexDirection: isMobile ? 'column' : 'row'}}>
                        <input 
                            style={dashStyles.adminInput} 
                            placeholder="Add New Job/Skill Tag..." 
                            value={newCat}
                            onChange={(e) => setNewCat(e.target.value)}
                        />
                        <button onClick={addCategory} style={dashStyles.adminAddBtn}><Plus size={16}/> Sync Tag</button>
                    </div>
                    <div style={dashStyles.catScroll}>
                        {categories.map(c => (
                            <div key={c._id} style={dashStyles.catChip}>
                                <Layers size={12} color="#64748b" />
                                <span>{c.name}</span>
                                <Trash2 size={12} style={{cursor:'pointer', color:'#ef4444'}} onClick={() => deleteCategory(c._id)} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <header style={{...dashStyles.header, flexDirection: isMobile ? 'column' : 'row'}}>
                <div style={dashStyles.headerInfo}>
                    <div style={dashStyles.liveTag}><Zap size={12} fill="currentColor" /> Market Rate: ৳{bdtRate}</div>
                    <h2 style={{...dashStyles.mainTitle, fontSize: isMobile ? '28px' : '36px'}}>Verified Earnings</h2>
                    <p style={dashStyles.subtitle}>Manage your income and professional level.</p>
                </div>
                <div style={dashStyles.securityBadge}><ShieldCheck size={16} color="#10b981" /> <span>SSL Secured</span></div>
            </header>

            <div style={{...dashStyles.statsGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(340px, 1fr))'}}>
                
                {/* BALANCE CARD */}
                <motion.div whileHover={{y: -5}} style={dashStyles.balanceCard}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <div>
                            <div style={dashStyles.cardLabel}>Available Balance</div>
                            <div style={{...dashStyles.balance, fontSize: isMobile ? '36px' : '48px'}}>${balance}.00</div>
                            <div style={dashStyles.bdtEquiv}>≈ ৳{(balance * bdtRate).toLocaleString()} BDT</div>
                        </div>
                        <div style={dashStyles.iconCircle}><Wallet color="#10b981" size={24} /></div>
                    </div>
                    <div style={dashStyles.limitIndicator}>
                        <div style={dashStyles.limitTrack}>
                            <motion.div initial={{width: 0}} animate={{width: `${Math.min((balance / 10) * 100, 100)}%`}} style={dashStyles.limitBar} />
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '8px'}}>
                            <span style={dashStyles.limitText}>Min. Withdraw: $10.00</span>
                            <span style={{...dashStyles.limitText, color: balance >= 10 ? '#10b981' : '#94a3b8'}}>{balance >= 10 ? 'Ready' : `${Math.floor((balance/10)*100)}%`}</span>
                        </div>
                    </div>
                    <button onClick={() => setWithdrawMode(true)} disabled={balance < 10} style={{...dashStyles.withdrawTrigger, opacity: balance < 10 ? 0.5 : 1}}>
                        <Smartphone size={18} /> Cash Out to MFS
                    </button>
                </motion.div>

                {/* RANK CARD */}
                <motion.div whileHover={{y: -5}} style={dashStyles.card}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '18px'}}>
                        <div style={{...dashStyles.cardLabel, color: '#6366f1'}}>Level Progression</div>
                        <TrendingUp size={18} color="#6366f1" />
                    </div>
                    <div style={dashStyles.levelTitle}>Level {currentLevel} Specialist</div>
                    <div style={dashStyles.progressTrack}>
                        <motion.div initial={{width: 0}} animate={{width: `${progress}%`}} style={dashStyles.progressBar} />
                    </div>
                    <div style={dashStyles.cardFooter}>
                        <strong>{currentPoints} XP Total</strong> • {nextLevelXP - (currentPoints % nextLevelXP)} XP to next rank
                    </div>
                </motion.div>
            </div>

            {/* WITHDRAWAL FORM */}
            <AnimatePresence>
                {withdrawMode && (
                    <motion.div initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}} exit={{height: 0, opacity: 0}} style={{...dashStyles.withdrawForm, padding: isMobile ? '25px' : '35px'}}>
                        <div style={dashStyles.formHeader}>
                            <div style={dashStyles.mfsIcon}><Landmark size={22} color="#10b981" /></div>
                            <div>
                                <h3 style={{margin: 0, fontSize: '20px', fontWeight: '800'}}>Local Payout</h3>
                                <p style={{margin: 0, fontSize: '12px', color: '#64748b'}}>Instant Settlement enabled</p>
                            </div>
                        </div>
                        <div style={{...dashStyles.formGrid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr'}}>
                            <div style={dashStyles.inputGroup}>
                                <label style={dashStyles.label}>MFS Service</label>
                                <select style={dashStyles.select} value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)}>
                                    <option value="bKash">bKash Personal</option>
                                    <option value="Nagad">Nagad Personal</option>
                                    <option value="Upay">Upay Personal</option>
                                </select>
                            </div>
                            <div style={dashStyles.inputGroup}>
                                <label style={dashStyles.label}>Account No.</label>
                                <input style={dashStyles.input} placeholder="01XXXXXXXXX" maxLength="11" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
                            </div>
                        </div>
                        <div style={dashStyles.actionRow}>
                            <button onClick={handleWithdrawRequest} style={dashStyles.confirmBtn}>Process Payout</button>
                            <button onClick={() => setWithdrawMode(false)} style={dashStyles.cancelBtn}>Cancel</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* LOGS */}
            <div style={dashStyles.card}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px'}}>
                    <div style={dashStyles.historyIcon}><History size={18} color="#64748b" /></div>
                    <h3 style={{margin: 0, fontSize: '20px', fontWeight: '800'}}>Verified Earnings Log</h3>
                </div>
                {user?.skills?.length > 0 ? (
                    user.skills.map((skill, i) => (
                        <div key={i} style={{...dashStyles.logItem, flexDirection: isMobile ? 'column' : 'row'}}>
                            <div style={dashStyles.logInfo}>
                                <div style={dashStyles.logIcon}><CheckCircle2 size={16} color="#10b981" /></div>
                                <div>
                                    <div style={dashStyles.logTitle}>Cert: {skill}</div>
                                    <div style={dashStyles.logDate}>Verified 2026</div>
                                </div>
                            </div>
                            <div style={dashStyles.logAmount}>+$50.00</div>
                        </div>
                    ))
                ) : (
                    <div style={dashStyles.emptyLogs}>
                        <AlertCircle size={40} color="#e2e8f0" />
                        <p style={{margin: '15px 0', fontWeight: '800'}}>No verified income yet</p>
                    </div>
                )}
            </div>
            
            <button onClick={() => setView('learning')} style={dashStyles.learnMoreBtn}>
                Unlock More Modules <ArrowRight size={18} />
            </button>
        </div>
    );
}

const dashStyles = {
    container: { maxWidth: '1100px', margin: '0 auto' },
    adminPanel: { background: '#fff', padding: '20px', borderRadius: '24px', marginBottom: '30px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    adminHeader: { display:'flex', alignItems:'center', gap:'10px', marginBottom:'15px' },
    adminRow: { display:'flex', gap:'10px', marginBottom:'15px' },
    adminInput: { flex:1, padding:'12px', borderRadius:'12px', border:'1px solid #e2e8f0' },
    adminAddBtn: { background:'#0f172a', color:'#fff', border:'none', padding:'0 20px', borderRadius:'12px', fontWeight:'bold', cursor:'pointer' },
    catScroll: { display:'flex', flexWrap:'wrap', gap:'8px' },
    catChip: { background:'#f8fafc', padding:'6px 12px', borderRadius:'8px', fontSize:'12px', display:'flex', alignItems:'center', gap:'8px', border:'1px solid #e2e8f0', fontWeight:'700' },
    header: { marginBottom: '40px', display: 'flex', justifyContent: 'space-between', gap: '20px' },
    liveTag: { display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fff7ed', color: '#c2410c', fontSize: '10px', fontWeight: '900', padding: '4px 10px', borderRadius: '50px', marginBottom: '10px' },
    mainTitle: { margin: 0, fontWeight: '950', color: '#0f172a' },
    subtitle: { color: '#64748b', fontSize: '15px' },
    securityBadge: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '50px', background: '#f0fdf4', color: '#166534', fontSize: '12px', fontWeight: '800' },
    statsGrid: { display: 'grid', gap: '30px', marginBottom: '40px' },
    card: { background: '#fff', padding: '30px', borderRadius: '28px', border: '1px solid #e2e8f0', position: 'relative' },
    balanceCard: { background: '#0f172a', padding: '35px', borderRadius: '32px', color: '#fff' },
    cardLabel: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.5, marginBottom: '12px' },
    balance: { fontWeight: '900', color: '#10b981' },
    bdtEquiv: { fontSize: '16px', color: '#94a3b8', marginTop: '4px' },
    iconCircle: { background: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '18px' },
    limitIndicator: { marginTop: '25px', padding: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '18px' },
    limitTrack: { height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' },
    limitBar: { height: '100%', background: '#10b981', transition: 'width 1s ease' },
    limitText: { fontSize: '10px', color: '#94a3b8', fontWeight: '800' },
    withdrawTrigger: { background: '#10b981', color: '#fff', border: 'none', padding: '18px', borderRadius: '16px', marginTop: '20px', fontWeight: '900', width: '100%', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px' },
    levelTitle: { fontSize: '24px', fontWeight: '900', color: '#1e293b', marginBottom: '15px' },
    progressTrack: { height: '14px', background: '#f1f5f9', borderRadius: '20px', overflow: 'hidden', marginBottom: '15px' },
    progressBar: { height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)' },
    cardFooter: { fontSize: '13px', color: '#64748b', fontWeight: '700' },
    withdrawForm: { background: '#fff', borderRadius: '32px', border: '3px solid #10b981', marginBottom: '40px' },
    formHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' },
    mfsIcon: { background: '#f0fdf4', padding: '12px', borderRadius: '16px' },
    formGrid: { display: 'grid', gap: '25px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '13px', fontWeight: '900', color: '#475569' },
    select: { width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', fontWeight: '700' },
    input: { width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', fontWeight: '700', fontSize: '18px' },
    actionRow: { display: 'flex', gap: '15px', marginTop: '35px' },
    confirmBtn: { flex: 2, background: '#0f172a', color: '#fff', border: 'none', padding: '18px', borderRadius: '16px', fontWeight: '950', cursor: 'pointer' },
    cancelBtn: { flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', padding: '18px', borderRadius: '16px', fontWeight: '900', cursor: 'pointer' },
    logItem: { display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid #f8fafc' },
    logInfo: { display: 'flex', gap: '15px', alignItems: 'center' },
    logIcon: { background: '#f0fdf4', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    logTitle: { fontSize: '15px', fontWeight: '800' },
    logDate: { fontSize: '12px', color: '#94a3b8' },
    logAmount: { color: '#10b981', fontWeight: '950', fontSize: '20px' },
    emptyLogs: { textAlign: 'center', padding: '60px 0' },
    historyIcon: { width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '12px', display:'flex', alignItems:'center', justifyContent:'center' },
    learnMoreBtn: { width: '100%', padding: '22px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '24px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginTop: '20px' }
};