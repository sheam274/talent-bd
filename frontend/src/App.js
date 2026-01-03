import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Component Imports
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import CVBuilder from './pages/CVBuilder';
import Login from './pages/Login';
import Signup from './pages/Signup'; 
import UserProfile from './pages/UserProfile';
import AdminPanel from './pages/AdminPanel'; 
import LearningHub from './pages/LearningHub';
import VideoPlayer from './pages/VideoPlayer';

export default function App() {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('talentbd_v1');
            return saved ? JSON.parse(saved) : null;
        } catch (e) { return null; }
    });

    const [view, setView] = useState('home');
    const [currentCourse, setCurrentCourse] = useState(null);
    const [selectedJobForAI, setSelectedJobForAI] = useState(null); 

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

    useEffect(() => {
        localStorage.setItem('talentbd_v1', user ? JSON.stringify(user) : '');
        localStorage.setItem('talentbd_jobs', JSON.stringify(allJobs));
        localStorage.setItem('talentbd_courses', JSON.stringify(allCourses));
    }, [user, allJobs, allCourses]);

    const handleAddJob = (job) => setAllJobs(prev => [{ ...job, id: Date.now() }, ...prev]);
    const handleAddCourse = (course) => setAllCourses(prev => [{ ...course, id: Date.now() }, ...prev]);

    const onSkillVerified = useCallback(async (skillName, xpReward, cashReward = 50) => {
        if (!user) return;
        const tempUser = {
            ...user,
            points: (user.points || 0) + xpReward,
            walletBalance: (user.walletBalance || 0) + cashReward,
            skills: user.skills ? [...new Set([...user.skills, skillName])] : [skillName]
        };
        setUser(tempUser);
    }, [user]);

    const handleLogout = () => {
        setUser(null);
        setView('home');
        localStorage.removeItem('talentbd_v1');
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar setView={setView} user={user} handleLogout={handleLogout} />
            
            <AnimatePresence>
                {user && (
                    <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }} style={styles.earningBar} onClick={() => setView('dashboard')}>
                        <div style={styles.stat}>🏆 Level {Math.floor((user.points || 0) / 1000) + 1}</div>
                        <div style={styles.statSeparator} />
                        <div style={{...styles.stat, color: '#10b981'}}>💰 ${user.walletBalance || 0}.00</div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main style={{...styles.mainContent, paddingTop: user ? '140px' : '90px'}}>
                <AnimatePresence mode="wait">
                    <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {view === 'home' && <Home setView={setView} user={user} />}
                        {view === 'login' && <Login setUser={setUser} setView={setView} />}
                        {view === 'signup' && <Signup setView={setView} />}
                        {view === 'learning' && <LearningHub courses={allCourses} onStartCourse={(c) => { setCurrentCourse(c); setView('video-player'); }} user={user} />}
                        {view === 'video-player' && <VideoPlayer course={currentCourse} user={user} setView={setView} onVerify={onSkillVerified} />}
                        {view === 'jobs' && <Jobs jobs={allJobs} user={user} setView={setView} />}
                        {view === 'dashboard' && <WalletDashboard user={user} setView={setView} />}
                        {view === 'admin' && (user?.role === 'admin' ? <AdminDashboardView onJobPost={handleAddJob} onSkillPost={handleAddCourse} /> : <AdminPanel user={user} />)}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}

// --- MISSING COMPONENTS ---

function WalletDashboard({ user, setView }) {
    const progress = useMemo(() => ((user?.points || 0) % 1000) / 10, [user?.points]);
    return (
        <div style={dashStyles.container}>
            <div style={dashStyles.card}>
                <div style={dashStyles.cardLabel}>WALLET BALANCE</div>
                <div style={dashStyles.balance}>${user?.walletBalance || 0}.00</div>
                <button onClick={() => setView('learning')} style={styles.primaryBtn}>Verify New Skills</button>
            </div>
        </div>
    );
}

function AdminDashboardView({ onJobPost, onSkillPost }) {
    const [activeTab, setActiveTab] = useState('post-job');
    const [newJob, setNewJob] = useState({ title: '', reward: '', skill: '' });
    const [newSkill, setNewSkill] = useState({ title: '', tag: '', video: '' });

    return (
        <div style={dashStyles.container}>
            <div style={dashStyles.tabContainer}>
                <button onClick={() => setActiveTab('post-job')} style={activeTab === 'post-job' ? styles.activeAdminBtn : styles.adminBtn}>POST JOB</button>
                <button onClick={() => setActiveTab('post-skill')} style={activeTab === 'post-skill' ? styles.activeAdminBtn : styles.adminBtn}>POST SKILL</button>
            </div>
            {activeTab === 'post-job' ? (
                <div style={dashStyles.card}>
                    <input style={formStyles.input} placeholder="Job Title" onChange={e => setNewJob({...newJob, title: e.target.value})} />
                    <input style={formStyles.input} placeholder="Reward" onChange={e => setNewJob({...newJob, reward: e.target.value})} />
                    <input style={formStyles.input} placeholder="Skill Required" onChange={e => setNewJob({...newJob, skill: e.target.value})} />
                    <button style={styles.primaryBtn} onClick={() => { onJobPost(newJob); alert("Job Posted!"); }}>Post Job</button>
                </div>
            ) : (
                <div style={dashStyles.card}>
                    <input style={formStyles.input} placeholder="Skill Name" onChange={e => setNewSkill({...newSkill, title: e.target.value})} />
                    <input style={formStyles.input} placeholder="Video URL" onChange={e => setNewSkill({...newSkill, video: e.target.value})} />
                    <button style={styles.primaryBtn} onClick={() => { onSkillPost(newSkill); alert("Skill Posted!"); }}>Post Skill</button>
                </div>
            )}
        </div>
    );
}

// --- MISSING STYLE OBJECTS ---

const styles = {
    mainContent: { flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
    earningBar: { position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '20px', zIndex: 40, borderRadius: '0 0 16px 16px', cursor: 'pointer' },
    stat: { fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' },
    statSeparator: { width: '1px', height: '16px', background: '#334155' },
    primaryBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', cursor: 'pointer', width: '100%', fontWeight: 'bold' },
    adminBtn: { background: '#fff', padding: '10px', marginRight: '10px', cursor: 'pointer', border: '1px solid #ccc' },
    activeAdminBtn: { background: '#2563eb', color: '#fff', padding: '10px', marginRight: '10px', cursor: 'pointer', border: 'none' }
};

const dashStyles = {
    container: { padding: '20px 0' },
    card: { background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '20px' },
    cardLabel: { fontSize: '11px', color: '#94a3b8', fontWeight: '900' },
    balance: { fontSize: '42px', fontWeight: '900', color: '#10b981' },
    tabContainer: { marginBottom: '20px' }
};

const formStyles = {
    input: { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd' }
};