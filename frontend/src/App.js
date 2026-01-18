import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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
import WalletDashboardMain from './pages/WalletDashboard'; // SYNCED: Importing the main dashboard

export default function App() {
    // 1. INITIAL STATES & RESPONSIVENESS
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('talentbd_v1');
        return saved ? JSON.parse(saved) : null;
    });

    const [view, setView] = useState('home');
    const [currentCourse, setCurrentCourse] = useState(null);
    const [selectedJobForAI, setSelectedJobForAI] = useState(null); 
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Responsive Tracker for HP-840 and Mobile
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [allJobs, setAllJobs] = useState(() => {
        const saved = localStorage.getItem('talentbd_jobs');
        return saved ? JSON.parse(saved) : [
            { id: 1, title: 'Frontend Developer', reward: 500, skill: 'React JS', desc: 'Fix state management.', type: 'Gig' }
        ];
    });

    const [allCourses, setAllCourses] = useState(() => {
        const saved = localStorage.getItem('talentbd_courses');
        return saved ? JSON.parse(saved) : [
            { id: 1, title: 'React Mastery 2026', tag: 'React JS', video: 'https://www.youtube.com/watch?v=Ke90Tje7VS0' }
        ];
    });

    // 2. PERSISTENCE LAYER
    useEffect(() => {
        if (user) localStorage.setItem('talentbd_v1', JSON.stringify(user));
        else localStorage.removeItem('talentbd_v1');
    }, [user]);

    useEffect(() => {
        localStorage.setItem('talentbd_jobs', JSON.stringify(allJobs));
        localStorage.setItem('talentbd_courses', JSON.stringify(allCourses));
    }, [allJobs, allCourses]);

    // 3. ACTION HANDLERS (Core Logic Preservation)
    const handleAddJob = (job) => setAllJobs(prev => [{ ...job, id: Date.now() }, ...prev]);
    const handleAddCourse = (course) => setAllCourses(prev => [{ ...course, id: Date.now() }, ...prev]);

    const onSkillVerified = useCallback((skillName, xpReward, cashReward = 50) => {
        if (!user) return;
        const updatedUser = {
            ...user,
            points: (user.points || 0) + xpReward,
            walletBalance: (user.walletBalance || 0) + cashReward,
            skills: user.skills ? [...new Set([...user.skills, skillName])] : [skillName]
        };
        setUser(updatedUser);
    }, [user]);

    const handleLogout = () => {
        setUser(null);
        setView('home');
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <Navbar setView={setView} user={user} handleLogout={handleLogout} />
            
            {/* 4. EARNING STATUS BAR (Responsive & Synced) */}
            <AnimatePresence>
                {user && view !== 'cv-builder' && view !== 'video-player' && (
                    <motion.div 
                        initial={{ y: -60, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        exit={{ y: -60, opacity: 0 }} 
                        style={{
                            ...styles.earningBar,
                            width: isMobile ? '95%' : 'auto',
                            padding: isMobile ? '8px 15px' : '10px 24px'
                        }} 
                        onClick={() => setView('dashboard')}
                    >
                        <div style={styles.stat}>🏆 <span style={{display: isMobile ? 'none' : 'inline'}}>Level</span> {Math.floor((user.points || 0) / 1000) + 1}</div>
                        <div style={styles.statSeparator} />
                        <div style={{...styles.stat, color: '#10b981'}}>💰 ${user.walletBalance || 0}.00</div>
                        {!isMobile && (
                            <>
                                <div style={styles.statSeparator} />
                                <div style={{...styles.stat, fontSize: '11px', opacity: 0.8}}>DASHBOARD <motion.div animate={{x: [0, 5, 0]}} transition={{repeat: Infinity}}>→</motion.div></div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 5. MAIN ROUTER SECTION */}
            <main style={{
                ...styles.mainContent, 
                paddingTop: user && view !== 'cv-builder' ? (isMobile ? '120px' : '140px') : '80px',
                paddingBottom: '40px'
            }}>
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={view} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }} 
                        transition={{ duration: 0.3 }}
                    >
                        
                        {view === 'home' && <Home setView={setView} user={user} />}
                        {view === 'login' && <Login setUser={setUser} setView={setView} />}
                        {view === 'signup' && <Signup setView={setView} />}
                        
                        {view === 'learning' && (
                            <LearningHub 
                                courses={allCourses} 
                                onStartCourse={(c) => { setCurrentCourse(c); setView('video-player'); }} 
                                user={user} 
                            />
                        )}
                        
                        {view === 'video-player' && (
                            <VideoPlayer 
                                course={currentCourse} 
                                user={user} 
                                setView={setView} 
                                onVerify={onSkillVerified} 
                            />
                        )}

                        {view === 'jobs' && (
                            <Jobs 
                                jobs={allJobs} 
                                user={user} 
                                setView={setView} 
                                onStartAI={(job) => { 
                                    setSelectedJobForAI(job); 
                                    setView('cv-builder'); 
                                }}
                            />
                        )}

                        {view === 'cv-builder' && (
                            <CVBuilder 
                                user={user} 
                                job={selectedJobForAI} 
                                onClose={() => setView('jobs')} 
                            />
                        )}

                        {/* SYNCED: Using the High-End WalletDashboard if available, else fallback */}
                        {view === 'dashboard' && (
                            <WalletDashboardMain user={user} setView={setView} setUser={setUser} />
                        )}
                        
                        {view === 'admin' && (
                            <AdminDashboardView 
                                user={user}
                                onJobPost={handleAddJob} 
                                onSkillPost={handleAddCourse} 
                                isMobile={isMobile}
                            />
                        )}

                        {view === 'profile' && <UserProfile user={user} setUser={setUser} />}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}

// --- SUB-COMPONENTS (Refined & Responsive) ---

function AdminDashboardView({ user, onJobPost, onSkillPost, isMobile }) {
    const [activeTab, setActiveTab] = useState('post-job');
    const [newJob, setNewJob] = useState({ title: '', reward: '', skill: '', type: 'Gig' });
    const [newSkill, setNewSkill] = useState({ title: '', tag: '', video: '' });

    if (user?.role !== 'admin') {
        return <div style={{textAlign:'center', padding:'100px 20px'}}>Access Denied. Contact Admin for portal entry.</div>;
    }

    return (
        <div style={{...dashStyles.container, padding: isMobile ? '0' : '20px 0'}}>
            <h2 style={{marginBottom:'30px', fontWeight: '900', letterSpacing: '-1px'}}>Admin Control Center</h2>
            <div style={{...dashStyles.tabContainer, flexDirection: isMobile ? 'column' : 'row', gap: '5px'}}>
                <button onClick={() => setActiveTab('post-job')} style={{
                    ...(activeTab === 'post-job' ? styles.activeAdminBtn : styles.adminBtn),
                    width: isMobile ? '100%' : 'auto'
                }}>GIG MARKETPLACE</button>
                <button onClick={() => setActiveTab('post-skill')} style={{
                    ...(activeTab === 'post-skill' ? styles.activeAdminBtn : styles.adminBtn),
                    width: isMobile ? '100%' : 'auto'
                }}>LEARNING HUB</button>
            </div>

            <motion.div initial={{opacity:0}} animate={{opacity:1}} key={activeTab}>
                {activeTab === 'post-job' ? (
                    <div style={dashStyles.card}>
                        <h3 style={{marginBottom:'20px'}}>Broadcast New Gig</h3>
                        <input style={formStyles.input} placeholder="Job Title (e.g. Logo Design)" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
                        <div style={{display:'flex', gap:'10px'}}>
                            <input style={formStyles.input} placeholder="Reward ($)" value={newJob.reward} onChange={e => setNewJob({...newJob, reward: e.target.value})} />
                            <input style={formStyles.input} placeholder="Required Skill" value={newJob.skill} onChange={e => setNewJob({...newJob, skill: e.target.value})} />
                        </div>
                        <button style={{...styles.primaryBtn, width: '100%'}} onClick={() => {onJobPost(newJob); alert("Gig Broadcasted!");}}>Push to Market</button>
                    </div>
                ) : (
                    <div style={dashStyles.card}>
                        <h3 style={{marginBottom:'20px'}}>Inject Skill Module</h3>
                        <input style={formStyles.input} placeholder="Module Title" value={newSkill.title} onChange={e => setNewSkill({...newSkill, title: e.target.value})} />
                        <input style={formStyles.input} placeholder="Target Skill Tag" value={newSkill.tag} onChange={e => setNewSkill({...newSkill, tag: e.target.value})} />
                        <input style={formStyles.input} placeholder="YouTube Video URL" value={newSkill.video} onChange={e => setNewSkill({...newSkill, video: e.target.value})} />
                        <button style={{...styles.primaryBtn, width: '100%', background: '#10b981'}} onClick={() => {onSkillPost(newSkill); alert("Module Injected!");}}>Activate Course</button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

// --- STYLES (Synchronized & Modernized) ---

const styles = {
    mainContent: { flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', transition: 'padding 0.3s ease' },
    earningBar: { position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', gap: '20px', zIndex: 40, borderRadius: '0 0 20px 20px', cursor: 'pointer', boxShadow: '0 15px 25px -5px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none' },
    stat: { fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', fontSize:'13px', letterSpacing: '0.5px' },
    statSeparator: { width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' },
    primaryBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '14px', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' },
    adminBtn: { background: '#fff', padding: '12px 24px', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: '700', color: '#64748b', transition: '0.2s' },
    activeAdminBtn: { background: '#0f172a', color: '#fff', padding: '12px 24px', cursor: 'pointer', border: 'none', borderRadius: '10px', fontWeight: '700', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }
};

const dashStyles = {
    container: { padding: '20px 0', maxWidth: '800px', margin: '0 auto' },
    card: { background: '#fff', padding: '35px', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.03)' },
    tabContainer: { marginBottom: '30px', display: 'flex', background:'#f1f5f9', padding:'6px', borderRadius:'14px' }
};

const formStyles = {
    input: { width: '100%', padding: '16px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', background:'#f8fafc', fontWeight: '600', outline: 'none', transition: '0.2s' }
};