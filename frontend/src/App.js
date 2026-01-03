import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Component Imports
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import CVBuilder from './pages/CVBuilder'; // The fixed CV Architect
import Login from './pages/Login';
import Signup from './pages/Signup'; 
import UserProfile from './pages/UserProfile';
import LearningHub from './pages/LearningHub';
import VideoPlayer from './pages/VideoPlayer';

export default function App() {
    // 1. INITIAL STATES
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('talentbd_v1');
        return saved ? JSON.parse(saved) : null;
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

    // 2. PERSISTENCE LAYER
    useEffect(() => {
        if (user) localStorage.setItem('talentbd_v1', JSON.stringify(user));
        else localStorage.removeItem('talentbd_v1');
    }, [user]);

    useEffect(() => {
        localStorage.setItem('talentbd_jobs', JSON.stringify(allJobs));
        localStorage.setItem('talentbd_courses', JSON.stringify(allCourses));
    }, [allJobs, allCourses]);

    // 3. ACTION HANDLERS
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
        alert(`Verified: ${skillName}! +${cashReward} added to wallet.`);
    }, [user]);

    const handleLogout = () => {
        setUser(null);
        setView('home');
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar setView={setView} user={user} handleLogout={handleLogout} />
            
            {/* Earning Status Bar */}
            <AnimatePresence>
                {user && view !== 'cv-builder' && (
                    <motion.div 
                        initial={{ y: -60, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        exit={{ y: -60, opacity: 0 }} 
                        style={styles.earningBar} 
                        onClick={() => setView('dashboard')}
                    >
                        <div style={styles.stat}>🏆 Level {Math.floor((user.points || 0) / 1000) + 1}</div>
                        <div style={styles.statSeparator} />
                        <div style={{...styles.stat, color: '#10b981'}}>💰 ${user.walletBalance || 0}.00</div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main style={{...styles.mainContent, paddingTop: user && view !== 'cv-builder' ? '140px' : '80px'}}>
                <AnimatePresence mode="wait">
                    <motion.div key={view} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                        
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

                        {view === 'dashboard' && <WalletDashboard user={user} setView={setView} />}
                        
                        {view === 'admin' && (
                            <AdminDashboardView 
                                user={user}
                                onJobPost={handleAddJob} 
                                onSkillPost={handleAddCourse} 
                            />
                        )}

                        {view === 'profile' && <UserProfile user={user} setUser={setUser} />}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function WalletDashboard({ user, setView }) {
    return (
        <div style={dashStyles.container}>
            <div style={dashStyles.card}>
                <div style={dashStyles.cardLabel}>TALENT WALLET</div>
                <div style={dashStyles.balance}>${user?.walletBalance || 0}.00</div>
                <div style={{marginTop: '10px', color: '#64748b', fontSize: '14px', fontWeight:'600'}}>
                    Rank: {user?.points || 0} XP
                </div>
                <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                    <button onClick={() => setView('learning')} style={{...styles.primaryBtn, flex:1}}>Earn More</button>
                    <button onClick={() => alert("Withdrawal opens at $100")} style={{...styles.primaryBtn, background:'#f1f5f9', color:'#1e293b', flex:1}}>Withdraw</button>
                </div>
            </div>
        </div>
    );
}

function AdminDashboardView({ user, onJobPost, onSkillPost }) {
    const [activeTab, setActiveTab] = useState('post-job');
    const [newJob, setNewJob] = useState({ title: '', reward: '', skill: '', type: 'Gig' });
    const [newSkill, setNewSkill] = useState({ title: '', tag: '', video: '' });

    if (user?.role !== 'admin') {
        return <div style={{textAlign:'center', padding:'50px'}}>Access Denied. Admin Only.</div>;
    }

    return (
        <div style={dashStyles.container}>
            <h2 style={{marginBottom:'20px'}}>Admin Control Center</h2>
            <div style={dashStyles.tabContainer}>
                <button onClick={() => setActiveTab('post-job')} style={activeTab === 'post-job' ? styles.activeAdminBtn : styles.adminBtn}>MARKETPLACE</button>
                <button onClick={() => setActiveTab('post-skill')} style={activeTab === 'post-skill' ? styles.activeAdminBtn : styles.adminBtn}>LEARNING HUB</button>
            </div>

            {activeTab === 'post-job' ? (
                <div style={dashStyles.card}>
                    <h3>Post New Job</h3>
                    <input style={formStyles.input} placeholder="Job Title" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
                    <input style={formStyles.input} placeholder="Reward ($)" value={newJob.reward} onChange={e => setNewJob({...newJob, reward: e.target.value})} />
                    <input style={formStyles.input} placeholder="Skill Required" value={newJob.skill} onChange={e => setNewJob({...newJob, skill: e.target.value})} />
                    <button style={styles.primaryBtn} onClick={() => {onJobPost(newJob); alert("Job Live!");}}>Publish Gig</button>
                </div>
            ) : (
                <div style={dashStyles.card}>
                    <h3>Add Skill Module</h3>
                    <input style={formStyles.input} placeholder="Module Title" value={newSkill.title} onChange={e => setNewSkill({...newSkill, title: e.target.value})} />
                    <input style={formStyles.input} placeholder="Target Skill" value={newSkill.tag} onChange={e => setNewSkill({...newSkill, tag: e.target.value})} />
                    <input style={formStyles.input} placeholder="YouTube URL" value={newSkill.video} onChange={e => setNewSkill({...newSkill, video: e.target.value})} />
                    <button style={styles.primaryBtn} onClick={() => {onSkillPost(newSkill); alert("Module Live!");}}>Publish Skill</button>
                </div>
            )}
        </div>
    );
}

// --- STYLES (Synchronized with 2026 UI) ---

const styles = {
    mainContent: { flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px', transition: 'padding 0.3s ease' },
    earningBar: { position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '20px', zIndex: 40, borderRadius: '0 0 16px 16px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
    stat: { fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', fontSize:'14px' },
    statSeparator: { width: '1px', height: '16px', background: '#334155' },
    primaryBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s' },
    adminBtn: { background: '#fff', padding: '12px 24px', marginRight: '10px', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', color: '#64748b' },
    activeAdminBtn: { background: '#2563eb', color: '#fff', padding: '12px 24px', marginRight: '10px', cursor: 'pointer', border: 'none', borderRadius: '8px', fontWeight: '600' }
};

const dashStyles = {
    container: { padding: '20px 0', maxWidth: '600px', margin: '0 auto' },
    card: { background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    cardLabel: { fontSize: '11px', color: '#94a3b8', fontWeight: '900', letterSpacing: '1.5px', marginBottom:'10px' },
    balance: { fontSize: '48px', fontWeight: '900', color: '#10b981', letterSpacing:'-1px' },
    tabContainer: { marginBottom: '25px', display: 'flex', background:'#f1f5f9', padding:'5px', borderRadius:'12px' }
};

const formStyles = {
    input: { width: '100%', padding: '14px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', background:'#f8fafc' }
};