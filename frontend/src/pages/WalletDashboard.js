import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, Landmark, History, AlertCircle, CheckCircle2, ArrowRight, Smartphone, ShieldCheck } from 'lucide-react';

export default function WalletDashboard({ user, setView, setUser }) {
    const [withdrawMode, setWithdrawMode] = useState(false);
    const [payoutMethod, setPayoutMethod] = useState('bKash');
    const [phone, setPhone] = useState('');
    
    // XP & Level Logic
    const currentPoints = user?.points || 0;
    const nextLevelXP = 1000;
    const currentLevel = Math.floor(currentPoints / nextLevelXP) + 1;
    const progress = (currentPoints % nextLevelXP) / 10;
    const balance = user?.walletBalance || 0;
    const bdtRate = 118; // Updated 2026 conversion rate

    const handleWithdrawRequest = () => {
        if (balance < 10) {
            alert("Minimum withdrawal limit is $10 (approx. ৳1,180). Verify more skills to unlock cash out!");
            return;
        }
        if (!phone.match(/^01[3-9]\d{8}$/)) {
            alert("Please enter a valid 11-digit Bangladeshi mobile number (01XXXXXXXXX).");
            return;
        }

        // Production Simulation
        const bdtAmount = (balance * bdtRate).toLocaleString();
        alert(`Success! ৳${bdtAmount} will be sent to your ${payoutMethod} account (${phone}) within 24 hours. Your request ID: TBD-${Math.floor(Math.random() * 90000) + 10000}`);
        
        setWithdrawMode(false);
        setPhone('');
    };

    return (
        <div style={dashStyles.container}>
            <header style={dashStyles.header}>
                <div style={dashStyles.headerInfo}>
                    <h2 style={{margin: 0, fontSize: '32px', fontWeight: '900', letterSpacing: '-1px'}}>Verified Earnings</h2>
                    <p style={{color: '#64748b', marginTop: '6px', fontSize: '15px'}}>Your talent is an asset. Manage your skill-based income here.</p>
                </div>
                <div style={dashStyles.securityBadge}>
                    <ShieldCheck size={16} color="#10b981" /> 
                    <span>SSL Secured Payouts</span>
                </div>
            </header>

            <div style={dashStyles.statsGrid}>
                {/* BALANCE CARD */}
                <motion.div whileHover={{y: -5}} style={dashStyles.balanceCard}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <div>
                            <div style={dashStyles.cardLabel}>Available Balance</div>
                            <div style={dashStyles.balance}>${balance}.00</div>
                            <div style={dashStyles.bdtEquiv}>≈ ৳{(balance * bdtRate).toLocaleString()} BDT</div>
                        </div>
                        <div style={dashStyles.iconCircle}><Wallet color="#10b981" size={24} /></div>
                    </div>
                    
                    <div style={dashStyles.limitIndicator}>
                        <div style={dashStyles.limitTrack}>
                            <div style={{...dashStyles.limitBar, width: `${Math.min((balance / 10) * 100, 100)}%`}} />
                        </div>
                        <span style={dashStyles.limitText}>Min. Withdraw: $10.00</span>
                    </div>

                    <button 
                        onClick={() => setWithdrawMode(true)}
                        style={{...dashStyles.withdrawTrigger, opacity: balance < 10 ? 0.6 : 1}}
                    >
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
                        <motion.div 
                            initial={{width: 0}} 
                            animate={{width: `${progress}%`}} 
                            transition={{duration: 1}}
                            style={dashStyles.progressBar} 
                        />
                    </div>
                    <div style={dashStyles.cardFooter}>
                        <strong>{currentPoints} XP</strong> • {nextLevelXP - (currentPoints % nextLevelXP)} XP to next rank
                    </div>
                </motion.div>
            </div>

            {/* WITHDRAWAL FORM */}
            <AnimatePresence>
                {withdrawMode && (
                    <motion.div 
                        initial={{height: 0, opacity: 0}} 
                        animate={{height: 'auto', opacity: 1}} 
                        exit={{height: 0, opacity: 0}}
                        style={dashStyles.withdrawForm}
                    >
                        <div style={dashStyles.formHeader}>
                            <Landmark size={22} color="#10b981" />
                            <h3 style={{margin: 0, fontSize: '20px', fontWeight: '800'}}>Local Payout Method</h3>
                        </div>
                        
                        <div style={dashStyles.formGrid}>
                            <div style={dashStyles.inputGroup}>
                                <label style={dashStyles.label}>Mobile Financial Service</label>
                                <select 
                                    style={dashStyles.select} 
                                    value={payoutMethod} 
                                    onChange={(e) => setPayoutMethod(e.target.value)}
                                >
                                    <option value="bKash">bKash Personal</option>
                                    <option value="Nagad">Nagad Personal</option>
                                    <option value="Upay">Upay Personal</option>
                                </select>
                            </div>
                            <div style={dashStyles.inputGroup}>
                                <label style={dashStyles.label}>Account Number (11-digit)</label>
                                <input 
                                    style={dashStyles.input} 
                                    placeholder="01XXXXXXXXX" 
                                    type="tel" 
                                    maxLength="11"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                />
                            </div>
                        </div>

                        <div style={dashStyles.actionRow}>
                            <button onClick={handleWithdrawRequest} style={dashStyles.confirmBtn}>Process Payout</button>
                            <button onClick={() => setWithdrawMode(false)} style={dashStyles.cancelBtn}>Cancel</button>
                        </div>
                        <p style={dashStyles.disclaimer}>Locked conversion rate: 1 USD = {bdtRate} BDT. Standard network fees apply.</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* EARNING LOGS */}
            <div style={dashStyles.card}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px'}}>
                    <div style={dashStyles.historyIcon}><History size={18} color="#64748b" /></div>
                    <h3 style={{margin: 0, fontSize: '20px', fontWeight: '800'}}>Verified Earnings Log</h3>
                </div>
                
                <div style={dashStyles.logsContainer}>
                    {user?.skills?.length > 0 ? (
                        user.skills.map((skill, i) => (
                            <div key={i} style={dashStyles.logItem}>
                                <div style={dashStyles.logInfo}>
                                    <div style={dashStyles.logIcon}><CheckCircle2 size={16} color="#10b981" /></div>
                                    <div>
                                        <div style={dashStyles.logTitle}>Certification Bonus: {skill}</div>
                                        <div style={dashStyles.logDate}>Status: Verified & Credited • 2026</div>
                                    </div>
                                </div>
                                <div style={dashStyles.logAmount}>+$50.00</div>
                            </div>
                        ))
                    ) : (
                        <div style={dashStyles.emptyLogs}>
                            <AlertCircle size={40} color="#e2e8f0" />
                            <p style={{margin: '15px 0 0', fontWeight: '600'}}>No verified income yet</p>
                            <span style={{fontSize: '13px'}}>Take a verification quiz to earn your first $50.</span>
                        </div>
                    )}
                </div>
            </div>
            
            <button onClick={() => setView('learning')} style={dashStyles.learnMoreBtn}>
                Find Verification Modules to Earn More <ArrowRight size={18} />
            </button>
        </div>
    );
}

const dashStyles = {
    container: { maxWidth: '1100px', margin: '0 auto', padding: '60px 25px' },
    header: { marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' },
    securityBadge: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '50px', background: '#f0fdf4', color: '#166534', fontSize: '12px', fontWeight: '800', border: '1px solid #bbf7d0' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px', marginBottom: '40px' },
    card: { background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' },
    balanceCard: { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '35px', borderRadius: '28px', color: '#fff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
    cardLabel: { fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '900', opacity: 0.6, marginBottom: '12px' },
    balance: { fontSize: '42px', fontWeight: '900', color: '#10b981', letterSpacing: '-1px' },
    bdtEquiv: { fontSize: '16px', color: '#94a3b8', marginTop: '4px', fontWeight: '600' },
    iconCircle: { background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '15px' },
    limitIndicator: { marginTop: '25px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' },
    limitTrack: { height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' },
    limitBar: { height: '100%', background: '#10b981' },
    limitText: { fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' },
    withdrawTrigger: { background: '#10b981', color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', marginTop: '20px', fontWeight: '900', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px', transition: '0.2s' },
    levelTitle: { fontSize: '22px', fontWeight: '900', color: '#1e293b', marginBottom: '15px' },
    progressTrack: { height: '12px', background: '#f1f5f9', borderRadius: '20px', overflow: 'hidden', marginBottom: '15px', border: '1px solid #e2e8f0' },
    progressBar: { height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '20px' },
    cardFooter: { fontSize: '13px', color: '#64748b', fontWeight: '600' },
    withdrawForm: { background: '#fff', padding: '35px', borderRadius: '28px', border: '2px solid #10b981', marginBottom: '40px', boxShadow: '0 20px 40px -10px rgba(16,185,129,0.1)' },
    formHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
    label: { fontSize: '13px', fontWeight: '800', color: '#475569' },
    select: { padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontWeight: '600' },
    input: { padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontWeight: '600', fontSize: '16px' },
    actionRow: { display: 'flex', gap: '15px', marginTop: '30px' },
    confirmBtn: { flex: 2, background: '#0f172a', color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '15px' },
    cancelBtn: { flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer' },
    disclaimer: { fontSize: '12px', color: '#94a3b8', marginTop: '20px', textAlign: 'center', fontWeight: '500' },
    logsContainer: { display: 'flex', flexDirection: 'column' },
    logItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #f8fafc' },
    logInfo: { display: 'flex', gap: '15px', alignItems: 'center' },
    logIcon: { background: '#f0fdf4', padding: '10px', borderRadius: '50%' },
    logTitle: { fontSize: '15px', fontWeight: '800', color: '#1e293b' },
    logDate: { fontSize: '12px', color: '#94a3b8', marginTop: '2px' },
    logAmount: { color: '#10b981', fontWeight: '900', fontSize: '18px' },
    emptyLogs: { textAlign: 'center', padding: '60px 0', color: '#94a3b8' },
    historyIcon: { width: '36px', height: '36px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    learnMoreBtn: { width: '100%', padding: '20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '16px', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)', transition: '0.3s' }
};