import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Briefcase, Lock, CheckCircle, ArrowRight, 
    DollarSign, Zap, Globe, ShieldCheck, TrendingUp,
    Plus, Trash2, Layers, Activity
} from 'lucide-react';

export default function EarnPage({ user, setView }) {
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState('');

    // Admin Check (assuming role is passed via user object)
    const isAdmin = user?.role === 'admin' || user?.email === 'admin@talentbd.com';

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        fetchCategories();
        const timer = setTimeout(() => setLoading(false), 800);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, []);

    // --- CATEGORY SYNC LOGIC ---
    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            // Filter categories specifically for the "learning/gig" group
            setCategories(res.data.filter(c => c.group === 'learning' || c.group === 'job'));
        } catch (err) { console.error("Category fetch failed"); }
    };

    const addCategory = async () => {
        if (!newCat) return;
        try {
            await axios.post('http://localhost:5000/api/admin/categories', { name: newCat, group: 'learning' });
            setNewCat('');
            fetchCategories();
        } catch (err) { alert("Error adding category"); }
    };

    const deleteCategory = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/admin/categories/${id}`);
            fetchCategories();
        } catch (err) { alert("Error deleting"); }
    };

    const userSkills = user?.skills || [];

    // SYNC: Mock Gigs (In production, these would fetch from /api/gigs)
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
            {/* 1. ADMIN CATEGORY ARCHITECT (NEW FEATURE) */}
            {isAdmin && (
                <div style={styles.adminSection}>
                    <div style={styles.adminHeader}>
                        <Layers size={16} /> <span>Gig Category Architect</span>
                    </div>
                    <div style={{...styles.catControls, flexDirection: isMobile ? 'column' : 'row'}}>
                        <input 
                            style={styles.adminInput} 
                            placeholder="Add New Gig Category..." 
                            value={newCat}
                            onChange={(e) => setNewCat(e.target.value)}
                        />
                        <button onClick={addCategory} style={styles.addBtn}><Plus size={16} /> Add Group</button>
                    </div>
                    <div style={styles.catScroll}>
                        {categories.map(c => (
                            <div key={c._id} style={styles.catChip}>
                                {c.name}
                                <Trash2 size={12} style={styles.trash} onClick={() => deleteCategory(c._id)} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. HEADER & STATS */}
            <header style={{...styles.header, flexDirection: isMobile ? 'column' : 'row'}}>
                <div style={styles.headerText}>
                    <div style={styles.liveBadge}><Activity size={12} /> Live Marketplace</div>
                    <h2 style={styles.title}>Gig <span style={{color:'#2563eb'}}>Economy</span></h2>
                    <p style={styles.subtitle}>Execute micro-tasks to earn global currency directly into your wallet.</p>
                </div>
                
                <div style={{...styles.statCard, width: isMobile ? '100%' : 'auto'}}>
                    <div style={styles.statInfo}>
                        <ShieldCheck size={16} color="#2563eb" />
                        <span style={styles.statLabel}>Your Verified Skills:</span>
                    </div>
                    <div style={styles.userSkills}>
                        {userSkills.length > 0 ? (
                            userSkills.map(s => <span key={s} style={styles.skillBadge}>{s}</span>)
                        ) : (
                            <button onClick={() => setView('learning')} style={styles.emptySkillBtn}>Verify Skills</button>
                        )}
                    </div>
                </div>
            </header>

            {/* 3. MARKETPLACE GRID */}
            <div style={{
                ...styles.grid, 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))'
            }}>
                {GIGS.map(gig => {
                    const unlocked = userSkills.some(s => s.toLowerCase() === gig.requiredSkill.toLowerCase());
                    
                    return (
                        <div key={gig.id} style={{
                            ...styles.gigCard,
                            borderColor: unlocked ? '#e2e8f0' : '#f1f5f9',
                            background: unlocked ? '#fff' : '#f8fafc',
                            opacity: unlocked ? 1 : 0.9
                        }}>
                            <div style={styles.cardHeader}>
                                <span style={styles.categoryTag}>{gig.category}</span>
                                {gig.urgency === 'Urgent' && <span style={styles.urgentTag}>Urgent</span>}
                            </div>

                            <div style={styles.rewardBox}>
                                <DollarSign size={14} />
                                <span style={styles.rewardAmount}>{gig.reward}</span>
                            </div>

                            <div style={styles.cardBody}>
                                <h3 style={{...styles.gigTitle, color: unlocked ? '#0f172a' : '#94a3b8'}}>
                                    {gig.title}
                                </h3>
                                
                                <div style={styles.requirementRow}>
                                    <div style={{
                                        ...styles.reqBadge,
                                        color: unlocked ? '#16a34a' : '#dc2626',
                                        backgroundColor: unlocked ? '#f0fdf4' : '#fef2f2'
                                    }}>
                                        {unlocked ? <CheckCircle size={12} /> : <Lock size={12} />}
                                        Requires: {gig.requiredSkill}
                                    </div>
                                </div>

                                {unlocked ? (
                                    <button onClick={() => handleApply(gig)} style={styles.applyBtn}>
                                        Start Task <ArrowRight size={18} />
                                    </button>
                                ) : (
                                    <button onClick={() => setView('learning')} style={styles.lockBtn}>
                                        <Zap size={14} /> Unlock via Learning Hub
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
    container: { maxWidth: '1250px', margin: '40px auto', padding: '0 24px', minHeight: '85vh' },
    adminSection: { background: '#f1f5f9', padding: '20px', borderRadius: '20px', marginBottom: '40px', border: '1px dashed #cbd5e1' },
    adminHeader: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '900', color: '#1e293b', marginBottom: '15px', textTransform: 'uppercase' },
    catControls: { display: 'flex', gap: '10px', marginBottom: '15px' },
    adminInput: { flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' },
    addBtn: { background: '#0f172a', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
    catScroll: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    catChip: { background: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' },
    trash: { color: '#ef4444', cursor: 'pointer' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px', gap: '30px' },
    headerText: { flex: 1 },
    liveBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', marginBottom: '12px', border: '1px solid #dcfce7' },
    title: { fontSize: '36px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1.5px' },
    subtitle: { color: '#64748b', marginTop: '8px', fontSize: '16px', maxWidth: '500px' },
    statCard: { background: '#fff', padding: '20px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', minWidth: '280px' },
    statInfo: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
    statLabel: { fontSize: '11px', fontWeight: '900', color: '#475569', textTransform: 'uppercase' },
    userSkills: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    skillBadge: { background: '#f1f5f9', color: '#1e293b', padding: '5px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', border: '1px solid #e2e8f0' },
    emptySkillBtn: { background: 'none', border: '1px dashed #cbd5e1', color: '#64748b', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px' },
    grid: { display: 'grid', gap: '25px' },
    gigCard: { borderRadius: '24px', border: '1px solid #e2e8f0', position: 'relative', transition: '0.3s', display: 'flex', flexDirection: 'column' },
    cardHeader: { padding: '20px 25px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    categoryTag: { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },
    urgentTag: { background: '#fff1f2', color: '#e11d48', fontSize: '10px', fontWeight: '800', padding: '2px 10px', borderRadius: '20px' },
    rewardBox: { position: 'absolute', top: '20px', right: '25px', display: 'flex', alignItems: 'center', gap: '4px', background: '#0f172a', color: '#fff', padding: '6px 14px', borderRadius: '12px' },
    rewardAmount: { fontSize: '16px', fontWeight: '900' },
    cardBody: { padding: '30px 25px' },
    gigTitle: { fontSize: '18px', fontWeight: '800', margin: '0 0 15px' },
    requirementRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' },
    reqBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '800' },
    applyBtn: { width: '100%', padding: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
    lockBtn: { width: '100%', padding: '16px', background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '13px' }
};