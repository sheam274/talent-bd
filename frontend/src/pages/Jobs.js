import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Lock, CheckCircle, Zap, TrendingUp, X, Sparkles, DollarSign } from 'lucide-react';

export default function Jobs({ user, setView, jobs = [] }) {
    const [showSuccess, setShowSuccess] = useState(false);
    const [appliedJob, setAppliedJob] = useState(null);

    // Standardized skill matching
    const userSkills = user?.skills?.map(s => s.toLowerCase().trim()) || [];
    const checkSkill = (requiredSkill) => userSkills.includes(requiredSkill?.toLowerCase().trim());

    const displayJobs = jobs || []; 
    const potentialEarnings = displayJobs.reduce((acc, job) => acc + (Number(job.reward) || 0), 0);
    const unlockedEarnings = displayJobs
        .filter(job => checkSkill(job.skill))
        .reduce((acc, job) => acc + (Number(job.reward) || 0), 0);

    const handleApplyClick = (job) => {
        setAppliedJob(job);
        setShowSuccess(true);
    };

    return (
        <div style={jobStyles.container}>
            {/* STATS OVERVIEW */}
            <div style={jobStyles.statsRow}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={jobStyles.statItem}>
                    <div style={jobStyles.statIconBox}><TrendingUp size={20} color="#10b981" /></div>
                    <div>
                        <span style={jobStyles.statLabel}>Available to Earn</span>
                        <div style={jobStyles.statValue}>${unlockedEarnings} <small style={jobStyles.statSub}>of ${potentialEarnings}</small></div>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={jobStyles.statItem}>
                    <div style={{...jobStyles.statIconBox, background: '#eff6ff'}}><Zap size={20} color="#2563eb" /></div>
                    <div>
                        <span style={jobStyles.statLabel}>Skill Badge Power</span>
                        <div style={jobStyles.statValue}>{user?.skills?.length || 0} Badges</div>
                    </div>
                </motion.div>
            </div>

            <header style={jobStyles.headerSection}>
                <div>
                    <h2 style={jobStyles.pageTitle}>Gig Marketplace</h2>
                    <p style={jobStyles.pageSubtitle}>Complete micro-tasks that match your verified credentials.</p>
                </div>
                <div style={jobStyles.liveBadge}>● LIVE FEED</div>
            </header>

            <div style={jobStyles.jobGrid}>
                {displayJobs.map((job) => {
                    const isLocked = !checkSkill(job.skill);

                    return (
                        <motion.div 
                            key={job.id} 
                            whileHover={{ y: -8 }} 
                            style={{
                                ...jobStyles.jobCard,
                                borderTop: isLocked ? '4px solid #e2e8f0' : '4px solid #10b981',
                            }}
                        >
                            <div style={jobStyles.cardTopRow}>
                                <span style={{
                                    ...jobStyles.typeTag, 
                                    color: isLocked ? '#94a3b8' : '#10b981',
                                    background: isLocked ? '#f8fafc' : '#f0fdf4'
                                }}>{job.type || 'Gig'}</span>
                                <div style={{display: 'flex', alignItems: 'center', gap: '4px', color: '#0f172a'}}>
                                    <DollarSign size={18} />
                                    <span style={{fontSize: '24px', fontWeight: '900'}}>{job.reward}</span>
                                </div>
                            </div>

                            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                                <Briefcase size={18} color="#2563eb" />
                                <h3 style={{...jobStyles.jobTitle, margin: 0}}>{job.title}</h3>
                            </div>
                            
                            <p style={jobStyles.jobDesc}>{job.desc || `Opportunity for specialists in ${job.skill}.`}</p>
                            
                            <div style={{
                                ...jobStyles.skillReq,
                                background: isLocked ? '#f8fafc' : '#f0fdf4'
                            }}>
                                {isLocked ? <Lock size={14} color="#94a3b8" /> : <CheckCircle size={14} color="#10b981" />}
                                <span style={{ 
                                    fontSize: '12px', 
                                    fontWeight: '700', 
                                    color: isLocked ? '#64748b' : '#10b981' 
                                }}>
                                    {job.skill} Required
                                </span>
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                                {isLocked ? (
                                    <button onClick={() => setView('learning')} style={jobStyles.learnBtn}>
                                        <Zap size={14} /> Get Badge to Unlock
                                    </button>
                                ) : (
                                    <button onClick={() => handleApplyClick(job)} style={jobStyles.applyBtn}>
                                        Apply & Earn
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* SUCCESS POPUP MODAL */}
            <AnimatePresence>
                {showSuccess && (
                    <div style={popupStyles.overlay}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={popupStyles.modal}
                        >
                            <button onClick={() => setShowSuccess(false)} style={popupStyles.closeX}><X size={20}/></button>
                            <div style={popupStyles.successIcon}>
                                <Sparkles size={32} color="#fff" />
                            </div>
                            <h2 style={popupStyles.modalTitle}>Proposal Submitted!</h2>
                            <p style={popupStyles.modalText}>
                                Your <strong>{appliedJob?.skill} Credentials</strong> were securely shared.
                            </p>
                            
                            <div style={popupStyles.summaryBox}>
                                <div style={popupStyles.summaryItem}><span>Status:</span> <strong>Pending</strong></div>
                                <div style={{...popupStyles.summaryItem, border:'none', color: '#10b981'}}>
                                    <span>Potential Pay:</span> 
                                    <strong style={{display: 'flex', alignItems: 'center'}}><DollarSign size={14}/>{appliedJob?.reward}</strong>
                                </div>
                            </div>
                            
                            <button onClick={() => setShowSuccess(false)} style={jobStyles.applyBtn}>Continue Browsing</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Styles preserved and enhanced for your specific layout
const jobStyles = {
    container: { maxWidth: '1100px', margin: '0 auto', padding: '60px 20px' },
    headerSection: { marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    pageTitle: { margin: 0, fontSize: '32px', fontWeight: '900', letterSpacing: '-1px' },
    pageSubtitle: { color: '#64748b', margin: '5px 0 0 0', fontSize: '16px' },
    liveBadge: { background: '#fef2f2', color: '#ef4444', padding: '6px 12px', borderRadius: '50px', fontSize: '10px', fontWeight: '900', letterSpacing: '1px' },
    statsRow: { display: 'flex', gap: '20px', marginBottom: '50px' },
    statItem: { flex: 1, background: '#fff', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' },
    statIconBox: { width: '48px', height: '48px', background: '#ecfdf5', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    statLabel: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' },
    statValue: { fontSize: '24px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'baseline', gap: '8px' },
    statSub: { fontSize:'13px', fontWeight: '600', color:'#94a3b8' },
    jobGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' },
    jobCard: { background: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', minHeight: '380px', transition: 'box-shadow 0.3s' },
    cardTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    typeTag: { padding: '5px 14px', borderRadius: '50px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' },
    jobTitle: { fontSize: '20px', fontWeight: '800', color: '#1e293b', lineHeight: '1.4' },
    jobDesc: { fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' },
    skillReq: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '12px' },
    applyBtn: { width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', cursor: 'pointer', fontWeight: '800', fontSize: '15px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' },
    learnBtn: { width: '100%', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '14px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }
};

const popupStyles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
    modal: { background: '#fff', padding: '50px 40px', borderRadius: '32px', maxWidth: '440px', width: '92%', textAlign: 'center', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
    closeX: { position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1' },
    successIcon: { width: '70px', height: '70px', background: '#10b981', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', transform: 'rotate(-10deg)', boxShadow: '0 15px 30px rgba(16, 185, 129, 0.4)' },
    modalTitle: { margin: '0 0 10px 0', fontSize: '26px', fontWeight: '900', letterSpacing: '-1px' },
    modalText: { color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: '0 0 30px 0' },
    summaryBox: { textAlign: 'left', background: '#f8fafc', padding: '24px', borderRadius: '20px', marginBottom: '35px', border: '1px solid #e2e8f0' },
    summaryItem: { display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' }
};