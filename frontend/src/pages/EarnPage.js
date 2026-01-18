import React, { useState, useEffect } from 'react';
import { 
    Briefcase, Lock, CheckCircle, ArrowRight, 
    DollarSign, Zap, Globe, ShieldCheck, TrendingUp 
} from 'lucide-react';

export default function EarnPage({ user, setView }) {
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Track responsiveness for HP-840 vs Mobile
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        // Simulate loading state for AI-driven gig matching
        const timer = setTimeout(() => setLoading(false), 800);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, []);

    const userSkills = user?.skills || [];

    // SYNC: Gig data with integrated skill-dependency logic
    const GIGS = [
        { id: 1, title: 'Fix React Header Bug', reward: 15, requiredSkill: 'React', category: 'Dev', urgency: 'High' },
        { id: 2, title: 'Python Data Scraper', reward: 40, requiredSkill: 'Python', category: 'Data', urgency: 'Normal' },
        { id: 3, title: 'Figma UI Component', reward: 25, requiredSkill: 'Figma', category: 'Design', urgency: 'Normal' },
        { id: 4, title: 'Node.js API Auth Fix', reward: 60, requiredSkill: 'Node.js', category: 'Dev', urgency: 'Urgent' }
    ];

    const handleApply = (gig) => {
        alert(`🚀 CONTRACT ACTIVATED: ${gig.title}\nReward: $${gig.reward} will be credited to your TalentBD Wallet on approval.`);
    };

    return (
        <div style={styles.container}>
            {/* Header / Stats Bar */}
            <header style={{...styles.header, flexDirection: isMobile ? 'column' : 'row'}}>
                <div style={styles.headerText}>
                    <div style={styles.liveBadge}><span style={styles.pulseDot}></span> Live Opportunities</div>
                    <h2 style={styles.title}>Gig <span style={{color:'#2563eb'}}>Marketplace</span></h2>
                    <p style={styles.subtitle}>Apply your verified skills to complete micro-tasks for global currency.</p>
                </div>
                
                <div style={{...styles.statCard, width: isMobile ? '100%' : 'auto'}}>
                    <div style={styles.statInfo}>
                        <ShieldCheck size={16} color="#2563eb" />
                        <span style={styles.statLabel}>Your Skill Arsenal:</span>
                    </div>
                    <div style={styles.userSkills}>
                        {userSkills.length > 0 ? (
                            userSkills.map(s => <span key={s} style={styles.skillBadge}>{s}</span>)
                        ) : (
                            <button onClick={() => setView('learning')} style={styles.emptySkillBtn}>
                                Verify your first skill
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Marketplace Grid */}
            <div style={{
                ...styles.grid, 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))'
            }}>
                {GIGS.map(gig => {
                    const unlocked = userSkills.some(s => s.toLowerCase() === gig.requiredSkill.toLowerCase());
                    
                    return (
                        <div key={gig.id} style={{
                            ...styles.gigCard,
                            borderColor: unlocked ? '#e2e8f0' : '#f1f5f9',
                            background: unlocked ? '#fff' : '#fcfdfe'
                        }}>
                            {/* Category & Status */}
                            <div style={styles.cardHeader}>
                                <span style={styles.categoryTag}>{gig.category}</span>
                                {gig.urgency === 'Urgent' && <span style={styles.urgentTag}>Urgent</span>}
                            </div>

                            <div style={styles.rewardBox}>
                                <DollarSign size={16} />
                                <span style={styles.rewardAmount}>{gig.reward}</span>
                            </div>

                            <div style={styles.cardBody}>
                                <h3 style={{...styles.gigTitle, color: unlocked ? '#1e293b' : '#94a3b8'}}>
                                    {gig.title}
                                </h3>
                                
                                <div style={styles.requirementRow}>
                                    <span style={styles.reqLabel}>Requirement:</span>
                                    <div style={{
                                        ...styles.reqBadge,
                                        color: unlocked ? '#16a34a' : '#dc2626',
                                        backgroundColor: unlocked ? '#f0fdf4' : '#fef2f2'
                                    }}>
                                        {unlocked ? <CheckCircle size={12} /> : <Lock size={12} />}
                                        {gig.requiredSkill}
                                    </div>
                                </div>

                                {unlocked ? (
                                    <button onClick={() => handleApply(gig)} style={styles.applyBtn}>
                                        Start Gig <ArrowRight size={18} />
                                    </button>
                                ) : (
                                    <button onClick={() => setView('learning')} style={styles.lockBtn}>
                                        <Zap size={14} /> Get {gig.requiredSkill} Certification
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: '1200px', margin: '40px auto', padding: '0 24px', minHeight: '85vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px', gap: '30px' },
    headerText: { flex: 1 },
    liveBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', marginBottom: '12px', border: '1px solid #dcfce7' },
    pulseDot: { width: '6px', height: '6px', background: '#16a34a', borderRadius: '50%', animation: 'pulse 1.5s infinite' },
    title: { fontSize: '36px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1.5px' },
    subtitle: { color: '#64748b', marginTop: '8px', fontSize: '16px', maxWidth: '500px', lineHeight: '1.5' },
    statCard: { background: '#fff', padding: '20px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', minWidth: '280px' },
    statInfo: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
    statLabel: { fontSize: '11px', fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' },
    userSkills: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    skillBadge: { background: '#f1f5f9', color: '#1e293b', padding: '5px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', border: '1px solid #e2e8f0' },
    emptySkillBtn: { background: 'none', border: '1px dashed #cbd5e1', color: '#64748b', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
    grid: { display: 'grid', gap: '25px' },
    gigCard: { borderRadius: '28px', border: '1px solid', position: 'relative', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column' },
    cardHeader: { padding: '20px 25px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    categoryTag: { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' },
    urgentTag: { background: '#fff1f2', color: '#e11d48', fontSize: '10px', fontWeight: '800', padding: '2px 10px', borderRadius: '20px' },
    rewardBox: { position: 'absolute', top: '20px', right: '25px', display: 'flex', alignItems: 'center', gap: '2px', background: '#0f172a', color: '#fff', padding: '6px 14px', borderRadius: '15px' },
    rewardAmount: { fontSize: '18px', fontWeight: '900' },
    cardBody: { padding: '30px 25px' },
    gigTitle: { fontSize: '20px', fontWeight: '800', margin: '0 0 15px', lineHeight: '1.3' },
    requirementRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' },
    reqLabel: { fontSize: '12px', color: '#64748b', fontWeight: '600' },
    reqBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' },
    applyBtn: { width: '100%', padding: '18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.2s', boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.3)' },
    lockBtn: { width: '100%', padding: '18px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '18px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '13px' }
};