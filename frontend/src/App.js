import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Component Imports (Ensure these files exist in your /pages and /components folders)
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import CVBuilder from './pages/CVBuilder';
import Login from './pages/Login';
import UserProfile from './pages/UserProfile';
import AdminPanel from './pages/AdminPanel'; 
import LearningHub from './pages/LearningHub';
import VideoPlayer from './pages/VideoPlayer';

// --- 1. THE WALLET DASHBOARD COMPONENT ---
function WalletDashboard({ user, setView }) {
    const nextLevelXP = 1000;
    const progress = ((user?.points || 0) % nextLevelXP) / 10;

    return (
        <div style={dashStyles.container}>
            <header style={dashStyles.header}>
                <h2 style={{margin: 0}}>Financial & Skill Overview</h2>
                <p style={{color: '#64748b'}}>Track your growth and earnings in real-time.</p>
            </header>
            <div style={dashStyles.statsGrid}>
                <motion.div whileHover={{y: -5}} style={dashStyles.card}>
                    <div style={dashStyles.cardLabel}>Available Balance</div>
                    <div style={dashStyles.balance}>${user?.walletBalance || 0}.00</div>
                    <div style={dashStyles.cardFooter}><span style={{color: '#10b981'}}>●</span> Ready for withdrawal</div>
                </motion.div>
                <motion.div whileHover={{y: -5}} style={dashStyles.card}>
                    <div style={dashStyles.cardLabel}>Skill Level</div>
                    <div style={dashStyles.levelText}>Lvl {Math.floor((user?.points || 0) / 1000) + 1}</div>
                    <div style={dashStyles.progressTrack}>
                        <div style={{...dashStyles.progressBar, width: `${progress}%`}}></div>
                    </div>
                    <div style={dashStyles.cardFooter}>{user?.points || 0} XP earned</div>
                </motion.div>
            </div>
            <button onClick={() => setView('jobs')} style={styles.primaryBtn}>Find Gigs to Earn More</button>
        </div>
    );
}

