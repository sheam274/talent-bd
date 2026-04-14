import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { io } from 'socket.io-client'; 
import { Plus, Trash2, Shield, Briefcase, GraduationCap, Bell, Users } from 'lucide-react'; 

// Component Imports
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDescription from './pages/JobDescription'; 
import CVBuilder from './pages/CVBuilder'; 
import Login from './pages/Login';
import Signup from './pages/Signup'; 
import UserProfile from './pages/UserProfile';
import LearningHub from './pages/LearningHub';
import VideoPlayer from './pages/VideoPlayer';
import WalletDashboardMain from './pages/WalletDashboard';
import AdminPostJob from './pages/AdminPostJob';

// Utility Import
import { theme } from './theme';

const SOCKET_URL = window.location.hostname === 'localhost' 
    ? "http://localhost:5000" 
    : "https://talent-bd-backend.onrender.com";

const API_BASE = `${SOCKET_URL}/api`;

export default function App() {
    // 1. User Persistence & Auth
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('talentbd_v1');
        return saved ? JSON.parse(saved) : null;
    });

    // 2. View & Filter States
    const [view, setView] = useState('home');
    const [currentCourse, setCurrentCourse] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null); 
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 992 : false);
    
    // 3. Global Feed States
    const [categories, setCategories] = useState([]);
    const [jobFilter, setJobFilter] = useState('All');
    const [allJobs, setAllJobs] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    
    // 4. Live States (Sockets)
    const [liveAlert, setLiveAlert] = useState(null);
    const [onlineCount, setOnlineCount] = useState(0); // Tracking live users

    // 5. Admin Helpers
    const [newCatName, setNewCatName] = useState('');
    const [newCatGroup, setNewCatGroup] = useState('job');
    const isSyncing = useRef(false);
    const socket = useRef(null); 

    /**
     * CORE SYNC ENGINE
     */
    const syncData = useCallback(async (force = false) => {
        if (isSyncing.current && !force) return;
        try {
            isSyncing.current = true;
            
            const [catRes, jobRes, courseRes] = await Promise.allSettled([
                axios.get(`${API_BASE}/categories`),
                axios.get(`${API_BASE}/jobs`),
                axios.get(`${API_BASE}/courses`)
            ]);

            if (catRes.status === 'fulfilled') setCategories(catRes.value.data.categories || []);
            if (jobRes.status === 'fulfilled') setAllJobs(jobRes.value.data.jobs || []);
            if (courseRes.status === 'fulfilled') setAllCourses(courseRes.value.data.courses || []);

            if (user?.token) {
                const userRes = await axios.get(`${API_BASE}/auth/me`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (userRes.data.success) {
                    const updatedUser = { ...user, ...userRes.data.user };
                    setUser(updatedUser);
                    localStorage.setItem('talentbd_v1', JSON.stringify(updatedUser));
                }
            }
        } catch (err) {
            console.warn("Sync Latency Detected: Serving cached records.");
        } finally {
            isSyncing.current = false;
        }
    }, [user?.token]);

    /**
     * SOCKET.IO LIVE ENGINE
     */
    useEffect(() => {
        socket.current = io(SOCKET_URL);

        socket.current.on('connect', () => {
            console.log("🟢 Connected to TalentBD Live Engine");
        });

        // Update the live user count
        socket.current.on('user_count_update', (count) => {
            setOnlineCount(count);
        });

        // Listen for real-time job alerts
        socket.current.on('receive_job_alert', (newJob) => {
            setAllJobs(prev => [newJob, ...prev]);
            setLiveAlert(newJob);
            setTimeout(() => setLiveAlert(null), 5000); 
        });

        return () => socket.current.disconnect();
    }, []);

    useEffect(() => { 
        syncData(); 
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [syncData]);

    const handleLogout = () => { 
        setUser(null); 
        localStorage.removeItem('talentbd_v1');
        setView('home'); 
    };

    // --- SECTOR MANAGEMENT ---
    const handleAddCategory = async () => {
        if (!newCatName.trim()) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            const res = await axios.post(`${API_BASE}/admin/categories`, { 
                name: newCatName.trim(),
                group: newCatGroup
            }, config);
            
            if(res.data.success) {
                setCategories(prev => [...prev, res.data.category]);
                setNewCatName('');
                syncData(true);
            }
        } catch (err) { alert("Access Denied: Admin clearance required."); }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Purge this sector from the ecosystem?")) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await axios.delete(`${API_BASE}/admin/categories/${id}`, config);
            setCategories(prev => prev.filter(c => c._id !== id));
        } catch (err) { alert("Deletion Failed: Resource is protected."); }
    };

    return (
        <div className="App" style={styles.appContainer}>
            <Navbar setView={setView} user={user} handleLogout={handleLogout} />
            
            {/* LIVE NOTIFICATION TOAST */}
            <AnimatePresence>
                {liveAlert && (
                    <motion.div 
                        initial={{ x: 300, opacity: 0 }} 
                        animate={{ x: 0, opacity: 1 }} 
                        exit={{ x: 300, opacity: 0 }}
                        style={styles.liveToast}
                        onClick={() => { setSelectedJob(liveAlert); setView('job-detail'); setLiveAlert(null); }}
                    >
                        <Bell size={20} color={theme.colors.primary} />
                        <div>
                            <div style={{fontWeight: 'bold', fontSize: '13px'}}>New Job Posted!</div>
                            <div style={{fontSize: '12px', color: theme.colors.textMuted}}>{liveAlert.title}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* XP, WALLET & LIVE USER OVERLAY */}
            <AnimatePresence>
                {user && !['video-player', 'cv-builder', 'login', 'signup'].includes(view) && (
                    <motion.div 
                        initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
                        style={{...styles.earningBar, top: isMobile ? '70px' : '90px'}} 
                    >
                        <div style={styles.statChip} onClick={() => setView('dashboard')}>🚀 {user.points || 0} XP</div>
                        <div style={styles.divider} />
                        <div style={{...styles.statChip, color: theme.colors.success}} onClick={() => setView('dashboard')}>৳ {user.walletBalance || 0}</div>
                        <div style={styles.divider} />
                        {/* Live User Count UI */}
                        <div style={{...styles.statChip, color: theme.colors.primary, display: 'flex', alignItems: 'center', gap: '5px'}}>
                           <Users size={14} /> {onlineCount}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main style={{ 
                ...styles.mainContent, 
                paddingTop: (user && !['login', 'signup'].includes(view)) ? '160px' : '100px' 
            }}>
                <AnimatePresence mode="wait">
                    <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        
                        {view === 'home' && <Home setView={setView} user={user} />}
                        {view === 'login' && <Login setUser={setUser} setView={setView} />}
                        {view === 'signup' && <Signup setUser={setUser} setView={setView} />}
                        
                        {/* THE INDUSTRY HUB (JOBS) */}
                        {view === 'jobs' && (
                            <div className="sidebar-layout">
                                <aside className="sticky-sidebar">
                                    <div style={styles.sidebarHeader}>
                                        <h3 style={styles.sidebarTitle}>Industry Hub</h3>
                                        {user?.role === 'admin' && (
                                            <button onClick={() => setView('admin-post')} style={styles.iconBtn}>
                                                <Plus size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <button 
                                        className={`category-pill ${jobFilter === 'All' ? 'active' : ''}`}
                                        onClick={() => setJobFilter('All')} 
                                        style={{ width: '100%', marginBottom: '8px' }}
                                    >
                                        Global Feed
                                    </button>
                                    {categories.filter(c => c.group === 'job').map(cat => (
                                        <button 
                                            key={cat._id} 
                                            className={`category-pill ${jobFilter === cat.name ? 'active' : ''}`}
                                            onClick={() => setJobFilter(cat.name)} 
                                            style={{ width: '100%', marginBottom: '8px' }}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </aside>
                                <div style={{ flex: 1 }}>
                                    <Jobs 
                                        jobs={jobFilter === 'All' ? allJobs : allJobs.filter(j => j.category === jobFilter)} 
                                        user={user} setView={setView} setSelectedJob={setSelectedJob} 
                                    />
                                </div>
                            </div>
                        )}

                        {view === 'job-detail' && <JobDescription job={selectedJob} setView={setView} user={user} />}
                        {view === 'admin-post' && <AdminPostJob user={user} setView={setView} />}

                        {/* SKILL HUB */}
                        {view === 'learning' && (
                            <LearningHub 
                                courses={allCourses} 
                                categories={categories.filter(c => c.group === 'learning')} 
                                onStartCourse={(c) => { setCurrentCourse(c); setView('video-player'); }} 
                                user={user} setView={setView}
                            />
                        )}
                        {view === 'video-player' && <VideoPlayer course={currentCourse} user={user} setView={setView} onVerify={() => syncData(true)} />}
                        
                        {/* USER SYSTEMS */}
                        {view === 'dashboard' && <WalletDashboardMain user={user} setView={setView} setUser={setUser} />}
                        {view === 'cv-builder' && <CVBuilder user={user} setView={setView} />}
                        {view === 'profile' && <UserProfile user={user} setView={setView} />}

                        {/* ADMIN TAXONOMY EDITOR */}
                        {user?.role === 'admin' && view === 'admin-categories' && (
                            <div className="admin-hub-card">
                                <div style={styles.adminHeader}><Shield size={22} color={theme.colors.primary} /><h2>Platform Taxonomy</h2></div>
                                <div style={styles.adminControls}>
                                    <input className="input-field" placeholder="New Sector Name..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} style={{ flex: 1 }} />
                                    <select className="input-field" value={newCatGroup} onChange={(e) => setNewCatGroup(e.target.value)} style={{ width: '200px' }}>
                                        <option value="job">Jobs Sector</option>
                                        <option value="learning">Skill Domain</option>
                                    </select>
                                    <button className="btn-primary" onClick={handleAddCategory}><Plus size={18} /> Deploy</button>
                                </div>
                                <div style={styles.catGrid}>
                                    {categories.map(cat => (
                                        <div key={cat._id} className="category-pill" style={{ borderColor: cat.group === 'job' ? theme.colors.primary : theme.colors.success }}>
                                            {cat.group === 'job' ? <Briefcase size={14}/> : <GraduationCap size={14}/>}
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
    appContainer: { background: theme.colors.bgMain, minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    mainContent: { flex: 1, width: '100%', maxWidth: '1440px', margin: '0 auto', padding: '0 20px' },
    earningBar: { position: 'fixed', left: '50%', transform: 'translateX(-50%)', background: theme.colors.bgDark, borderRadius: '50px', padding: '12px 25px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: theme.shadows.premium, zIndex: 999, border: `1px solid ${theme.colors.secondary}` },
    liveToast: { position: 'fixed', right: '20px', bottom: '20px', background: theme.colors.bgDark, borderLeft: `4px solid ${theme.colors.primary}`, padding: '15px 25px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: theme.shadows.premium, zIndex: 2000, cursor: 'pointer' },
    divider: { width: '1px', height: '14px', background: theme.colors.secondary },
    statChip: { color: '#fff', fontSize: '14px', fontWeight: '800', cursor: 'pointer' },
    sidebarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    sidebarTitle: { fontSize: '11px', textTransform: 'uppercase', color: theme.colors.textMuted, fontWeight: '800', letterSpacing: '1px' },
    iconBtn: { background: theme.colors.bgMain, border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: theme.colors.primary, display: 'flex', alignItems: 'center' },
    adminHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
    adminControls: { display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' },
    catGrid: { display: 'flex', flexWrap: 'wrap', gap: '12px' },
    trashIcon: { cursor: 'pointer', color: theme.colors.danger, marginLeft: '8px', opacity: 0.7 }
};