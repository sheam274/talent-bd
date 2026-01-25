import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Sparkles, FileText, Briefcase, Zap, 
    CheckCircle, Users, ArrowRight, ShieldCheck, 
    BarChart3, Globe, Rocket, Layers, Plus, Trash2
} from 'lucide-react';

export default function Home({ user, setView }) {
    const [file, setFile] = useState(null);
    const [jobDesc, setJobDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(null);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    
    // Admin State for Category Management
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState('');
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        if (isAdmin) fetchCategories();
        return () => window.removeEventListener('resize', handleResize);
    }, [isAdmin]);

    // --- SYNCED CATEGORY MANAGEMENT ---
    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data);
        } catch (err) { console.warn("Offline: Using local category cache."); }
    };

    const addCategory = async () => {
        if (!newCat) return;
        try {
            await axios.post('http://localhost:5000/api/admin/categories', { name: newCat, group: 'job' });
            setNewCat('');
            fetchCategories();
        } catch (err) { alert("Sync Error: Backend unreachable."); }
    };

    const deleteCategory = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/admin/categories/${id}`);
            fetchCategories();
        } catch (err) { console.error(err); }
    };

    const isMobile = windowWidth < 768;
    const isTablet = windowWidth < 1100;

    const handleAnalyze = (e) => {
        e.preventDefault();
        if (!file || !jobDesc) return alert("Please upload a resume and paste requirements!");
        setLoading(true);
        setTimeout(() => {
            setScore(Math.floor(Math.random() * (95 - 72 + 1)) + 72);
            setLoading(false);
        }, 1500);
    };

    return (
        <div style={styles.heroWrapper}>
            <div style={styles.container}>
                
                {/* 1. ADMIN CATEGORY ARCHITECT (Visible only to Admin) */}
                {isAdmin && (
                    <div style={styles.adminPanel}>
                        <div style={styles.adminHeader}>
                            <Layers size={16} color="#2563eb" />
                            <span style={styles.adminTitle}>Global Category Manager (Job & Learning)</span>
                        </div>
                        <div style={styles.adminControls}>
                            <input 
                                style={styles.adminInput} 
                                placeholder="New Category Name..." 
                                value={newCat}
                                onChange={(e) => setNewCat(e.target.value)}
                            />
                            <button onClick={addCategory} style={styles.adminAddBtn}><Plus size={16} /> Add</button>
                        </div>
                        <div style={styles.catGrid}>
                            {categories.map(c => (
                                <div key={c._id} style={styles.catBadge}>
                                    {c.name} 
                                    <Trash2 size={12} style={styles.trash} onClick={() => deleteCategory(c._id)} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{
                    ...styles.heroGrid,
                    gridTemplateColumns: isTablet ? '1fr' : '1.1fr 0.9fr',
                    gap: isMobile ? '40px' : '80px',
                }}>
                    
                    {/* LEFT SIDE: Brand Positioning */}
                    <div style={{...styles.textSide, textAlign: isTablet ? 'center' : 'left'}}>
                        <div style={{...styles.pill, margin: isTablet ? '0 auto 24px' : '0 0 24px 0'}}>
                            <Rocket size={14} /> BD'S #1 AI TALENT HUB 2026
                        </div>
                        
                        <h1 style={{...styles.bigText, fontSize: isMobile ? '36px' : 'clamp(44px, 5.5vw, 68px)'}}>
                            Architect Your <span style={{color: '#2563eb'}}>Future</span> with AI.
                        </h1>
                        
                        <p style={{...styles.subText, margin: isTablet ? '0 auto 40px' : '0 0 45px 0'}}>
                            Precision career scaling. Match your technical DNA with global high-paying gigs and local industry standards.
                        </p>
                        
                        <div style={{...styles.buttonGroup, justifyContent: isTablet ? 'center' : 'flex-start'}}>
                            <button onClick={() => setView('jobs')} style={styles.mainBtn}>
                                <Briefcase size={20} /> Browse Gigs
                            </button>
                            <button onClick={() => setView('learning')} style={styles.secondaryBtn}>
                                Verify Skills
                            </button>
                        </div>

                        <div style={{...styles.userStats, justifyContent: isTablet ? 'center' : 'flex-start', marginTop: '30px'}}>
                            <div style={styles.avatars}>
                                {[1,2,3].map(i => (
                                    <div key={i} style={{...styles.avatarCircle, marginLeft: i === 1 ? 0 : '-10px', background: '#e2e8f0', borderColor:'#fff'}} />
                                ))}
                            </div>
                            <span style={styles.statText}><strong>12,400+</strong> Professionals Active</span>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Interactive Tools */}
                    <div style={styles.cardSide}>
                        
                        {/* ATS MATCH TOOL */}
                        <div style={styles.toolCard}>
                            <div style={styles.cardHeader}>
                                <h4 style={styles.cardTitle}><Zap size={18} color="#2563eb" fill="#2563eb" /> ATS Quick Match</h4>
                                <div style={styles.liveIndicator}>NEURAL SCAN</div>
                            </div>
                            
                            {!score ? (
                                <form onSubmit={handleAnalyze}>
                                    <div style={{...styles.uploadBox, borderColor: file ? '#2563eb' : '#cbd5e1'}}>
                                        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} style={styles.hiddenInput} />
                                        <FileText size={28} color={file ? '#2563eb' : '#94a3b8'} />
                                        <p style={{...styles.uploadText, color: file ? '#2563eb' : '#64748b'}}>
                                            {file ? file.name : "Select Resume PDF"}
                                        </p>
                                    </div>
                                    <textarea 
                                        style={styles.miniArea} 
                                        placeholder="Paste Job Description..." 
                                        value={jobDesc}
                                        onChange={(e) => setJobDesc(e.target.value)}
                                        required
                                    />
                                    <button type="submit" style={styles.actionBtn} disabled={loading}>
                                        {loading ? "Scanning Entities..." : "Analyze Match"}
                                    </button>
                                </form>
                            ) : (
                                <div style={styles.resultView}>
                                    <div style={styles.scoreCircle}>
                                        <h2 style={{margin:0}}>{score}%</h2>
                                    </div>
                                    <p style={styles.resultSub}>Matching core entities found in database.</p>
                                    <div style={styles.resultActions}>
                                        <button onClick={() => setScore(null)} style={styles.resetBtn}>Reset</button>
                                        <button onClick={() => setView('analyzer')} style={styles.detailBtn}>Full Report</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CV BUILDER PROMPT */}
                        <div style={styles.architectCard} onClick={() => setView('cv-builder')}>
                            <div style={styles.architectContent}>
                                <div>
                                    <h4 style={styles.architectTitle}>CV Architect</h4>
                                    <p style={styles.architectSub}>Generate ATS-ready PDFs for 2026 standards.</p>
                                </div>
                                <ArrowRight color="#fff" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

const styles = {
    heroWrapper: { background: '#fff', minHeight: '90vh', padding: '60px 0', display:'flex', alignItems:'center' },
    container: { maxWidth: '1250px', margin: '0 auto', width: '92%' },
    adminPanel: { background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '20px', borderRadius: '24px', marginBottom: '40px' },
    adminHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' },
    adminTitle: { fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#475569' },
    adminControls: { display: 'flex', gap: '10px', marginBottom: '15px' },
    adminInput: { flex: 1, padding: '10px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' },
    adminAddBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
    catGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    catBadge: { background: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' },
    trash: { cursor: 'pointer', color: '#ef4444' },
    heroGrid: { display: 'grid', alignItems: 'center' },
    pill: { background: '#eff6ff', color: '#2563eb', padding: '8px 16px', borderRadius: '50px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content', border: '1px solid #dbeafe' },
    bigText: { fontWeight: '900', lineHeight: '1.1', color: '#0f172a', marginBottom: '25px', letterSpacing: '-1.5px' },
    subText: { color: '#64748b', fontSize: '18px', lineHeight: '1.6', maxWidth: '550px' },
    buttonGroup: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
    mainBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '18px 32px', borderRadius: '16px', fontSize: '16px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)' },
    secondaryBtn: { background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', padding: '18px 32px', borderRadius: '16px', fontSize: '16px', fontWeight: '800', cursor: 'pointer' },
    userStats: { display: 'flex', alignItems: 'center', gap: '12px' },
    avatarCircle: { width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #fff' },
    statText: { fontSize: '13px', color: '#94a3b8' },
    cardSide: { display: 'flex', flexDirection: 'column', gap: '20px' },
    toolCard: { background: '#fff', padding: '30px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    cardTitle: { margin: 0, fontSize: '18px', fontWeight: '900' },
    liveIndicator: { background: '#f0fdf4', color: '#16a34a', fontSize: '9px', fontWeight: '900', padding: '4px 8px', borderRadius: '6px' },
    uploadBox: { border: '2px dashed #cbd5e1', padding: '20px', borderRadius: '20px', textAlign: 'center', position: 'relative', marginBottom: '15px' },
    hiddenInput: { position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer' },
    uploadText: { margin: '8px 0 0', fontSize: '12px', fontWeight: '700' },
    miniArea: { width: '100%', height: '80px', padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', resize: 'none', fontSize: '13px' },
    actionBtn: { width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '16px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' },
    architectCard: { background: '#0f172a', padding: '24px', borderRadius: '28px', cursor: 'pointer' },
    architectContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    architectTitle: { margin: 0, color: '#fff', fontSize: '18px', fontWeight: '900' },
    architectSub: { margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '12px' },
    resultView: { textAlign: 'center' },
    scoreCircle: { width: '80px', height: '80px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', border: '4px solid #dcfce7' },
    resultSub: { fontSize: '12px', color: '#64748b', marginBottom: '20px' },
    resultActions: { display: 'flex', gap: '10px', justifyContent: 'center' },
    resetBtn: { background: '#fff', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px' },
    detailBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }
};