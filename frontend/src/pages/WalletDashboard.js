import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wallet, 
    TrendingUp, 
    Landmark, 
    History, 
    AlertCircle, 
    CheckCircle2, 
    ArrowRight, 
    Smartphone, 
    ShieldCheck,
    Zap,
    CreditCard
} from 'lucide-react';

export default function WalletDashboard({ user, setView, setUser }) {
    const [withdrawMode, setWithdrawMode] = useState(false);
    const [payoutMethod, setPayoutMethod] = useState('bKash');
    const [phone, setPhone] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Responsive Tracker
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // XP & Level Logic (Synced with Global State)
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

        const bdtAmount = (balance * bdtRate).toLocaleString();
        alert(`Success! ৳${bdtAmount} will be sent to your ${payoutMethod} account (${phone}) within 24 hours. Your request ID: TBD-${Math.floor(Math.random() * 90000) + 10000}`);
        
        setWithdrawMode(false);
        setPhone('');
    };

    return (
        <div style={{
            ...dashStyles.container,
            padding: isMobile ? '20px 15px' : '40px 25px'
        }}>
            <header style={{
                ...dashStyles.header,
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center'
            }}>
                <div style={dashStyles.headerInfo}>
                    <div style={dashStyles.liveTag}><Zap size={12} fill="currentColor" /> Live Market Rate: ৳{bdtRate}</div>
                    <h2 style={{...dashStyles.mainTitle, fontSize: isMobile ? '28px' : '36px'}}>Verified Earnings</h2>
                    <p style={dashStyles.subtitle}>Your talent is an asset. Manage your skill-based income here.</p>
                </div>
                <div style={dashStyles.securityBadge}>
                    <ShieldCheck size={16} color="#10b981" /> 
                    <span>SSL Secured Payouts</span>
                </div>
            </header>

            <div style={{
                ...dashStyles.statsGrid,
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(340px, 1fr))'
            }}>
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
                            <motion.div 
                                initial={{width: 0}}
                                animate={{width: `${Math.min((balance / 10) * 100, 100)}%`}}
                                style={dashStyles.limitBar} 
                            />
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '8px'}}>
                            <span style={dashStyles.limitText}>Min. Withdraw: $10.00</span>
                            <span style={{...dashStyles.limitText, color: balance >= 10 ? '#10b981' : '#94a3b8'}}>
                                {balance >= 10 ? 'Ready' : `${Math.floor((balance/10)*100)}%`}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={() => setWithdrawMode(true)}
                        disabled={balance < 10}
                        style={{
                            ...dashStyles.withdrawTrigger, 
                            opacity: balance < 10 ? 0.5 : 1,
                            cursor: balance < 10 ? 'not-allowed' : 'pointer'
                        }}
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
                            transition={{duration: 1.2, ease: "easeOut"}}
                            style={dashStyles.progressBar} 
                        />
                    </div>
                    <div style={dashStyles.cardFooter}>
                        <strong>{currentPoints} XP Total</strong> • {nextLevelXP - (currentPoints % nextLevelXP)} XP to next rank
                    </div>
                    <div style={dashStyles.rankBadge}>
                        <CheckCircle2 size={12} /> Rank Verified
                    </div>
                </motion.div>
            </div>

            {/* WITHDRAWAL FORM */}
            <AnimatePresence>
                {withdrawMode && (
                    <motion.div 
                        initial={{height: 0, opacity: 0, y: -20}} 
                        animate={{height: 'auto', opacity: 1, y: 0}} 
                        exit={{height: 0, opacity: 0, y: -20}}
                        style={{...dashStyles.withdrawForm, padding: isMobile ? '25px' : '35px'}}
                    >
                        <div style={dashStyles.formHeader}>
                            <div style={dashStyles.mfsIcon}><Landmark size={22} color="#10b981" /></div>
                            <div>
                                <h3 style={{margin: 0, fontSize: '20px', fontWeight: '800'}}>Local Payout Method</h3>
                                <p style={{margin: 0, fontSize: '12px', color: '#64748b'}}>Instant MFS Settlement enabled</p>
                            </div>
                        </div>
                        
                        <div style={{
                            ...dashStyles.formGrid,
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))'
                        }}>
                            <div style={dashStyles.inputGroup}>
                                <label style={dashStyles.label}>Mobile Financial Service</label>
                                <div style={dashStyles.selectWrapper}>
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

                        <div style={{...dashStyles.actionRow, flexDirection: isMobile ? 'column' : 'row'}}>
                            <button onClick={handleWithdrawRequest} style={dashStyles.confirmBtn}>Process Payout</button>
                            <button onClick={() => setWithdrawMode(false)} style={dashStyles.cancelBtn}>Cancel</button>
                        </div>
                        <p style={dashStyles.disclaimer}>Locked conversion rate: 1 USD = {bdtRate} BDT. Standard network fees apply.</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* EARNING LOGS */}
            <div style={{...dashStyles.card, padding: isMobile ? '20px' : '30px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px'}}>
                    <div style={dashStyles.historyIcon}><History size={18} color="#64748b" /></div>
                    <h3 style={{margin: 0, fontSize: '20px', fontWeight: '800'}}>Verified Earnings Log</h3>
                </div>
                
                <div style={dashStyles.logsContainer}>
                    {user?.skills?.length > 0 ? (
                        user.skills.map((skill, i) => (
                            <div key={i} style={{
                                ...dashStyles.logItem,
                                flexDirection: isMobile ? 'column' : 'row',
                                alignItems: isMobile ? 'flex-start' : 'center',
                                gap: isMobile ? '10px' : '0'
                            }}>
                                <div style={dashStyles.logInfo}>
                                    <div style={dashStyles.logIcon}><CheckCircle2 size={16} color="#10b981" /></div>
                                    <div>
                                        <div style={dashStyles.logTitle}>Certification Bonus: {skill}</div>
                                        <div style={dashStyles.logDate}>Status: Verified & Credited • 2026</div>
                                    </div>
                                </div>
                                <div style={{...dashStyles.logAmount, alignSelf: isMobile ? 'flex-end' : 'center'}}>+$50.00</div>
                            </div>
                        ))
                    ) : (
                        <div style={dashStyles.emptyLogs}>
                            <AlertCircle size={40} color="#e2e8f0" />
                            <p style={{margin: '15px 0 0', fontWeight: '800', color: '#1e293b'}}>No verified income yet</p>
                            <span style={{fontSize: '13px', color: '#94a3b8'}}>Take a verification quiz to earn your first $50.</span>
                        </div>
                    )}
                </div>
            </div>
            
            <button onClick={() => setView('learning')} style={dashStyles.learnMoreBtn}>
                Unlock More Modules to Earn <ArrowRight size={18} />
            </button>
        </div>
    );
}

