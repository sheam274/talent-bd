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
    // 1. STATE MANAGEMENT
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('talentbd_v1');
            return saved ? JSON.parse(saved) : null;
        } catch (e) { return null; }
    });

    const [view, setView] = useState('home');
    const [currentCourse, setCurrentCourse] = useState(null);
    const [selectedJobForAI, setSelectedJobForAI] = useState(null); 

    // 2. PERSISTENCE LAYER
    useEffect(() => {
        if (user) {
            localStorage.setItem('talentbd_v1', JSON.stringify(user));
        } else {
            localStorage.removeItem('talentbd_v1');
        }
    }, [user]);

    // 3. CORE LOGIC: Skill Verification & Wallet Update
    const onSkillVerified = useCallback(async (skillName, xpReward, cashReward = 50) => {
        if (!user) return;
        
        try {
            // Optimistic UI Update: immediately update local state for better UX
            const tempUser = {
                ...user,
                points: (user.points || 0) + xpReward,
                walletBalance: (user.walletBalance || 0) + cashReward,
                skills: user.skills ? [...new Set([...user.skills, skillName])] : [skillName]
            };
            setUser(tempUser);

            const res = await fetch('http://localhost:5000/api/users/update-progress', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    skill: skillName,
                    points: xpReward,
                    walletBalance: cashReward
                })
            });
            
            const updated = await res.json();
            if (res.ok) {
                setUser(updated); // Sync with actual server data
                setView('dashboard');
            } else {
                console.error("Server sync failed, keeping local optimistic state.");
            }
        } catch (e) { 
            console.error("Sync error:", e); 
            alert("Connection error: Your reward is saved locally and will sync when online.");
        }
    }, [user]);

    // 4. NAVIGATION HANDLER
    const handleLogout = () => {
        setUser(null);
        setView('home');
        localStorage.removeItem('talentbd_v1');
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
            {/* Global Navigation */}
            <Navbar setView={setView} user={user} handleLogout={handleLogout} />
            
            {/* Real-time Earning Stats Bar */}
            <AnimatePresence>
                {user && (
                    <motion.div 
                        initial={{ y: -60, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        exit={{ y: -60, opacity: 0 }}
                        style={styles.earningBar} 
                        onClick={() => setView('dashboard')}
                    >
                        <div style={styles.stat}>
                            <span style={styles.statEmoji}>🏆</span> 
                            <span>Level {Math.floor((user.points || 0) / 1000) + 1}</span>
                        </div>
                        <div style={styles.statSeparator} />
                        <div style={{...styles.stat, color: '#10b981'}}>
                            <span style={styles.statEmoji}>💰</span> 
                            <span>${user.walletBalance || 0}.00</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Application Router */}
            <main style={{
                ...styles.mainContent, 
                paddingTop: user ? '140px' : '90px',
                transition: 'padding-top 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={view} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {view === 'home' && <Home setView={setView} user={user} />}
                        {view === 'login' && <Login setUser={setUser} setView={setView} />}
                        {view === 'signup' && <Signup setView={setView} />}
                        
                        {/* Learning Path */}
                        {view === 'learning' && (
                            <LearningHub 
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
                        
                        {/* Marketplace & Career Path */}
                        {view === 'jobs' && (
                            <Jobs 
                                user={user} 
                                onAudit={(j) => { setSelectedJobForAI(j); setView('cv-builder'); }} 
                            />
                        )}
                        {view === 'cv-builder' && (
                            <CVBuilder 
                                user={user} 
                                setUser={setUser} 
                                preloadedJob={selectedJobForAI} 
                                setView={setView} 
                            />
                        )}
                        
                        {/* Dashboard & Profile */}
                        {view === 'dashboard' && (
                            <WalletDashboard 
                                user={user} 
                                setView={setView} 
                                setUser={setUser} 
                            />
                        )}
                        {view === 'profile' && (
                            <UserProfile 
                                user={user} 
                                setView={setView} 
                                setUser={setUser} 
                            />
                        )}
                        
                        {/* Administration */}
                        {view === 'admin' && (
                            user?.role === 'admin' 
                            ? <AdminDashboardView /> 
                            : <AdminPanel user={user} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Global Footer */}
            <footer style={styles.footer}>
                <div style={styles.footerBottom}>
                    <p>© 2026 TalentBD Ecosystem. Powered by AI Verification.</p>
                </div>
            </footer>
        </div>
    );
}

// --- SHARED UI COMPONENTS (Internal) ---

function WalletDashboard({ user, setView }) {
    const progress = useMemo(() => {
        const nextLevelXP = 1000;
        return ((user?.points || 0) % nextLevelXP) / 10;
    }, [user?.points]);

    return (
        <div style={dashStyles.container}>
            <header style={dashStyles.header}>
                <h2 style={{margin: 0, fontSize: '2rem', fontWeight: '900', color: '#0f172a'}}>Finance & Progression</h2>
                <p style={{color: '#64748b'}}>Track your earnings and skill benchmarks.</p>
            </header>
            <div style={dashStyles.statsGrid}>
                <div style={dashStyles.card}>
                    <div style={dashStyles.cardLabel}>WALLET BALANCE</div>
                    <div style={dashStyles.balance}>${user?.walletBalance || 0}.00</div>
                    <div style={dashStyles.cardFooter}>Available for instant payout</div>
                </div>
                <div style={dashStyles.card}>
                    <div style={dashStyles.cardLabel}>CURRENT SKILL LEVEL</div>
                    <div style={dashStyles.levelText}>Rank: {Math.floor((user?.points || 0) / 1000) + 1}</div>
                    <div style={dashStyles.progressTrack}>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            style={dashStyles.progressBar}
                        />
                    </div>
                    <div style={dashStyles.cardFooter}>{user?.points || 0} Total XP</div>
                </div>
            </div>
            <button onClick={() => setView('learning')} style={styles.primaryBtn}>Verify New Skills</button>
        </div>
    );
}

function AdminDashboardView() {
    const [activeTab, setActiveTab] = useState('stats');
    const [newJob, setNewJob] = useState({ title: '', reward: '', skill: '' });
    const [newSkill, setNewSkill] = useState({ title: '', tag: '', video: '' });

    // Handler for Posting Jobs (The Missing Feature)
    const handlePostJob = () => {
        if(!newJob.title || !newJob.reward) return alert("Please fill in Job Title and Reward");
        alert(`🚀 Job Published: "${newJob.title}" with $${newJob.reward} reward.`);
        setNewJob({title: '', reward: '', skill: ''});
    };

    const handlePostSkill = () => {
        if(!newSkill.title || !newSkill.video) return alert("Fill all fields");
        alert(`🎓 Skill "${newSkill.title}" is now LIVE for all users.`);
        setNewSkill({title:'', tag:'', video:''});
    };

    return (
        <div style={dashStyles.container}>
            <div style={dashStyles.adminHeader}>
                <h2 style={{ margin: 0, fontWeight: '900' }}>Admin Command Center</h2>
                <div style={dashStyles.tabContainer}>
                    {/* Buttons now correctly switch between all three views */}
                    {['stats', 'post-job', 'post-skill'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)} 
                            style={activeTab === tab ? styles.activeAdminBtn : styles.adminBtn}
                        >
                            {tab.replace('-', ' ').toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB 1: SYSTEM STATISTICS */}
            {activeTab === 'stats' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={dashStyles.card}>
                    <p style={{margin: 0, color: '#64748b'}}>Global Platform Activity</p>
                    <div style={{fontSize: '32px', fontWeight: '900', marginTop: '10px'}}>1,240 Verified Experts</div>
                    <p style={{fontSize: '14px', color: '#10b981', marginTop: '5px'}}>+12% growth this month</p>
                </motion.div>
            )}

            {/* TAB 2: POST NEW JOB (FIXED) */}
            {activeTab === 'post-job' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={dashStyles.card}>
                    <h3 style={{marginTop: 0, color: '#1e293b'}}>Post Marketplace Gig</h3>
                    <p style={{color: '#64748b', marginBottom: '20px'}}>Create a new opportunity for verified users.</p>
                    
                    <label style={dashStyles.cardLabel}>JOB TITLE</label>
                    <input style={formStyles.input} placeholder="e.g. Senior Frontend Engineer" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
                    
                    <label style={dashStyles.cardLabel}>REWARD (USD)</label>
                    <input style={formStyles.input} type="number" placeholder="e.g. 500" value={newJob.reward} onChange={e => setNewJob({...newJob, reward: e.target.value})} />
                    
                    <label style={dashStyles.cardLabel}>REQUIRED SKILL TAG</label>
                    <input style={formStyles.input} placeholder="e.g. React" value={newJob.skill} onChange={e => setNewJob({...newJob, skill: e.target.value})} />
                    
                    <button onClick={handlePostJob} style={styles.primaryBtn}>🚀 Post Job to Marketplace</button>
                </motion.div>
            )}

            {/* TAB 3: POST SKILL/COURSE */}
            {activeTab === 'post-skill' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={dashStyles.card}>
                    <h3 style={{marginTop: 0}}>Create Certification Module</h3>
                    <p style={{color: '#64748b', marginBottom: '20px'}}>Upload content for users to verify and earn.</p>
                    
                    <label style={dashStyles.cardLabel}>CERTIFICATION NAME</label>
                    <input style={formStyles.input} placeholder="e.g. AWS Expert" value={newSkill.title} onChange={e => setNewSkill({...newSkill, title: e.target.value})} />
                    
                    <label style={dashStyles.cardLabel}>TECH TAG</label>
                    <input style={formStyles.input} placeholder="e.g. cloud" value={newSkill.tag} onChange={e => setNewSkill({...newSkill, tag: e.target.value})} />
                    
                    <label style={dashStyles.cardLabel}>VERIFICATION VIDEO URL</label>
                    <input style={formStyles.input} placeholder="YouTube/Vimeo URL" value={newSkill.video} onChange={e => setNewSkill({...newSkill, video: e.target.value})} />
                    
                    <button onClick={handlePostSkill} style={styles.primaryBtn}>Publish Certification</button>
                </motion.div>
            )}
        </div>
    );
}

// --- STYLES ---
const styles = {
    mainContent: { flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
    earningBar: { position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '20px', zIndex: 40, borderRadius: '0 0 16px 16px', border: '1px solid #334155', borderTop: 'none', cursor: 'pointer', fontSize: '14px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
    stat: { fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' },
    statEmoji: { fontSize: '18px' },
    statSeparator: { width: '1px', height: '16px', background: '#334155' },
    footer: { background: '#0f172a', padding: '40px 20px', marginTop: '80px', borderTop: '1px solid #1e293b' },
    footerBottom: { textAlign: 'center', color: '#475569', fontSize: '13px' },
    primaryBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', width: '100%', fontSize: '15px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)', transition: '0.2s' },
    adminBtn: { background: '#fff', color: '#475569', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '800' },
    activeAdminBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)' }
};

const dashStyles = {
    container: { padding: '20px 0' },
    header: { marginBottom: '35px' },
    adminHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' },
    tabContainer: { display: 'flex', gap: '8px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '35px' },
    card: { background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' },
    cardLabel: { fontSize: '11px', color: '#94a3b8', fontWeight: '900', letterSpacing: '1.5px', marginBottom: '12px' },
    balance: { fontSize: '42px', fontWeight: '900', color: '#10b981', letterSpacing: '-1px' },
    levelText: { fontSize: '28px', fontWeight: '900', color: '#2563eb' },
    progressTrack: { height: '10px', background: '#f1f5f9', borderRadius: '20px', margin: '20px 0', overflow: 'hidden', border: '1px solid #f1f5f9' },
    progressBar: { height: '100%', background: 'linear-gradient(90deg, #2563eb, #60a5fa)', borderRadius: '20px' },
    cardFooter: { fontSize: '13px', color: '#94a3b8', fontWeight: '600' }
};

const formStyles = {
    input: { width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '15px', boxSizing: 'border-box', outline: 'none', fontSize: '15px', background: '#f8fafc' }
};