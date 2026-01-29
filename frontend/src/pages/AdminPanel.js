import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    Briefcase, PlayCircle, Send, ShieldCheck, Layers, Plus, Trash2, Globe 
} from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function AdminPanel({ user }) {
    const [tab, setTab] = useState('jobs');
    const [loading, setLoading] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    
    // --- CATEGORY STATE ---
    const [categories, setCategories] = useState([]);
    const [newCatName, setNewCatName] = useState('');
    const [newCatGroup, setNewCatGroup] = useState('job');
    const hasFetched = useRef(false); // 🔥 Gatekeeper to stop 304 spam

    const [form, setForm] = useState({ 
        title: '', 
        company: '', 
        location: 'Worldwide', 
        category: '', 
        videoUrl: '', 
        description: '',
        deadline: '',
        difficulty: 'Beginner',
        isRemote: true
    });

    // --- API LOGIC ---
    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE}/categories`);
            const data = res.data.categories || [];
            setCategories(data);
            hasFetched.current = true;
        } catch (err) { 
            console.error("❌ Sync Error: Backend unreachable on 5000"); 
        }
    }, []);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        
        // Only fetch once on mount
        if (!hasFetched.current) {
            fetchCategories();
        }

        return () => window.removeEventListener('resize', handleResize);
    }, [fetchCategories]);

    // Dynamic Category Selector: Updates when switching between Job and Course tabs
    useEffect(() => {
        const targetGroup = tab === 'jobs' ? 'job' : 'learning';
        const relevantCats = categories.filter(c => c.group === targetGroup);
        if (relevantCats.length > 0) {
            setForm(prev => ({ ...prev, category: relevantCats[0].name }));
        }
    }, [tab, categories]);

    const addCategory = async () => {
        if (!newCatName.trim()) return;
        try {
            await axios.post(`${API_BASE}/categories`, { 
                name: newCatName.trim(), 
                group: newCatGroup 
            });
            setNewCatName('');
            hasFetched.current = false; // Reset to allow fresh fetch
            fetchCategories();
        } catch (err) { 
            alert("Category Sync Error: Likely already exists."); 
        }
    };

    const deleteCategory = async (id) => {
        if (!window.confirm("Archive category platform-wide?")) return;
        try {
            await axios.patch(`${API_BASE}/admin/archive/category/${id}`);
            fetchCategories();
        } catch (err) { alert("Archive operation failed."); }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!form.category) return alert("Please add a category first!");

        setLoading(true);
        // Use the admin routes for secure posting
        const endpoint = tab === 'jobs' ? `${API_BASE}/admin/jobs` : `${API_BASE}/admin/courses`;
        
        const payload = {
            ...form,
            isActive: true,
            // Logic: Auto-tag as remote if location is Worldwide
            isRemote: form.location.toLowerCase().includes('remote') || form.location === 'Worldwide'
        };

        try {
            await axios.post(endpoint, payload);
            alert(`🚀 DEPLOYMENT SUCCESSFUL: ${form.title} is now LIVE.`);
            setForm({ 
                title: '', company: '', location: 'Worldwide', 
                category: categories.find(c => c.group === (tab === 'jobs' ? 'job' : 'learning'))?.name || '', 
                videoUrl: '', description: '', deadline: '', difficulty: 'Beginner', isRemote: true
            });
        } catch (error) {
            alert(`Deployment Error: ${error.response?.data?.error || error.message}`);
        } finally { setLoading(false); }
    };

    const isMobile = windowWidth < 768;

    return (
        <div style={styles.pageWrapper}>
            <div style={{...styles.panelCard, width: isMobile ? '95%' : '100%'}}>
                
                {/* 1. CATEGORY ARCHITECT */}
                
                <section style={styles.categorySection}>
                    <div style={styles.sectionHeader}><Layers size={16} /> <span>Global Category Architect</span></div>
                    <div style={{...styles.catControls, flexDirection: isMobile ? 'column' : 'row'}}>
                        <input style={styles.input} placeholder="e.g. Software Engineer" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                        <select style={styles.input} value={newCatGroup} onChange={e => setNewCatGroup(e.target.value)}>
                            <option value="job">Gig Board</option>
                            <option value="learning">Learning Hub</option>
                        </select>
                        <button onClick={addCategory} style={styles.addBtn}><Plus size={16} /> Add</button>
                    </div>
                    <div style={styles.catScrollList}>
                        {categories.map(c => (
                            <div key={c._id} style={{...styles.catChip, borderColor: c.group === 'job' ? '#2563eb' : '#10b981'}}>
                                <span>{c.name}</span>
                                <Trash2 size={12} onClick={() => deleteCategory(c._id)} style={styles.trash} />
                            </div>
                        ))}
                    </div>
                </section>

                <div style={styles.divider} />

                {/* 2. DEPLOYMENT COMMAND */}
                <header style={styles.header}>
                    <div style={styles.badge}><ShieldCheck size={12} /> Root Deployment Access</div>
                    <h2 style={styles.title}>Production Command</h2>
                    <div style={styles.tabGroup}>
                        <button type="button" onClick={() => setTab('jobs')} style={{...styles.tabBtn, background: tab === 'jobs' ? '#2563eb' : 'transparent', color: tab === 'jobs' ? '#fff' : '#64748b'}}><Briefcase size={16} /> Gigs</button>
                        <button type="button" onClick={() => setTab('courses')} style={{...styles.tabBtn, background: tab === 'courses' ? '#10b981' : 'transparent', color: tab === 'courses' ? '#fff' : '#64748b'}}><PlayCircle size={16} /> Hub</button>
                    </div>
                </header>

                <form onSubmit={handlePost} style={{...styles.formGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)'}}>
                    <div style={styles.fullWidth}>
                        <label style={styles.label}>Professional Title</label>
                        <input style={styles.input} value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Senior MERN Architect" />
                    </div>

                    <div style={isMobile ? styles.fullWidth : styles.halfWidth}>
                        <label style={styles.label}>Platform Category</label>
                        <select style={styles.input} value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                            {categories.filter(c => c.group === (tab === 'jobs' ? 'job' : 'learning')).map(c => (
                                <option key={c._id} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {tab === 'jobs' ? (
                        <>
                            <div style={isMobile ? styles.fullWidth : styles.halfWidth}>
                                <label style={styles.label}>Company / Agency</label>
                                <input style={styles.input} value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Company Name" required />
                            </div>
                            <div style={isMobile ? styles.fullWidth : styles.halfWidth}>
                                <label style={styles.label}>Location (Worldwide/Remote)</label>
                                <div style={{position: 'relative'}}>
                                    <input style={{...styles.input, paddingLeft: '35px'}} value={form.location} onChange={e => setForm({...form, location: e.target.value})} required />
                                    <Globe size={14} style={{position: 'absolute', left: '12px', top: '15px', color: '#94a3b8'}} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={isMobile ? styles.fullWidth : styles.halfWidth}>
                                <label style={styles.label}>YouTube Source URL</label>
                                <input style={styles.input} value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} placeholder="https://..." required />
                            </div>
                            <div style={isMobile ? styles.fullWidth : styles.halfWidth}>
                                <label style={styles.label}>Difficulty Tier</label>
                                <select style={styles.input} value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Expert">Expert</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div style={styles.fullWidth}>
                        <label style={styles.label}>Description & Requirements</label>
                        <textarea style={styles.textarea} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required placeholder="Describe the opportunity or course content..." />
                    </div>

                    {tab === 'jobs' && (
                         <div style={styles.fullWidth}>
                            <label style={styles.label}>Application Deadline</label>
                            <input type="date" style={styles.input} value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} required />
                         </div>
                    )}

                    <button type="submit" style={{...styles.submitBtn, background: tab === 'jobs' ? '#2563eb' : '#10b981'}} disabled={loading}>
                        {loading ? "COMMITTING TO PRODUCTION..." : <><Send size={18} /> DEPLOY TO TALENTBD</>}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    pageWrapper: { padding: '40px 20px', background: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center' },
    panelCard: { background: '#fff', padding: '30px', borderRadius: '24px', maxWidth: '850px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
    categorySection: { background: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px dashed #cbd5e1' },
    catControls: { display: 'flex', gap: '10px', marginBottom: '15px' },
    catScrollList: { display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto' },
    catChip: { background: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', border: '2px solid', display: 'flex', alignItems: 'center', gap: '8px' },
    trash: { color: '#ef4444', cursor: 'pointer', opacity: 0.7 },
    addBtn: { background: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
    divider: { height: '1px', background: '#e2e8f0', margin: '30px 0' },
    header: { marginBottom: '25px', textAlign: 'center' },
    badge: { display: 'inline-flex', background: '#f0fdf4', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '900', marginBottom: '10px', border: '1px solid #bbf7d0' },
    title: { fontSize: '22px', fontWeight: '900', color: '#0f172a', marginBottom: '20px' },
    tabGroup: { display: 'flex', gap: '5px', background: '#f1f5f9', padding: '5px', borderRadius: '12px', width: 'fit-content', margin: '0 auto' },
    tabBtn: { border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s ease' },
    formGrid: { display: 'grid', gap: '15px' },
    fullWidth: { gridColumn: 'span 2' },
    halfWidth: { gridColumn: 'span 1' },
    label: { fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' },
    textarea: { width: '100%', height: '120px', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', resize: 'none' },
    submitBtn: { gridColumn: 'span 2', color: '#fff', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: '900', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' },
    sectionHeader: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '12px', textTransform: 'uppercase' }
};