const dashStyles = {
    container: { maxWidth: '1100px', margin: '0 auto' },
    header: { marginBottom: '40px', display: 'flex', justifyContent: 'space-between', gap: '20px' },
    liveTag: { display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fff7ed', color: '#c2410c', fontSize: '10px', fontWeight: '900', padding: '4px 10px', borderRadius: '50px', marginBottom: '10px', border: '1px solid #ffedd5' },
    mainTitle: { margin: 0, fontWeight: '950', color: '#0f172a', letterSpacing: '-2px' },
    subtitle: { color: '#64748b', marginTop: '6px', fontSize: '15px', fontWeight: '500' },
    securityBadge: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '50px', background: '#f0fdf4', color: '#166534', fontSize: '12px', fontWeight: '800', border: '1px solid #bbf7d0', boxShadow: '0 4px 10px rgba(16,185,129,0.05)' },
    statsGrid: { display: 'grid', gap: '30px', marginBottom: '40px' },
    card: { background: '#fff', padding: '30px', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)', position: 'relative' },
    balanceCard: { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '35px', borderRadius: '32px', color: '#fff', boxShadow: '0 25px 50px -12px rgba(15,23,42,0.25)', border: '1px solid rgba(255,255,255,0.05)' },
    cardLabel: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900', opacity: 0.5, marginBottom: '12px' },
    balance: { fontWeight: '900', color: '#10b981', letterSpacing: '-2px' },
    bdtEquiv: { fontSize: '16px', color: '#94a3b8', marginTop: '4px', fontWeight: '700' },
    iconCircle: { background: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '18px' },
    limitIndicator: { marginTop: '25px', padding: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)' },
    limitTrack: { height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' },
    limitBar: { height: '100%', background: '#10b981', transition: 'width 1s ease' },
    limitText: { fontSize: '10px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' },
    withdrawTrigger: { background: '#10b981', color: '#fff', border: 'none', padding: '18px', borderRadius: '16px', marginTop: '20px', fontWeight: '900', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '16px', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 10px 20px rgba(16,185,129,0.2)' },
    levelTitle: { fontSize: '24px', fontWeight: '900', color: '#1e293b', marginBottom: '15px', letterSpacing: '-0.5px' },
    progressTrack: { height: '14px', background: '#f1f5f9', borderRadius: '20px', overflow: 'hidden', marginBottom: '15px', border: '1px solid #e2e8f0' },
    progressBar: { height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '20px' },
    cardFooter: { fontSize: '13px', color: '#64748b', fontWeight: '700' },
    rankBadge: { position: 'absolute', top: '30px', right: '30px', background: '#eef2ff', color: '#6366f1', padding: '4px 10px', borderRadius: '50px', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px' },
    withdrawForm: { background: '#fff', borderRadius: '32px', border: '3px solid #10b981', marginBottom: '40px', boxShadow: '0 30px 60px -12px rgba(16,185,129,0.15)' },
    formHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' },
    mfsIcon: { background: '#f0fdf4', padding: '12px', borderRadius: '16px' },
    formGrid: { display: 'grid', gap: '25px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '13px', fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' },
    selectWrapper: { position: 'relative' },
    select: { width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontWeight: '700', color: '#1e293b', appearance: 'none' },
    input: { width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontWeight: '700', fontSize: '18px', color: '#1e293b', boxSizing: 'border-box' },
    actionRow: { display: 'flex', gap: '15px', marginTop: '35px' },
    confirmBtn: { flex: 2, background: '#0f172a', color: '#fff', border: 'none', padding: '18px', borderRadius: '16px', fontWeight: '950', cursor: 'pointer', fontSize: '16px', transition: '0.2s', boxShadow: '0 10px 20px rgba(15,23,42,0.2)' },
    cancelBtn: { flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', padding: '18px', borderRadius: '16px', fontWeight: '900', cursor: 'pointer', fontSize: '15px' },
    disclaimer: { fontSize: '11px', color: '#94a3b8', marginTop: '20px', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
    logsContainer: { display: 'flex', flexDirection: 'column' },
    logItem: { display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid #f8fafc' },
    logInfo: { display: 'flex', gap: '15px', alignItems: 'center' },
    logIcon: { background: '#f0fdf4', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    logTitle: { fontSize: '15px', fontWeight: '800', color: '#1e293b' },
    logDate: { fontSize: '12px', color: '#94a3b8', marginTop: '2px', fontWeight: '600' },
    logAmount: { color: '#10b981', fontWeight: '950', fontSize: '20px' },
    emptyLogs: { textAlign: 'center', padding: '60px 0' },
    historyIcon: { width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    learnMoreBtn: { width: '100%', padding: '22px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '24px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', fontSize: '17px', boxShadow: '0 15px 30px -5px rgba(99, 102, 241, 0.4)', transition: 'all 0.3s ease', marginTop: '20px' }
};