// --- 2. THE MOCK ADMIN DASHBOARD VIEW (NOW WITH POSTING) ---
function AdminDashboardView() {
    const [activeTab, setActiveTab] = useState('stats');
    const [newJob, setNewJob] = useState({ title: '', reward: '', skill: '' });
    const [newSkill, setNewSkill] = useState({ title: '', tag: '', video: '' });

    const stats = [
        { label: "Active Learners", value: "1,240", color: "#2563eb" },
        { label: "Total Paid Out", value: "$12,500", color: "#10b981" },
        { label: "Pending Gigs", value: "45", color: "#6366f1" }
    ];

    const handleSubmit = (type) => {
        alert(`${type} posted successfully! This is now live in the mock database.`);
    };

    return (
        <div style={dashStyles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0 }}>Admin Management</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setActiveTab('stats')} style={activeTab === 'stats' ? styles.activeAdminBtn : styles.adminBtn}>Insights</button>
                    <button onClick={() => setActiveTab('post-job')} style={activeTab === 'post-job' ? styles.activeAdminBtn : styles.adminBtn}>Post Job</button>
                    <button onClick={() => setActiveTab('post-skill')} style={activeTab === 'post-skill' ? styles.activeAdminBtn : styles.adminBtn}>Post Skill</button>
                </div>
            </div>

            {activeTab === 'stats' && (
                <div style={dashStyles.statsGrid}>
                    {stats.map((stat, i) => (
                        <div key={i} style={{ ...dashStyles.card, borderLeft: `5px solid ${stat.color}` }}>
                            <div style={dashStyles.cardLabel}>{stat.label}</div>
                            <div style={{ ...dashStyles.balance, color: stat.color }}>{stat.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'post-job' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={dashStyles.card}>
                    <h3>📢 Post a New Gig</h3>
                    <input style={formStyles.input} placeholder="Job Title" onChange={e => setNewJob({...newJob, title: e.target.value})} />
                    <input style={formStyles.input} placeholder="Reward (e.g. $50)" onChange={e => setNewJob({...newJob, reward: e.target.value})} />
                    <input style={formStyles.input} placeholder="Required Skill Tag" onChange={e => setNewJob({...newJob, skill: e.target.value})} />
                    <button onClick={() => handleSubmit('Job')} style={styles.primaryBtn}>Publish Gig</button>
                </motion.div>
            )}

            {activeTab === 'post-skill' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={dashStyles.card}>
                    <h3>🎓 Post a New Course</h3>
                    <input style={formStyles.input} placeholder="Course Title" onChange={e => setNewSkill({...newSkill, title: e.target.value})} />
                    <input style={formStyles.input} placeholder="Skill Tag" onChange={e => setNewSkill({...newSkill, tag: e.target.value})} />
                    <input style={formStyles.input} placeholder="YouTube Embed URL" onChange={e => setNewSkill({...newSkill, video: e.target.value})} />
                    <button onClick={() => handleSubmit('Course')} style={styles.primaryBtn}>Upload Course</button>
                </motion.div>
            )}
        </div>
    );
}

// --- 3. MAIN APP ENGINE ---
export default function App() {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('talentbd_v1');
        return saved ? JSON.parse(saved) : null;
    });

    const [view, setView] = useState('home');
    const [showScroll, setShowScroll] = useState(false); 
    const [currentCourse, setCurrentCourse] = useState(null);
    const [selectedJobForAI, setSelectedJobForAI] = useState(null); 

    useEffect(() => {
        if (user) localStorage.setItem('talentbd_v1', JSON.stringify(user));
    }, [user]);

    useEffect(() => {
        const checkScroll = () => setShowScroll(window.pageYOffset > 300);
        window.addEventListener('scroll', checkScroll);
        return () => window.removeEventListener('scroll', checkScroll);
    }, []);

    const handleLogout = () => { 
        setUser(null); 
        localStorage.removeItem('talentbd_v1'); 
        setView('home'); 
    };

    const onSkillVerified = (skillName, xpReward) => {
        if (!user) return;
        const hasSkill = user.skills?.includes(skillName);
        setUser(prev => ({
            ...prev,
            skills: hasSkill ? prev.skills : [...(prev.skills || []), skillName],
            points: (prev.points || 0) + (hasSkill ? 0 : xpReward),
            walletBalance: (prev.walletBalance || 0) + (hasSkill ? 0 : 50) 
        }));
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar setView={setView} user={user} handleLogout={handleLogout} />
            
            {user && (
                <div style={styles.earningBar} onClick={() => setView('dashboard')}>
                    <div style={styles.stat}>🏆 Lvl {Math.floor((user.points || 0) / 1000) + 1}</div>
                    <div style={styles.stat}>⭐ {user.skills?.length || 0} Skills</div>
                    <div style={{...styles.stat, color: '#10b981'}}>💰 Balance: ${user.walletBalance || 0}</div>
                    {user.role === 'admin' && (
                        <div style={{...styles.stat, color: '#f59e0b', marginLeft: '20px'}} onClick={(e) => {e.stopPropagation(); setView('admin');}}>🛠 Admin Panel</div>
                    )}
                </div>
            )}

            <main style={{ flex: 1, paddingTop: '120px', width: '90%', maxWidth: '1200px', margin: '0 auto' }}>
                <AnimatePresence mode="wait">
                    <motion.div key={view} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                        {view === 'home' && <Home setView={setView} user={user} />}
                        {view === 'jobs' && <Jobs user={user} onAudit={(j) => { setSelectedJobForAI(j); setView('cv-builder'); }} />}
                        {view === 'cv-builder' && <CVBuilder user={user} setUser={setUser} preloadedJob={selectedJobForAI} setView={setView} />}
                        {view === 'learning' && <LearningHub onStartCourse={(c) => { setCurrentCourse(c); setView('video-player'); }} user={user} />}
                        {view === 'video-player' && <VideoPlayer course={currentCourse} user={user} setView={setView} onVerify={onSkillVerified} />}
                        {view === 'login' && <Login setUser={setUser} setView={setView} />}
                        {view === 'profile' && <UserProfile user={user} setView={setView} setUser={setUser} />}
                        {view === 'dashboard' && <WalletDashboard user={user} setView={setView} />}
                        {view === 'admin' && (user?.role === 'admin' ? <AdminDashboardView /> : <AdminPanel user={user} />)}
                    </motion.div>
                </AnimatePresence>
            </main>

            {showScroll && (
                <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} style={styles.scrollTop}>↑</button>
            )}

            <footer style={styles.footer}>
                <div style={styles.footerBottom}>&copy; 2026 TalentBD. Niche: Learning and Earning.</div>
            </footer>
        </div>
    );
}

// --- 4. CSS STYLES (Consolidated to fix Undefined Errors) ---
const styles = {
    earningBar: { position: 'fixed', top: '70px', left: 0, right: 0, background: '#1e293b', color: '#fff', padding: '10px 5%', display: 'flex', justifyContent: 'center', gap: '40px', zIndex: 50, borderBottom: '2px solid #2563eb', cursor: 'pointer' },
    stat: { fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center' },
    footer: { background: '#0f172a', color: '#94a3b8', padding: '40px 0 20px', marginTop: '80px' },
    footerBottom: { textAlign: 'center', fontSize: '12px' },
    primaryBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', width: '100%' },
    scrollTop: { position: 'fixed', bottom: '30px', right: '30px', width: '45px', height: '45px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', zIndex: 100 },
    adminBtn: { background: '#f1f5f9', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
    activeAdminBtn: { background: '#1e293b', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }
};

const dashStyles = {
    container: { padding: '20px 0' },
    header: { marginBottom: '30px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    card: { background: '#fff', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' },
    cardLabel: { fontSize: '14px', color: '#64748b', fontWeight: 'bold', marginBottom: '10px' },
    balance: { fontSize: '36px', fontWeight: '900' },
    levelText: { fontSize: '32px', fontWeight: '900', color: '#2563eb' },
    progressTrack: { height: '8px', background: '#e2e8f0', borderRadius: '10px', margin: '15px 0', overflow: 'hidden' },
    progressBar: { height: '100%', background: '#2563eb' },
    cardFooter: { fontSize: '12px', color: '#64748b' }
};

const formStyles = {
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px', boxSizing: 'border-box' }
};