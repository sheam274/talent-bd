import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
    Briefcase, Lock, CheckCircle, Zap, 
    TrendingUp, X, Sparkles, DollarSign, 
    Layers, MousePointer2, Plus, Trash2, Activity
} from 'lucide-react';

export default function Jobs({ user, setView, jobs = [] }) {
    const [showSuccess, setShowSuccess] = useState(false);
    const [appliedJob, setAppliedJob] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    // Admin & Category Sync State
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState('');
    const isAdmin = user?.role === 'admin' || user?.email === 'admin@talentbd.com';

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
            // Filter categories related to the job market
            setCategories(res.data.filter(c => c.group === 'job' || c.group === 'learning'));
        } catch (err) { console.warn("Running in offline mode."); }
    };

    const addCategory = async () => {
        if (!newCat) return;
        try {
            await axios.post('http://localhost:5000/api/admin/categories', { name: newCat, group: 'job' });
            setNewCat('');
            fetchCategories();
        } catch (err) { alert("Sync failed."); }
    };

    const deleteCategory = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/admin/categories/${id}`);
            fetchCategories();
        } catch (err) { console.error(err); }
    };

    // SYNC: Standardized skill matching
    const userSkills = user?.skills?.map(s => s.toLowerCase().trim()) || [];
    const checkSkill = (requiredSkill) => userSkills.includes(requiredSkill?.toLowerCase().trim());

    const displayJobs = jobs.length > 0 ? jobs : [
        { id: 101, title: 'React UI Optimization', reward: 45, skill: 'React', type: 'Frontend' },
        { id: 102, title: 'Python Data Cleanup', reward: 30, skill: 'Python', type: 'Data' },
        { id: 103, title: 'Figma Brand Kit', reward: 25, skill: 'Figma', type: 'Design' },
        { id: 104, title: 'Node.js Security Patch', reward: 55, skill: 'Node.js', type: 'Backend' }
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
            {/* 1. ADMIN CATEGORY ARCHITECT */}
            {isAdmin && (
                <div style={styles.adminSection}>
                    <div style={styles.adminHeader}>
                        <Layers size={16} color="#2563eb" /> 
                        <span style={styles.adminTitle}>Marketplace Category Architect</span>
                    </div>
                    <div style={{...styles.adminControls, flexDirection: isMobile ? 'column' : 'row'}}>
                        <input 
                            style={styles.adminInput} 
                            placeholder="Create Global Job Category..." 
                            value={newCat}
                            onChange={(e) => setNewCat(e.target.value)}
                        />
                        <button onClick={addCategory} style={styles.adminAddBtn}><Plus size={16}/> Add Category</button>
                    </div>
                    <div style={styles.catWrap}>
                        {categories.map(c => (
                            <div key={c._id} style={styles.catChip}>
                                {c.name}
                                <Trash2 size={12} style={styles.trash} onClick={() => deleteCategory(c._id)} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. ANALYTICS DASHBOARD */}
            <div style={{...styles.statsRow, flexDirection: isMobile ? 'column' : 'row'}}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={styles.statItem}>
                    <div style={styles.statIconBox}><TrendingUp size={20} color="#10b981" /></div>
                    <div>
                        <span style={styles.statLabel}>Available to Earn</span>
                        <div style={styles.statValue}>${unlockedEarnings} <small style={styles.statSub}>unlocked</small></div>
                    </div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={styles.statItem}>
                    <div style={{...styles.statIconBox, background: '#eff6ff'}}><Activity size={20} color="#2563eb" /></div>
                    <div>
                        <span style={styles.statLabel}>Gig Feed Status</span>
                        <div style={styles.statValue}>{displayJobs.length} <small style={styles.statSub}>Verified</small></div>
                    </div>
                </motion.div>
            </div>

            {/* 3. HEADER */}
            <header style={{...styles.headerSection, flexDirection: isMobile ? 'column' : 'row', gap: '20px'}}>
                <div>
                    <h2 style={styles.pageTitle}>TalentBD <span style={{color:'#2563eb'}}>Gigs</span></h2>
                    <p style={styles.pageSubtitle}>Precision-matched micro-tasks based on your verified skillset.</p>
                </div>
                <div style={styles.liveBadge}><span style={styles.pulse}></span> NETWORK ACTIVE</div>
            </header>

            {/* 4. GIG GRID */}
            <div style={{
                ...styles.jobGrid, 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))'
            }}>
                {displayJobs.map((job) => {
                    const isLocked = !checkSkill(job.skill);

                    return (
                        <motion.div 
                            key={job.id} 
                            whileHover={{ y: -8 }} 
                            style={{
                                ...styles.jobCard,
                                borderBottom: isLocked ? '1px solid #e2e8f0' : '4px solid #10b981',
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
                                }}>{job.type}</span>
                            </div>

                            <h3 style={{...styles.jobTitle, color: isLocked ? '#94a3b8' : '#0f172a'}}>{job.title}</h3>
                            <p style={styles.jobDesc}>Secure this contract by proving your {job.skill} expertise via the Learning Hub.</p>
                            
                            <div style={{
                                ...styles.skillReq,
                                background: isLocked ? '#fef2f2' : '#f0fdf4'
                            }}>
                                {isLocked ? <Lock size={14} color="#ef4444" /> : <CheckCircle size={14} color="#10b981" />}
                                <span style={{ 
                                    fontSize: '11px', 
                                    fontWeight: '900', 
                                    color: isLocked ? '#ef4444' : '#10b981' 
                                }}>
                                    {job.skill} {isLocked ? 'RESTRICTED' : 'UNLOCKED'}
                                </span>
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                                {isLocked ? (
                                    <button onClick={() => setView('learning')} style={styles.lockBtn}>
                                        <Zap size={14} /> Get {job.skill} Badge
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

            {/* 5. SUCCESS MODAL */}
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
                            <div style={styles.successIcon}><Sparkles size={30} color="#fff" /></div>
                            <h2 style={styles.modalTitle}>Contract Pending!</h2>
                            <p style={styles.modalText}>Your {appliedJob?.skill} proficiency was cross-verified. The $USD {appliedJob?.reward} reward is reserved.</p>
                            
                            <div style={styles.summaryBox}>
                                <div style={styles.summaryItem}><span>Category</span> <strong>{appliedJob?.type}</strong></div>
                                <div style={{...styles.summaryItem, border:'none'}}><span>Payout</span> <strong style={{color:'#10b981'}}>${appliedJob?.reward}</strong></div>
                            </div>
                            
                            <button onClick={() => setShowSuccess(false)} style={styles.applyBtn}>Return to Market</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

const styles = {
    container: { maxWidth: '1250px', margin: '0 auto', padding: '40px 24px' },
    adminSection: { background: '#f8fafc', padding: '24px', borderRadius: '28px', marginBottom: '40px', border: '1px dashed #cbd5e1' },
    adminHeader: { display:'flex', alignItems:'center', gap:'8px', marginBottom:'15px' },
    adminTitle: { fontSize:'12px', fontWeight:'900', textTransform:'uppercase', color:'#475569' },
    adminControls: { display:'flex', gap:'10px', marginBottom:'15px' },
    adminInput: { flex:1, padding:'14px', borderRadius:'12px', border:'1px solid #e2e8f0', outline:'none', fontSize:'14px' },
    adminAddBtn: { background:'#0f172a', color:'#fff', border:'none', padding:'0 20px', borderRadius:'12px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px' },
    catWrap: { display:'flex', flexWrap:'wrap', gap:'8px' },
    catChip: { background:'#fff', padding:'6px 14px', borderRadius:'10px', fontSize:'12px', fontWeight:'700', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'8px' },
    trash: { color:'#ef4444', cursor:'pointer' },
    headerSection: { marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    pageTitle: { margin: 0, fontSize: '36px', fontWeight: '900', letterSpacing: '-1.5px' },
    pageSubtitle: { color: '#64748b', margin: '8px 0 0 0', fontSize: '16px' },
    liveBadge: { display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', padding: '8px 18px', borderRadius: '50px', fontSize: '11px', fontWeight: '900' },
    pulse: { width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', animation:'pulse 1.5s infinite' },
    statsRow: { display: 'flex', gap: '15px', marginBottom: '40px' },
    statItem: { flex: 1, background: '#fff', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #e2e8f0' },
    statIconBox: { width: '48px', height: '48px', background: '#ecfdf5', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    statLabel: { fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '900' },
    statValue: { fontSize: '24px', fontWeight: '900', color: '#0f172a' },
    statSub: { fontSize:'12px', fontWeight:'700', color:'#94a3b8' },
    jobGrid: { display: 'grid', gap: '25px' },
    jobCard: { background: '#fff', padding: '30px', borderRadius: '32px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', minHeight: '360px' },
    cardTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    rewardBox: { display: 'flex', alignItems: 'center', gap: '4px', background: '#0f172a', color: '#fff', padding: '8px 16px', borderRadius: '14px', fontSize: '20px', fontWeight: '900' },
    typeTag: { padding: '4px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' },
    jobTitle: { fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', lineHeight: '1.4' },
    jobDesc: { fontSize: '14px', color: '#64748b', lineHeight: '1.7', marginBottom: '25px' },
    skillReq: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '14px' },
    applyBtn: { width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '18px', borderRadius: '18px', cursor: 'pointer', fontWeight: '900', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
    lockBtn: { width: '100%', background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0', padding: '18px', borderRadius: '18px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: '#fff', padding: '40px', borderRadius: '36px', maxWidth: '420px', width: '90%', textAlign: 'center', position: 'relative' },
    closeX: { position: 'absolute', top: '25px', right: '25px', background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1' },
    successIcon: { width: '70px', height: '70px', background: '#10b981', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', boxShadow:'0 15px 30px rgba(16, 185, 129, 0.3)' },
    modalTitle: { margin: '0 0 10px', fontSize: '26px', fontWeight: '900' },
    modalText: { color: '#64748b', fontSize: '15px', marginBottom: '30px', lineHeight:'1.5' },
    summaryBox: { background: '#f8fafc', padding: '24px', borderRadius: '20px', marginBottom: '30px', border: '1px solid #e2e8f0', textAlign: 'left' },
    summaryItem: { display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' }
};