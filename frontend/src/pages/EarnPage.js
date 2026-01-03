import React, { useState } from 'react';
import { Briefcase, Lock, CheckCircle, ArrowRight, DollarSign, Zap, ExternalLink } from 'lucide-react';

// Sample GIGS data if not imported externally
const GIGS = [
    { id: 1, title: 'Fix React Header Bug', reward: 15, requiredSkill: 'React', description: 'Small CSS/State alignment issue on a navigation component.' },
    { id: 2, title: 'Python Script for Scraping', reward: 40, requiredSkill: 'Python', description: 'Create a script to pull news data from 3 specific URLs.' },
    { id: 3, title: 'Logo Design for Startup', reward: 25, requiredSkill: 'Figma', description: 'Minimalist logo design for a fintech mobile application.' }
];

export default function EarnPage({ user, setView }) {
    const [submitting, setSubmitting] = useState(null);

    // FIXED: Ensure skills check is case-insensitive and handles undefined user skills
    const userSkills = user?.skills || [];

    const handleApply = (gig) => {
        // Logic to transition to a submission form or external link
        alert(`🚀 Starting Task: ${gig.title}. Complete this to add $${gig.reward} to your TalentBD Wallet!`);
        setSubmitting(gig);
    };

    return (
        <div style={styles.container}>
            {/* Header Section */}
            <header style={styles.header}>
                <div style={styles.headerText}>
                    <h2 style={styles.title}>Gig Marketplace</h2>
                    <p style={styles.subtitle}>Solve real problems for global clients to grow your wallet.</p>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statLabel}>Verified Skills:</span>
                    <div style={styles.userSkills}>
                        {userSkills.length > 0 ? (
                            userSkills.map(s => <span key={s} style={styles.skillBadge}>{s}</span>)
                        ) : (
                            <span style={{fontSize:'12px', color:'#94a3b8'}}>No skills earned yet</span>
                        )}
                    </div>
                </div>
            </header>

            {/* Gigs Grid */}
            <div style={styles.grid}>
                {GIGS.map(gig => {
                    // SYNC: Improved skill matching logic
                    const unlocked = userSkills.some(s => s.toLowerCase() === gig.requiredSkill.toLowerCase());
                    
                    return (
                        <div key={gig.id} style={{
                            ...styles.gigCard,
                            border: unlocked ? '1px solid #e2e8f0' : '1px solid #f1f5f9',
                            opacity: unlocked ? 1 : 0.9
                        }}>
                            {/* Reward Tag */}
                            <div style={styles.rewardBadge}>
                                <DollarSign size={14} />
                                {gig.reward}
                            </div>

                            <div style={styles.cardContent}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px'}}>
                                    {unlocked ? 
                                        <CheckCircle size={18} color="#16a34a" /> : 
                                        <Lock size={18} color="#94a3b8" />
                                    }
                                    <h3 style={styles.gigTitle}>{gig.title}</h3>
                                </div>
                                
                                <p style={styles.gigDesc}>{gig.description}</p>
                                
                                <div style={styles.requirementBox}>
                                    <span style={styles.reqLabel}>Requirement:</span>
                                    <span style={{
                                        ...styles.reqSkill,
                                        color: unlocked ? '#2563eb' : '#ef4444',
                                        background: unlocked ? '#eff6ff' : '#fef2f2'
                                    }}>
                                        {gig.requiredSkill}
                                    </span>
                                </div>

                                {unlocked ? (
                                    <button 
                                        onClick={() => handleApply(gig)} 
                                        style={styles.applyBtn}
                                    >
                                        Apply Now <ArrowRight size={16} />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setView('learning')} 
                                        style={styles.lockBtn}
                                    >
                                        <Zap size={14} /> Unlock with {gig.requiredSkill} Course
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State if no gigs */}
            {GIGS.length === 0 && (
                <div style={{textAlign:'center', padding:'100px 0'}}>
                    <Briefcase size={48} color="#cbd5e1" style={{marginBottom:'15px'}} />
                    <h3 style={{color:'#64748b'}}>Marketplace is currently resting.</h3>
                    <p style={{color:'#94a3b8'}}>Check back later for new micro-tasks!</p>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { maxWidth: '1100px', margin: '40px auto', padding: '0 20px', minHeight: '80vh' },
    header: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '20px'
    },
    headerText: { flex: '1', minWidth: '300px' },
    title: { fontSize: '32px', fontWeight: '900', color: '#1e293b', margin: 0, letterSpacing: '-1px' },
    subtitle: { color: '#64748b', marginTop: '5px', fontSize: '16px' },
    statCard: { background: '#fff', padding: '15px 20px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
    statLabel: { fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
    userSkills: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' },
    skillBadge: { background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', border: '1px solid #dbeafe' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' },
    gigCard: { 
        background: '#fff', 
        borderRadius: '20px', 
        position: 'relative', 
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
        border: '1px solid #e2e8f0'
    },
    rewardBadge: { 
        position: 'absolute', 
        top: '20px', 
        right: '20px', 
        background: '#dcfce7', 
        color: '#166534', 
        padding: '6px 14px', 
        borderRadius: '20px', 
        fontSize: '15px', 
        fontWeight: '900',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        zIndex: 2
    },
    cardContent: { padding: '30px' },
    gigTitle: { fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0, lineHeight: '1.4' },
    gigDesc: { fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: '15px 0' },
    requirementBox: { marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px' },
    reqLabel: { fontSize: '12px', color: '#94a3b8', fontWeight: '600' },
    reqSkill: { padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' },
    applyBtn: { 
        width: '100%', 
        padding: '14px', 
        background: '#2563eb', 
        color: '#fff', 
        border: 'none', 
        borderRadius: '12px', 
        fontWeight: '800', 
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: '0.2s',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
    },
    lockBtn: { 
        width: '100%', 
        padding: '14px', 
        background: '#f8fafc', 
        color: '#64748b', 
        border: '1px dashed #cbd5e1', 
        borderRadius: '12px', 
        fontWeight: '700', 
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '13px',
        transition: '0.2s'
    }
};