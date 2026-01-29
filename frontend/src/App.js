import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { Plus, Trash2, Shield, Briefcase, GraduationCap } from 'lucide-react'; 

// Component Imports
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDescription from './pages/JobDescription'; // Added for detail view
import CVBuilder from './pages/CVBuilder'; 
import Login from './pages/Login';
import Signup from './pages/Signup'; 
import UserProfile from './pages/UserProfile';
import LearningHub from './pages/LearningHub';
import VideoPlayer from './pages/VideoPlayer';
import WalletDashboardMain from './pages/WalletDashboard';
import AdminPostJob from './pages/AdminPostJob';

const API_BASE = "http://localhost:5000/api";

export default function App() {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('talentbd_v1');
        return saved ? JSON.parse(saved) : null;
    });

    const [view, setView] = useState('home');
    const [currentCourse, setCurrentCourse] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null); // Added for Job Details
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 992 : false);
    
    // Core Data States
    const [categories, setCategories] = useState([]);
    const [jobFilter, setJobFilter] = useState('All');
    const [newCatName, setNewCatName] = useState('');
    const [newCatGroup, setNewCatGroup] = useState('job');

    const [allJobs, setAllJobs] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    
    // --- SYNC ENGINE ---
    const isSyncing = useRef(false);

    /**
     * Refined Sync: Fetches taxonomy, jobs, and courses
     */
    const syncData = useCallback(async (force = false) => {
        if (isSyncing.current && !force) return;

        try {
            isSyncing.current = true;
            console.log(`🔄 Syncing TalentBD Engine...`);
            
            // Fixed URLs to match optimized backend routes
            const [catRes, jobRes, courseRes] = await Promise.all([
                axios.get(`${API_BASE}/categories`),
                axios.get(`${API_BASE}/jobs?isLive=true`),
                axios.get(`${API_BASE}/courses`)
            ]);

            setCategories(catRes.data.categories || []);
            setAllJobs(jobRes.data.jobs || []);
            setAllCourses(courseRes.data.courses || []);

            if (user?.token) {
                const userRes = await axios.get(`${API_BASE}/auth/me`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (userRes.data.user) {
                    const updatedUser = { ...user, ...userRes.data.user };
                    setUser(updatedUser);
                    localStorage.setItem('talentbd_v1', JSON.stringify(updatedUser));
                }
            }
        } catch (err) {
            console.error("❌ Sync failed:", err.message);
        } finally {
            isSyncing.current = false;
        }
    }, [user?.token]);

    useEffect(() => { 
        syncData(); 
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [syncData]);

    // Admin Actions
    const handleAddCategory = async () => {
        if (!newCatName.trim()) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            const res = await axios.post(`${API_BASE}/admin/categories`, { 
                name: newCatName.trim(),
                group: newCatGroup
            }, config);
            
            setCategories(prev => [...prev, res.data.category]);
            setNewCatName('');
        } catch (err) { 
            alert("Admin Authorization Required.");
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await axios.delete(`${API_BASE}/admin/categories/${id}`, config);
            setCategories(prev => prev.filter(c => c._id !== id));
        } catch (err) { 
            alert("Delete failed."); 
        }
    };

    const handleLogout = () => { 
        setUser(null); 
        localStorage.removeItem('talentbd_v1');
        setView('home'); 
    };

    return (
        <div className="App" style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar setView={setView} user={user} handleLogout={handleLogout} />
            
            <AnimatePresence>
                {user && !['video-player', 'cv-builder'].includes(view) && (
                    <motion.div 
                        initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
                        style={{...styles.earningBar, top: isMobile ? '80px' : '95px'}} 
                        onClick={() => setView('dashboard')}
                    >
                        <div style={styles.statChip}>🚀 {user.points || 0} XP</div>
                        <div style={styles.divider} />
                        <div style={{...styles.statChip, color: '#10b981'}}>৳ {user.walletBalance || 0}</div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main style={{ ...styles.mainContent, paddingTop: user ? '180px' : '100px' }}>
                <AnimatePresence mode="wait">
                    <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        
                        {/* VIEW ROUTING */}
                        {view === 'home' && <Home setView={setView} user={user} />}
                        
                        {view === 'jobs' && (
                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '30px' }}>
                                <aside style={{ ...styles.sidebar, width: isMobile ? '100%' : '280px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <h3 style={styles.sidebarTitle}>Industry</h3>
                                        {user?.role === 'admin' && (
                                            <button onClick={() => setView('admin-post')} style={styles.iconBtn}><Plus size={16} /></button>
                                        )}
                                    </div>
                                    <button onClick={() => setJobFilter('All')} style={jobFilter === 'All' ? styles.activeCat : styles.inactiveCat}>All Feed</button>
                                    {categories.filter(c => c.group === 'job').map(cat => (
                                        <button key={cat._id} onClick={() => setJobFilter(cat.name)} style={jobFilter === cat.name ? styles.activeCat : styles.inactiveCat}>
                                            {cat.name}
                                        </button>
                                    ))}
                                </aside>
                                <div style={{ flex: 1 }}>
                                    <Jobs 
                                        jobs={jobFilter === 'All' ? allJobs : allJobs.filter(j => j.category === jobFilter)} 
                                        user={user} 
                                        setView={setView} 
                                        setSelectedJob={setSelectedJob} // Prop drilling for navigation
                                    />
                                </div>
                            </div>
                        )}

                        {view === 'job-detail' && <JobDescription job={selectedJob} setView={setView} />}
                        {view === 'admin-post' && <AdminPostJob user={user} setView={setView} />}
                        {view === 'learning' && <LearningHub courses={allCourses} categories={categories.filter(c => c.group === 'learning')} onStartCourse={(c) => { setCurrentCourse(c); setView('video-player'); }} user={user} />}
                        {view === 'video-player' && <VideoPlayer course={currentCourse} user={user} setView={setView} onVerify={() => syncData(true)} />}
                        {view === 'dashboard' && <WalletDashboardMain user={user} setView={setView} setUser={setUser} />}
                        {view === 'cv-builder' && <CVBuilder user={user} setView={setView} />}
                        {view === 'profile' && <UserProfile user={user} setView={setView} />}
                        {view === 'login' && <Login setUser={setUser} setView={setView} />}
                        {view === 'signup' && <Signup setUser={setUser} setView={setView} />}

                        {/* ADMIN TAXONOMY VIEW */}
                        {user?.role === 'admin' && view === 'admin-categories' && (
                            <div style={styles.adminSection}>
                                <div style={styles.adminHeader}><Shield size={22} color="#2563eb" /><h2>System Taxonomy</h2></div>
                                <div style={styles.adminControls}>
                                    <input style={styles.adminInput} placeholder="New Category..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
                                    <select style={styles.adminSelect} value={newCatGroup} onChange={(e) => setNewCatGroup(e.target.value)}>
                                        <option value="job">Jobs</option>
                                        <option value="learning">Courses</option>
                                    </select>
                                    <button onClick={handleAddCategory} style={styles.addBtn}><Plus size={18} /> Add</button>
                                </div>
                                <div style={styles.catGrid}>
                                    {categories.map(cat => (
                                        <div key={cat._id} style={{...styles.catPill, borderColor: cat.group === 'job' ? '#2563eb' : '#10b981'}}>
                                            {cat.group === 'job' ? <Briefcase size={12}/> : <GraduationCap size={12}/>}
                                            <span>{cat.name}</span>
                                            <Trash2 size={14} style={styles.trashIcon} onClick={() => handleDeleteCategory(cat._id)}/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}

const styles = {
    mainContent: { flex: 1, width: '100%', maxWidth: '1440px', margin: '0 auto', padding: '0 20px', minHeight: '85vh' },
    earningBar: { position: 'fixed', left: '50%', transform: 'translateX(-50%)', background: '#0f172a', borderRadius: '50px', padding: '12px 25px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', cursor: 'pointer', zIndex: 999, border: '1px solid #334155' },
    divider: { width: '1px', height: '14px', background: '#334155' },
    statChip: { color: '#fff', fontSize: '14px', fontWeight: '800' },
    sidebar: { background: '#fff', padding: '25px', borderRadius: '25px', border: '1px solid #e2e8f0', height: 'fit-content', position: 'sticky', top: '180px' },
    sidebarTitle: { fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', letterSpacing: '1px' },
    activeCat: { width: '100%', padding: '12px 16px', textAlign: 'left', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', marginBottom: '6px', cursor: 'pointer' },
    inactiveCat: { width: '100%', padding: '12px 16px', textAlign: 'left', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '12px', fontWeight: '600', marginBottom: '6px', cursor: 'pointer', transition: '0.2s' },
    iconBtn: { background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '5px', cursor: 'pointer', color: '#2563eb' },
    adminSection: { background: '#fff', padding: '30px', borderRadius: '25px', border: '1px solid #e2e8f0', marginBottom: '30px' },
    adminHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
    adminControls: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
    adminInput: { flex: 1, minWidth: '200px', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' },
    adminSelect: { padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' },
    addBtn: { background: '#2563eb', color: '#fff', padding: '12px 20px', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
    catGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
    catPill: { background: '#f8fafc', padding: '8px 15px', borderRadius: '50px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid' },
    trashIcon: { cursor: 'pointer', color: '#ef4444', opacity: 0.6 }
};