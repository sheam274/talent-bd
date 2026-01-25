import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { Plus, Trash2, Shield, Briefcase, GraduationCap } from 'lucide-react'; 

// Component Imports
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import CVBuilder from './pages/CVBuilder'; 
import Login from './pages/Login';
import Signup from './pages/Signup'; 
import UserProfile from './pages/UserProfile';
import LearningHub from './pages/LearningHub';
import VideoPlayer from './pages/VideoPlayer';
import WalletDashboardMain from './pages/WalletDashboard';

const API_BASE = "http://localhost:5000/api";

export default function App() {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('talentbd_v1');
        return saved ? JSON.parse(saved) : null;
    });

    const [view, setView] = useState('home');
    const [currentCourse, setCurrentCourse] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    
    const [categories, setCategories] = useState([]);
    const [jobFilter, setJobFilter] = useState('All');
    const [newCatName, setNewCatName] = useState('');
    const [newCatGroup, setNewCatGroup] = useState('job');

    const [allJobs, setAllJobs] = useState([]);
    const [allCourses, setAllCourses] = useState([]);

    // 1. DYNAMIC DATA SYNC
    const syncData = useCallback(async () => {
        try {
            const [catRes, jobRes, courseRes] = await Promise.all([
                axios.get(`${API_BASE}/categories`),
                axios.get(`${API_BASE}/jobs`),
                axios.get(`${API_BASE}/courses`)
            ]);
            setCategories(catRes.data);
            setAllJobs(jobRes.data.jobs || jobRes.data);
            setAllCourses(courseRes.data.courses || courseRes.data);
        } catch (err) {
            console.error("Backend offline. Check http://localhost:5000");
        }
    }, []);

    useEffect(() => { syncData(); }, [syncData]);

    // 2. ADMIN CATEGORY MANAGER (Add/Delete)
    const handleAddCategory = async () => {
        if (!newCatName.trim()) return;
        try {
            const res = await axios.post(`${API_BASE}/admin/categories`, { 
                name: newCatName.trim(),
                group: newCatGroup,
                icon: newCatGroup === 'job' ? '💼' : '🎓'
            });
            // Update UI immediately
            setCategories(prev => [...prev, res.data.category]);
            setNewCatName('');
        } catch (err) { 
            console.error("Sync Failed");
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await axios.delete(`${API_BASE}/admin/categories/${id}`);
            setCategories(prev => prev.filter(c => c._id !== id));
        } catch (err) { alert("Delete Failed"); }
    };

    // 3. RESPONSIVE & PERSISTENCE
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (user) localStorage.setItem('talentbd_v1', JSON.stringify(user));
        else localStorage.removeItem('talentbd_v1');
    }, [user]);

    const handleLogout = () => { setUser(null); setView('home'); };

    return (
        <div className="App" style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar setView={setView} user={user} handleLogout={handleLogout} />
            
            {/* 💰 EARNING STATUS BAR (Mobile Optimized) */}
            <AnimatePresence>
                {user && !['video-player', 'cv-builder'].includes(view) && (
                    <motion.div 
                        initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
                        style={{...styles.earningBar, top: isMobile ? '70px' : '85px'}} 
                        onClick={() => setView('dashboard')}
                    >
                        <div style={styles.statChip}>🚀 Level {Math.floor((user.points || 0) / 1000) + 1}</div>
                        <div style={{...styles.statChip, color: '#10b981'}}>💰 ${user.walletBalance || 0}.00</div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main style={{ ...styles.mainContent, paddingTop: user ? '160px' : '100px' }}>
                <AnimatePresence mode="wait">
                    <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        
                        {/* 🛡️ ADMIN PANEL: GLOBAL CATEGORY SYNC */}
                        {user?.role === 'admin' && view === 'dashboard' && (
                            <div style={styles.adminSection}>
                                <div style={styles.adminHeader}>
                                    <Shield size={22} color="#2563eb" />
                                    <h2 style={{ fontSize: '1.1rem' }}>Manage Platform Categories</h2>
                                </div>
                                <div style={styles.adminControls}>
                                    <input 
                                        style={styles.adminInput}
                                        placeholder="Category Name (e.g. React, UX)..."
                                        value={newCatName}
                                        onChange={(e) => setNewCatName(e.target.value)}
                                    />
                                    <select style={styles.adminSelect} value={newCatGroup} onChange={(e) => setNewCatGroup(e.target.value)}>
                                        <option value="job">Jobs</option>
                                        <option value="learning">Learning Hub</option>
                                    </select>
                                    <button onClick={handleAddCategory} style={styles.addBtn}><Plus size={18} /> Add</button>
                                </div>
                                <div style={styles.catGrid}>
                                    {categories.map(cat => (
                                        <div key={cat._id} style={{...styles.catPill, borderColor: cat.group === 'job' ? '#2563eb' : '#10b981'}}>
                                            {cat.group === 'job' ? <Briefcase size={12}/> : <GraduationCap size={12}/>}
                                            <span>{cat.name}</span>
                                            <Trash2 size={14} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => handleDeleteCategory(cat._id)}/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 💼 JOBS MARKETPLACE */}
                        {view === 'jobs' && (
                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '25px' }}>
                                <aside style={{ ...styles.sidebar, width: isMobile ? '100%' : '260px' }}>
                                    <h3 style={styles.sidebarTitle}>Filter by Category</h3>
                                    <button onClick={() => setJobFilter('All')} style={jobFilter === 'All' ? styles.activeCat : styles.inactiveCat}>Global Market</button>
                                    {categories.filter(c => c.group === 'job').map(cat => (
                                        <button key={cat._id} onClick={() => setJobFilter(cat.name)} style={jobFilter === cat.name ? styles.activeCat : styles.inactiveCat}>
                                            {cat.name}
                                        </button>
                                    ))}
                                </aside>
                                <div style={{ flex: 1 }}>
                                    <Jobs jobs={jobFilter === 'All' ? allJobs : allJobs.filter(j => j.category === jobFilter)} user={user} setView={setView} />
                                </div>
                            </div>
                        )}

                        {/* 🎓 LEARNING HUB */}
                        {view === 'learning' && (
                            <LearningHub 
                                courses={allCourses} 
                                // Only pass learning-specific categories
                                categories={categories.filter(c => c.group === 'learning')}
                                onStartCourse={(c) => { setCurrentCourse(c); setView('video-player'); }} 
                                user={user} 
                            />
                        )}

                        {/* 📺 VIDEO PLAYER */}
                        {view === 'video-player' && (
                            <VideoPlayer course={currentCourse} user={user} setView={setView} onVerify={syncData} />
                        )}

                        {/* 📂 DEFAULT VIEWS */}
                        {view === 'home' && <Home setView={setView} user={user} />}
                        {view === 'dashboard' && <WalletDashboardMain user={user} setView={setView} setUser={setUser} />}
                        {view === 'login' && <Login setUser={setUser} setView={setView} />}
                        {view === 'signup' && <Signup setUser={setUser} setView={setView} />}
                        {view === 'cv-builder' && <CVBuilder user={user} setView={setView} />}
                        {view === 'profile' && <UserProfile user={user} setView={setView} />}

                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}

const styles = {
    mainContent: { flex: 1, width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 20px' },
    earningBar: { position: 'fixed', left: '50%', transform: 'translateX(-50%)', background: '#0f172a', borderRadius: '50px', padding: '12px 28px', display: 'flex', gap: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', cursor: 'pointer', zIndex: 9999 },
    statChip: { color: '#fff', fontSize: '13px', fontWeight: '800' },
    sidebar: { background: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', height: 'fit-content', position: 'sticky', top: '160px' },
    sidebarTitle: { fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 'bold', marginBottom: '15px', letterSpacing: '0.5px' },
    activeCat: { width: '100%', padding: '12px 16px', textAlign: 'left', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', marginBottom: '6px', cursor: 'pointer' },
    inactiveCat: { width: '100%', padding: '12px 16px', textAlign: 'left', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '10px', fontWeight: '600', marginBottom: '6px', cursor: 'pointer' },
    adminSection: { background: '#fff', padding: '30px', borderRadius: '24px', border: '2px dashed #cbd5e1', marginBottom: '40px' },
    adminHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
    adminControls: { display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '25px' },
    adminInput: { flex: 2, minWidth: '200px', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' },
    adminSelect: { flex: 1, minWidth: '120px', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' },
    addBtn: { background: '#0f172a', color: '#fff', padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
    catGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
    catPill: { background: '#f8fafc', padding: '8px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', border: '2px solid' }
};