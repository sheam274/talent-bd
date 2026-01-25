import React, { useState, useEffect } from 'react';
import { 
    Briefcase, PlayCircle, Send, DollarSign, Star, Zap, 
    Globe, Clock, ShieldCheck, Layers, Plus, Trash2 
} from 'lucide-react';
import axios from 'axios'; // SYNC: Standard for MERN stack

export default function AdminPanel({ user }) {
    const [tab, setTab] = useState('jobs');
    const [loading, setLoading] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    
    // --- CATEGORY STATE ---
    const [categories, setCategories] = useState([]);
    const [newCatName, setNewCatName] = useState('');
    const [newCatGroup, setNewCatGroup] = useState('job');

    const [form, setForm] = useState({ 
        title: '', 
        company: '', 
        location: 'Remote', 
        category: '', 
        videoUrl: '', 
        skillTag: '', 
        description: '',
        rewardXP: 100,
        rewardWallet: 50,
        deadline: ''
    });

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        fetchCategories(); // Initial Sync
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    // --- DYNAMIC CATEGORY LOGIC ---
    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data);
            if(res.data.length > 0) setForm(prev => ({...prev, category: res.data[0].name}));
        } catch (err) { console.error("Category fetch failed"); }
    };

    const addCategory = async () => {
        if (!newCatName) return;
        try {
            await axios.post('http://localhost:5000/api/admin/categories', { 
                name: newCatName, 
                group: newCatGroup 
            });
            setNewCatName('');
            fetchCategories();
        } catch (err) { alert("Sync Error: Category might exist"); }
    };

    const deleteCategory = async (id) => {
        if (!window.confirm("Remove category platform-wide?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/categories/${id}`);
            fetchCategories();
        } catch (err) { alert("Delete failed"); }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        setLoading(true);
        const endpoint = tab === 'jobs' 
            ? 'http://localhost:5000/api/jobs/add' 
            : 'http://localhost:5000/api/courses/upload';
        
        try {
            const res = await axios.post(endpoint, { ...form, role: user?.role || 'admin' });
            if (res.status === 201 || res.status === 200) {
                alert(`🚀 ${tab.toUpperCase()} LIVE!`);
                setForm({ title: '', company: '', location: 'Remote', category: categories[0]?.name || '', videoUrl: '', skillTag: '', description: '', rewardXP: 100, rewardWallet: 50, deadline: '' });
            }
        } catch (error) {
            alert("Connection error. Check Port 5000.");
        } finally { setLoading(false); }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={{...styles.panelCard, width: isMobile ? '95%' : '100%'}}>
                
                {/* --- 1. ADMIN CATEGORY MANAGEMENT (NEW FEATURE) --- */}
                <section style={styles.categorySection}>
                    <div style={styles.sectionHeader}><Layers size={16} /> <span>Platform Category Architect</span></div>
                    <div style={{...styles.catControls, flexDirection: isMobile ? 'column' : 'row'}}>
                        <input style={styles.input} placeholder="New Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                        <select style={styles.input} value={newCatGroup} onChange={e => setNewCatGroup(e.target.value)}>
                            <option value="job">Jobs Group</option>
                            <option value="learning">Learning Group</option>
                        </select>
                        <button onClick={addCategory} style={styles.addBtn}><Plus size={16} /> Add</button>
                    </div>
                    <div style={styles.catScrollList}>
                        {categories.map(c => (
                            <div key={c._id} style={styles.catChip}>
                                <span>{c.name} <small>({c.group})</small></span>
                                <Trash2 size={12} onClick={() => deleteCategory(c._id)} style={styles.trash} />
                            </div>
                        ))}
                    </div>
                </section>

                <div style={styles.divider} />

                {/* --- 2. CONTENT DEPLOYMENT FORM --- */}
                <header style={styles.header}>
                    <div style={styles.badge}><ShieldCheck size={12} /> Admin Mode</div>
                    <h2 style={styles.title}>Content Command</h2>
                    <div style={styles.tabGroup}>
                        <button onClick={() => setTab('jobs')} style={{...styles.tabBtn, background: tab === 'jobs' ? '#2563eb' : 'transparent', color: tab === 'jobs' ? '#fff' : '#64748b'}}><Briefcase size={16} /> Jobs</button>
                        <button onClick={() => setTab('courses')} style={{...styles.tabBtn, background: tab === 'courses' ? '#2563eb' : 'transparent', color: tab === 'courses' ? '#fff' : '#64748b'}}><PlayCircle size={16} /> Courses</button>
                    </div>
                </header>

                <form onSubmit={handlePost} style={{...styles.formGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)'}}>
                    <div style={styles.fullWidth}>
                        <label style={styles.label}>Title</label>
                        <input style={styles.input} value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                    </div>

                    <div style={isMobile ? styles.fullWidth : styles.halfWidth}>
                        <label style={styles.label}>Category (Synced)</label>
                        <select style={styles.input} value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                            {categories.filter(c => c.group === (tab === 'jobs' ? 'job' : 'learning')).map(c => (
                                <option key={c._id} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {tab === 'jobs' ? (
                        <>
                            <div style={isMobile ? styles.fullWidth : styles.halfWidth}>
                                <label style={styles.label}>Company</label>
                                <input style={styles.input} value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={isMobile ? styles.fullWidth : styles.halfWidth}>
                                <label style={styles.label}>YouTube URL</label>
                                <input style={styles.input} value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} />
                            </div>
                        </>
                    )}

                    <div style={styles.fullWidth}>
                        <label style={styles.label}>Description</label>
                        <textarea style={styles.textarea} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                    </div>

                    <button type="submit" style={styles.submitBtn} disabled={loading}>
                        {loading ? "SYNCING..." : <><Send size={18} /> DEPLOY TO TALENT-BD</>}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    pageWrapper: { padding: '40px 20px', background: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center' },
    panelCard: { background: '#fff', padding: '30px', borderRadius: '24px', maxWidth: '850px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
    categorySection: { background: '#f1f5f9', padding: '20px', borderRadius: '16px', marginBottom: '20px' },
    catControls: { display: 'flex', gap: '10px', marginBottom: '15px' },
    catScrollList: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    catChip: { background: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' },
    trash: { color: '#ef4444', cursor: 'pointer' },
    addBtn: { background: '#0f172a', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' },
    divider: { height: '1px', background: '#e2e8f0', margin: '30px 0' },
    header: { marginBottom: '25px', textAlign: 'center' },
    badge: { display: 'inline-flex', background: '#fef2f2', color: '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '900', marginBottom: '10px' },
    title: { fontSize: '24px', fontWeight: '900', marginBottom: '20px' },
    tabGroup: { display: 'flex', gap: '5px', background: '#f1f5f9', padding: '5px', borderRadius: '12px', width: 'fit-content', margin: '0 auto' },
    tabBtn: { border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' },
    formGrid: { display: 'grid', gap: '15px' },
    fullWidth: { gridColumn: 'span 2' },
    label: { fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '5px', display: 'block' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' },
    textarea: { width: '100%', height: '100px', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', resize: 'none' },
    submitBtn: { gridColumn: 'span 2', background: '#2563eb', color: '#fff', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: '900', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' },
    sectionHeader: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '12px', textTransform: 'uppercase' }
};