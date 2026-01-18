import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Briefcase, Lock, CheckCircle, Zap, 
    TrendingUp, X, Sparkles, DollarSign, 
    Layers, MousePointer2, AlertCircle 
} from 'lucide-react';

export default function Jobs({ user, setView, jobs = [] }) {
    const [showSuccess, setShowSuccess] = useState(false);
    const [appliedJob, setAppliedJob] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Responsive Handling for HP-840 vs Mobile
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // SYNC: Standardized skill matching with User Profile
    const userSkills = user?.skills?.map(s => s.toLowerCase().trim()) || [];
    const checkSkill = (requiredSkill) => userSkills.includes(requiredSkill?.toLowerCase().trim());

    // Analytics Calculation
    const displayJobs = jobs.length > 0 ? jobs : [
        { id: 101, title: 'React UI Optimization', reward: 45, skill: 'React', type: 'Frontend' },
        { id: 102, title: 'Python Data Cleanup', reward: 30, skill: 'Python', type: 'Data' },
        { id: 103, title: 'Figma Brand Kit', reward: 25, skill: 'Figma', type: 'Design' }
    ]; 
    
    const unlockedEarnings = displayJobs
        .filter(job => checkSkill(job.skill))
        .reduce((acc, job) => acc + (Number(job.reward) || 0), 0);

    const handleApplyClick = (job) => {
        setAppliedJob(job);
        setShowSuccess(true);
    };

    return (
        <div style={styles.container}>
            {/* TOP ANALYTICS DASHBOARD */}
            <div style={{...styles.statsRow, flexDirection: isMobile ? 'column' : 'row'}}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={styles.statItem}>
                    <div style={styles.statIconBox}><TrendingUp size={20} color="#10b981" /></div>
                    <div>
                        <span style={styles.statLabel}>Available to Earn</span>
                        <div style={styles.statValue}>${unlockedEarnings} <small style={styles.statSub}>unlocked</small></div>
                    </div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={styles.statItem}>
                    <div style={{...styles.statIconBox, background: '#eff6ff'}}><Layers size={20} color="#2563eb" /></div>
                    <div>
                        <span style={styles.statLabel}>Market Status</span>
                        <div style={styles.statValue}>{displayJobs.length} <small style={styles.statSub}>Active Gigs</small></div>
                    </div>
                </motion.div>
            </div>

            {/* HEADER */}
            <header style={{...styles.headerSection, flexDirection: isMobile ? 'column' : 'row', gap: '20px'}}>
                <div>
                    <h2 style={styles.pageTitle}>Gig <span style={{color:'#2563eb'}}>Marketplace</span></h2>
                    <p style={styles.pageSubtitle}>Apply for verified micro-tasks to build your global wallet.</p>
                </div>
                <div style={styles.liveBadge}><span style={styles.pulse}></span> LIVE FEED</div>
            </header>

            {/* GIG GRID */}
            <div style={{
                ...styles.jobGrid, 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))'
            }}>
                {displayJobs.map((job) => {
                    const isLocked = !checkSkill(job.skill);

                    return (
                        <motion.div 
                            key={job.id} 
                            whileHover={{ y: -5 }} 
                            style={{
                                ...styles.jobCard,
                                borderBottom: isLocked ? '1px solid #e2e8f0' : '2px solid #10b981',
                                opacity: isLocked ? 0.85 : 1
                            }}
                        >
                            <div style={styles.cardTopRow}>
                                <div style={styles.rewardBox}>
                                    <DollarSign size={14} />
                                    <span>{job.reward}</span>
                                </div>
                                <span style={{
                                    ...styles.typeTag, 
                                    background: isLocked ? '#f1f5f9' : '#f0fdf4',
                                    color: isLocked ? '#64748b' : '#10b981'
                                }}>{job.type || 'Standard'}</span>
                            </div>

                            <h3 style={styles.jobTitle}>{job.title}</h3>
                            <p style={styles.jobDesc}>Complete this {job.skill} task to boost your Talent Score and earn rewards.</p>
                            
                            <div style={{
                                ...styles.skillReq,
                                background: isLocked ? '#fef2f2' : '#f0fdf4'
                            }}>
                                {isLocked ? <Lock size={14} color="#ef4444" /> : <CheckCircle size={14} color="#10b981" />}
                                <span style={{ 
                                    fontSize: '11px', 
                                    fontWeight: '800', 
                                    textTransform: 'uppercase',
                                    color: isLocked ? '#ef4444' : '#10b981' 
                                }}>
                                    {job.skill} Required
                                </span>
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                                {isLocked ? (
                                    <button onClick={() => setView('learning')} style={styles.lockBtn}>
                                        <Zap size={14} /> Unlock with Badge
                                    </button>
                                ) : (
                                    <button onClick={() => handleApplyClick(job)} style={styles.applyBtn}>
                                        Apply Now <MousePointer2 size={14} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* SUCCESS MODAL */}
            <AnimatePresence>
                {showSuccess && (
                    <div style={styles.overlay}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={styles.modal}
                        >
                            <button onClick={() => setShowSuccess(false)} style={styles.closeX}><X size={20}/></button>
                            <div style={styles.successIcon}>
                                <Sparkles size={32} color="#fff" />
                            </div>
                            <h2 style={styles.modalTitle}>Application Sent!</h2>
                            <p style={styles.modalText}>Your credentials for <strong>{appliedJob?.title}</strong> were verified via TalentBD AI.</p>
                            
                            <div style={styles.summaryBox}>
                                <div style={styles.summaryItem}><span>Gig Type</span> <strong>{appliedJob?.type}</strong></div>
                                <div style={{...styles.summaryItem, border:'none'}}><span>Expected Pay</span> <strong style={{color:'#10b981'}}>${appliedJob?.reward}</strong></div>
                            </div>
                            
                            <button onClick={() => setShowSuccess(false)} style={styles.applyBtn}>Back to Marketplace</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' },
    headerSection: { marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    pageTitle: { margin: 0, fontSize: '32px', fontWeight: '900', letterSpacing: '-1.5px', color: '#0f172a' },
    pageSubtitle: { color: '#64748b', margin: '8px 0 0 0', fontSize: '15px' },
    liveBadge: { display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', padding: '8px 16px', borderRadius: '50px', fontSize: '11px', fontWeight: '900' },
    pulse: { width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)' },
    statsRow: { display: 'flex', gap: '15px', marginBottom: '40px' },
    statItem: { flex: 1, background: '#fff', padding: '20px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #e2e8f0' },
    statIconBox: { width: '44px', height: '44px', background: '#ecfdf5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    statLabel: { fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.5px' },
    statValue: { fontSize: '22px', fontWeight: '900', color: '#0f172a' },
    statSub: { fontSize:'11px', fontWeight: '700', color:'#94a3b8' },
    jobGrid: { display: 'grid', gap: '25px' },
    jobCard: { background: '#fff', padding: '28px', borderRadius: '28px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', minHeight: '340px' },
    cardTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    rewardBox: { display: 'flex', alignItems: 'center', gap: '4px', background: '#0f172a', color: '#fff', padding: '6px 14px', borderRadius: '12px', fontSize: '18px', fontWeight: '900' },
    typeTag: { padding: '4px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' },
    jobTitle: { fontSize: '19px', fontWeight: '800', color: '#1e293b', margin: '0 0 12px 0', lineHeight: '1.3' },
    jobDesc: { fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' },
    skillReq: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '12px' },
    applyBtn: { width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '16px', borderRadius: '16px', cursor: 'pointer', fontWeight: '900', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    lockBtn: { width: '100%', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '16px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: '#fff', padding: '40px', borderRadius: '32px', maxWidth: '400px', width: '90%', textAlign: 'center', position: 'relative' },
    closeX: { position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1' },
    successIcon: { width: '64px', height: '64px', background: '#10b981', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
    modalTitle: { margin: '0 0 8px', fontSize: '24px', fontWeight: '900' },
    modalText: { color: '#64748b', fontSize: '14px', marginBottom: '25px' },
    summaryBox: { background: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '25px', border: '1px solid #e2e8f0', textAlign: 'left' },
    summaryItem: { display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', fontSize: '13px' }
};