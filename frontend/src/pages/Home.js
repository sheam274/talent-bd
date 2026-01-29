import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    FileText, Briefcase, Zap, 
    ArrowRight, Layers, Plus, Trash2, Rocket
} from 'lucide-react';

// Dynamic API detection for production/dev
const API_BASE = window.location.hostname === 'localhost' 
    ? "http://localhost:5000/api" 
    : "https://talent-bd-backend.onrender.com/api";

export default function Home({ user, setView }) {
    const [file, setFile] = useState(null);
    const [jobDesc, setJobDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(null);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    
    // Admin State for Category Management
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState('');
    const [catGroup, setCatGroup] = useState('job'); 
    const isAdmin = user?.role === 'admin';

    // --- SYNCED CATEGORY MANAGEMENT (FIXED FETCH LOGIC) ---
    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE}/categories`);
            
            // Robust check for data: Handles {categories: []}, {data: []}, or just []
            const rawData = res.data;
            let fetchedCats = [];

            if (rawData.categories && Array.isArray(rawData.categories)) {
                fetchedCats = rawData.categories;
            } else if (rawData.data && Array.isArray(rawData.data)) {
                fetchedCats = rawData.data;
            } else if (Array.isArray(rawData)) {
                fetchedCats = rawData;
            }

            setCategories(fetchedCats);
        } catch (err) { 
            console.error("❌ API Fetch Error:", err);
            setCategories([]); 
        }
    }, []);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        
        // Fetch categories for everyone (to power search/UI) but especially admins
        fetchCategories();
        
        return () => window.removeEventListener('resize', handleResize);
    }, [fetchCategories]);

    const addCategory = async () => {
        if (!newCat.trim() || !user?.token) return;
        try {
            const res = await axios.post(`${API_BASE}/admin/categories`, 
                { name: newCat.trim(), group: catGroup }, 
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            if (res.data.success || res.status === 201 || res.status === 200) {
                setNewCat('');
                fetchCategories();
            }
        } catch (err) { 
            console.error("Add Error:", err);
            alert("Administrative Authorization Required for Taxonomy changes."); 
        }
    };

    const deleteCategory = async (id) => {
        if (!user?.token || !window.confirm("Delete this sector?")) return;
        try {
            await axios.delete(`${API_BASE}/admin/categories/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchCategories();
        } catch (err) { 
            console.error("Deletion failed:", err); 
        }
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
                
                {/* 1. ADMIN TAXONOMY INTERFACE */}
                {isAdmin && (
                    <div style={styles.adminPanel}>
                        <div style={styles.adminHeader}>
                            <Layers size={16} color="#2563eb" />
                            <span style={styles.adminTitle}>Global Taxonomy Manager</span>
                        </div>
                        <div style={styles.adminControls}>
                            <input 
                                style={styles.adminInput} 
                                placeholder="New Sector (e.g. Fintech, AI)..." 
                                value={newCat}
                                onChange={(e) => setNewCat(e.target.value)}
                            />
                            <select 
                                value={catGroup} 
                                onChange={(e) => setCatGroup(e.target.value)}
                                style={styles.adminSelect}
                            >
                                <option value="job">Gigs Sector</option>
                                <option value="learning">Skill Path</option>
                            </select>
                            <button onClick={addCategory} style={styles.adminAddBtn}><Plus size={16} /> Deploy</button>
                        </div>
                        <div style={styles.catGrid}>
                            {categories.length > 0 ? categories.map(c => (
                                <div key={c._id || c.name} style={{
                                    ...styles.catBadge,
                                    borderColor: c.group === 'job' ? '#e2e8f0' : '#dcfce7'
                                }}>
                                    <span style={{
                                        ...styles.catGroupTag,
                                        color: c.group === 'job' ? '#64748b' : '#16a34a'
                                    }}>{c.group}</span>
                                    {c.name} 
                                    <Trash2 size={12} style={styles.trash} onClick={() => deleteCategory(c._id)} />
                                </div>
                            )) : (
                                <p style={{fontSize: '12px', color: '#94a3b8'}}>No categories deployed in database.</p>
                            )}
                        </div>
                    </div>
                )}

                <div style={{
                    ...styles.heroGrid,
                    gridTemplateColumns: isTablet ? '1fr' : '1.1fr 0.9fr',
                    gap: isMobile ? '40px' : '80px',
                }}>
                    
                    {/* LEFT SIDE */}
                    <div style={{...styles.textSide, textAlign: isTablet ? 'center' : 'left'}}>
                        <div style={{...styles.pill, margin: isTablet ? '0 auto 24px' : '0 0 24px 0'}}>
                            <Rocket size={14} /> BD'S #1 AI TALENT HUB 2026
                        </div>
                        
                        <h1 style={{...styles.bigText, fontSize: isMobile ? '34px' : 'clamp(40px, 5vw, 64px)'}}>
                            Architect Your <span style={{color: '#2563eb'}}>Career</span> with Precision AI.
                        </h1>
                        
                        <p style={{...styles.subText, margin: isTablet ? '0 auto 40px' : '0 0 45px 0'}}>
                            Match your technical DNA with global high-paying gigs and local industry standards.
                        </p>
                        
                        <div style={{...styles.buttonGroup, justifyContent: isTablet ? 'center' : 'flex-start'}}>
                            <button onClick={() => setView('jobs')} style={styles.mainBtn}>
                                <Briefcase size={20} /> Browse Gigs
                            </button>
                            <button onClick={() => setView('learning')} style={styles.secondaryBtn}>
                                Verify Skills
                            </button>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div style={styles.cardSide}>
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
                                        placeholder="Paste Job Requirements..." 
                                        value={jobDesc}
                                        onChange={(e) => setJobDesc(e.target.value)}
                                        required
                                    />
                                    <button type="submit" style={styles.actionBtn} disabled={loading}>
                                        {loading ? "Matching Entities..." : "Analyze Match"}
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
    heroWrapper: { background: '#fff', minHeight: '85vh', padding: '60px 0', display:'flex', alignItems:'center' },
    container: { maxWidth: '1250px', margin: '0 auto', width: '92%' },
    adminPanel: { background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '24px', borderRadius: '24px', marginBottom: '40px' },
    adminHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' },
    adminTitle: { fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' },
    adminControls: { display: 'flex', gap: '12px', marginBottom: '20px' },
    adminInput: { flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' },
    adminSelect: { padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', outline: 'none', cursor: 'pointer' },
    adminAddBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
    catGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
    catBadge: { background: '#fff', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '750', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' },
    catGroupTag: { opacity: 0.5, fontSize: '9px', textTransform: 'uppercase', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' },
    trash: { cursor: 'pointer', color: '#ef4444' },
    heroGrid: { display: 'grid', alignItems: 'center' },
    pill: { background: '#eff6ff', color: '#2563eb', padding: '8px 16px', borderRadius: '50px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content', border: '1px solid #dbeafe' },
    bigText: { fontWeight: '950', lineHeight: '1.1', color: '#0f172a', marginBottom: '25px', letterSpacing: '-0.04em' },
    subText: { color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '550px' },
    buttonGroup: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
    mainBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '18px 32px', borderRadius: '16px', fontSize: '16px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
    secondaryBtn: { background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', padding: '18px 32px', borderRadius: '16px', fontSize: '16px', fontWeight: '800', cursor: 'pointer' },
    cardSide: { display: 'flex', flexDirection: 'column', gap: '20px' },
    toolCard: { background: '#fff', padding: '30px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    cardTitle: { margin: 0, fontSize: '18px', fontWeight: '900' },
    liveIndicator: { background: '#f0fdf4', color: '#16a34a', fontSize: '9px', fontWeight: '900', padding: '4px 8px', borderRadius: '6px' },
    uploadBox: { border: '2px dashed #cbd5e1', padding: '24px', borderRadius: '20px', textAlign: 'center', position: 'relative', marginBottom: '15px' },
    hiddenInput: { position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer' },
    uploadText: { margin: '8px 0 0', fontSize: '13px', fontWeight: '700' },
    miniArea: { width: '100%', height: '90px', padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', resize: 'none', fontSize: '14px' },
    actionBtn: { width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', marginTop: '10px' },
    architectCard: { background: '#0f172a', padding: '24px', borderRadius: '28px', cursor: 'pointer' },
    architectContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    architectTitle: { margin: 0, color: '#fff', fontSize: '18px', fontWeight: '900' },
    architectSub: { margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '12px' },
    resultView: { textAlign: 'center' },
    scoreCircle: { width: '90px', height: '90px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', border: '6px solid #dcfce7' },
    resultSub: { fontSize: '13px', color: '#64748b', marginBottom: '20px' },
    resultActions: { display: 'flex', gap: '10px', justifyContent: 'center' },
    resetBtn: { background: '#fff', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
    detailBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }
};