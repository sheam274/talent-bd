import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, Video, BrainCircuit, Layout, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

// Environment-aware API base
const API_BASE = window.location.hostname === 'localhost' 
    ? "http://localhost:5000/api" 
    : "https://talent-bd-backend.onrender.com/api";

export default function AdminDashboard() {
    // --- 1. STATE MANAGEMENT ---
    const [videoData, setVideoData] = useState({
        title: '',
        category: '',
        difficulty: 'Beginner',
        rewardXP: 100,      
        rewardWallet: 50,
        videoUrl: '',
        description: ''
    });

    const [quiz, setQuiz] = useState([{ question: '', options: ['', '', ''], correctAnswer: 0 }]);
    const [platformCategories, setPlatformCategories] = useState([]);
    const [newCat, setNewCat] = useState({ name: '', group: 'learning' });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [loading, setLoading] = useState(false);
    
    // --- 2. FETCH LOGIC ---
    const hasFetched = useRef(false);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE}/categories`);
            // FIX: Ensure we extract the array from the { categories: [] } object
            const cats = Array.isArray(res.data.categories) ? res.data.categories : [];
            setPlatformCategories(cats);
            
            // Set default category for the form if none selected
            if (!videoData.category && cats.length > 0) {
                const firstLearning = cats.find(c => c.group === 'learning');
                if (firstLearning) setVideoData(prev => ({ ...prev, category: firstLearning.name }));
            }
            hasFetched.current = true;
        } catch (err) {
            console.error("❌ Category Sync Error:", err);
            setPlatformCategories([]); // Safe fallback
        }
    }, [videoData.category]);

    useEffect(() => {
        if (!hasFetched.current) fetchCategories();
        
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [fetchCategories]);

    // --- 3. CATEGORY ACTIONS ---
    const handleAddCategory = async () => {
        if (!newCat.name) return;
        try {
            await axios.post(`${API_BASE}/admin/categories`, newCat);
            setNewCat({ ...newCat, name: '' });
            fetchCategories(); // Refresh list
        } catch (err) { 
            alert("Deployment failed: Check if backend is running."); 
        }
    };

    const handleArchiveCategory = async (id) => {
        if (!window.confirm("Archive this category?")) return;
        try {
            await axios.delete(`${API_BASE}/admin/categories/${id}`); // Standard delete endpoint
            fetchCategories();
        } catch (err) { 
            alert("Archive failed: " + (err.response?.data?.message || "Unknown error")); 
        }
    };

    // --- 4. COURSE DEPLOYMENT ---
    const handleDeployCourse = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...videoData, quiz, isActive: true };
            await axios.post(`${API_BASE}/admin/courses`, payload);
            alert("🚀 COURSE DEPLOYED TO LEARNING HUB");
            setVideoData({ title: '', category: '', difficulty: 'Beginner', rewardXP: 100, rewardWallet: 50, videoUrl: '', description: '' });
            setQuiz([{ question: '', options: ['', '', ''], correctAnswer: 0 }]);
        } catch (error) { 
            alert("Deployment Error: " + (error.response?.data?.message || "Check Backend Connection")); 
        } finally {
            setLoading(false);
        }
    };

    // --- 5. QUIZ HELPERS ---
    const updateQuiz = (index, field, value) => {
        const updated = [...quiz];
        updated[index][field] = value;
        setQuiz(updated);
    };

    const updateOption = (qIdx, oIdx, val) => {
        const updated = [...quiz];
        updated[qIdx].options[oIdx] = val;
        setQuiz(updated);
    };

    return (
        <div style={styles.container}>
            <div style={{...styles.formCard, padding: isMobile ? '20px' : '40px'}}>
                
                {/* CATEGORY ARCHITECT SECTION */}
                <div style={styles.categoryManager}>
                    <div style={styles.sectionHeader}><Layers size={18} /> <span>Global Category Architect</span></div>
                    <div style={styles.catInputRow}>
                        <input 
                            style={styles.input} 
                            placeholder="Category Name" 
                            value={newCat.name}
                            onChange={e => setNewCat({...newCat, name: e.target.value})}
                        />
                        <select style={styles.input} value={newCat.group} onChange={e => setNewCat({...newCat, group: e.target.value})}>
                            <option value="learning">Learning Hub</option>
                            <option value="job">Job Board</option>
                        </select>
                        <button onClick={handleAddCategory} style={styles.miniAddBtn}><Plus size={16} /> Deploy</button>
                    </div>
                    <div style={styles.catList}>
                        {/* SAFE MAP: Optional chaining and array check */}
                        {platformCategories?.length > 0 ? platformCategories.map(cat => (
                            <div key={cat._id} style={{...styles.catTag, borderColor: cat.group === 'job' ? '#2563eb' : '#10b981'}}>
                                <span>{cat.name}</span>
                                <Trash2 size={12} onClick={() => handleArchiveCategory(cat._id)} style={styles.deleteIcon} />
                            </div>
                        )) : <span style={{fontSize:'12px', color:'#64748b'}}>No active categories.</span>}
                    </div>
                </div>

                <div style={styles.divider} />

                {/* COURSE ARCHITECT FORM */}
                <header style={styles.header}>
                    <div style={styles.iconCircle}><Layout size={20} color="#fff" /></div>
                    <div>
                        <h2 style={styles.title}>Course Architect</h2>
                        <p style={styles.subtitle}>Deploying to Atlas Global Cloud</p>
                    </div>
                </header>

                <form onSubmit={handleDeployCourse}>
                    <div style={styles.section}>
                        <label style={styles.label}>Course Title</label>
                        <input style={styles.input} value={videoData.title} onChange={e => setVideoData({...videoData, title: e.target.value})} required />

                        <div style={{...styles.flexRow, flexDirection: isMobile ? 'column' : 'row'}}>
                            <div style={{flex:1}}>
                                <label style={styles.label}>Learning Category</label>
                                <select style={styles.input} value={videoData.category} onChange={e => setVideoData({...videoData, category: e.target.value})}>
                                    <option value="">Select a Category</option>
                                    {platformCategories?.filter(c => c.group === 'learning').map(c => (
                                        <option key={c._id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{flex:1}}>
                                <label style={styles.label}>Difficulty Tier</label>
                                <select style={styles.input} value={videoData.difficulty} onChange={e => setVideoData({...videoData, difficulty: e.target.value})}>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Expert">Expert</option>
                                </select>
                            </div>
                        </div>

                        <div style={styles.rewardPanel}>
                            <div style={{flex:1}}>
                                <label style={styles.label}>Reward XP</label>
                                <input type="number" style={styles.input} value={videoData.rewardXP} onChange={e => setVideoData({...videoData, rewardXP: e.target.value})} />
                            </div>
                            <div style={{flex:1}}>
                                <label style={styles.label}>Wallet Reward (৳)</label>
                                <input type="number" style={styles.input} value={videoData.rewardWallet} onChange={e => setVideoData({...videoData, rewardWallet: e.target.value})} />
                            </div>
                        </div>

                        <label style={styles.label}>YouTube Video URL</label>
                        <input style={styles.input} placeholder="https://youtube.com/watch?v=..." value={videoData.videoUrl} onChange={e => setVideoData({...videoData, videoUrl: e.target.value})} required />
                        
                        <label style={styles.label}>Short Description</label>
                        <textarea style={{...styles.input, height: '80px', resize:'none'}} value={videoData.description} onChange={e => setVideoData({...videoData, description: e.target.value})} />
                    </div>

                    {/* QUIZ BUILDER UI */}
                    <div style={styles.quizSection}>
                        <div style={styles.sectionHeader}><BrainCircuit size={18} /> <span>Certification Quiz Logic</span></div>
                        {quiz.map((q, qIdx) => (
                            <div key={qIdx} style={styles.quizCard}>
                                <input 
                                    style={{...styles.input, fontWeight: 'bold', width:'100%'}} 
                                    placeholder={`Question ${qIdx + 1}`} 
                                    value={q.question} 
                                    onChange={(e) => updateQuiz(qIdx, 'question', e.target.value)} 
                                />
                                {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} style={styles.optionRow}>
                                        <input 
                                            style={{...styles.input, flex: 1, marginBottom: 0}} 
                                            placeholder={`Option ${oIdx + 1}`} 
                                            value={opt} 
                                            onChange={(e) => updateOption(qIdx, oIdx, e.target.value)} 
                                        />
                                        <input 
                                            type="radio" 
                                            name={`correct-${qIdx}`} 
                                            checked={q.correctAnswer === oIdx} 
                                            onChange={() => updateQuiz(qIdx, 'correctAnswer', oIdx)} 
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                        <button type="button" onClick={() => setQuiz([...quiz, { question: '', options: ['', '', ''], correctAnswer: 0 }])} style={styles.addQBtn}>+ Add Question</button>
                    </div>

                    <button type="submit" disabled={loading} style={{...styles.submitBtn, opacity: loading ? 0.7 : 1}}>
                        {loading ? 'DEPLOYING...' : 'DEPLOY PLATFORM COURSE'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: { padding: '40px 20px', background: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center' },
    formCard: { background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '900px', boxShadow: '0 20px 50px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' },
    categoryManager: { background: '#f5f3ff', padding: '25px', borderRadius: '18px', border: '1px solid #ddd6fe', marginBottom: '30px' },
    catInputRow: { display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' },
    catList: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' },
    catTag: { background: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', border: '2px solid', display: 'flex', alignItems: 'center' },
    deleteIcon: { cursor: 'pointer', marginLeft: '8px', color: '#ef4444' },
    miniAddBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' },
    divider: { height: '1px', background: '#e2e8f0', margin: '30px 0' },
    header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' },
    iconCircle: { background: '#2563eb', padding: '12px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    title: { margin: 0, color: '#0f172a', fontSize: '24px', fontWeight: '800' },
    subtitle: { margin: '4px 0 0', color: '#64748b', fontSize: '14px' },
    section: { marginBottom: '40px', display: 'flex', flexDirection: 'column' },
    sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', marginBottom: '15px' },
    label: { fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px' },
    input: { padding: '14px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' },
    flexRow: { display: 'flex', gap: '20px' },
    rewardPanel: { display: 'flex', gap: '20px', background: '#f0fdf4', padding: '15px', borderRadius: '16px', marginBottom: '20px' },
    quizCard: { padding: '20px', background: '#f8fafc', borderRadius: '16px', marginBottom: '15px', border: '1px solid #e2e8f0' },
    optionRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
    addQBtn: { padding: '10px', background: '#e2e8f0', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    submitBtn: { width: '100%', padding: '18px', background: '#0f172a', color: '#fff', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', marginTop: '20px', border:'none' }
};