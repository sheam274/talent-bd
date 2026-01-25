import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Award, Zap, Target, ShieldCheck, Mail, MapPin, 
    Wallet, TrendingUp, Calendar, Share2, Hexagon,
    Layers, Plus, Trash2, Settings
} from 'lucide-react';

export default function Profile({ user }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState('');
    const isAdmin = user?.role === 'admin' || user?.email === 'admin@talentbd.com';

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        if (isAdmin) fetchCategories();
        return () => window.removeEventListener('resize', handleResize);
    }, [isAdmin]);

    // --- CATEGORY SYNC LOGIC (ADMIN ONLY) ---
    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data);
        } catch (err) { console.warn("Running in local profile mode."); }
    };

    const addCategory = async () => {
        if (!newCat) return;
        try {
            await axios.post('http://localhost:5000/api/admin/categories', { name: newCat, group: 'global' });
            setNewCat('');
            fetchCategories();
        } catch (err) { alert("Sync failed."); }
    };

    const deleteCategory = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/admin/categories/${id}`);
            fetchCategories();
        } catch (err) { console.error(err); }
    };

    // XP & Progress Calculation
    const currentPoints = user?.points || 0;
    const currentLevel = Math.floor(currentPoints / 1000) + 1;
    const pointsInCurrentLevel = currentPoints % 1000;
    const progressPercentage = (pointsInCurrentLevel / 1000) * 100;

    return (
        <div style={{...styles.container, padding: isMobile ? '20px 15px' : '40px 24px'}}>
            
            {/* 1. ADMIN CATEGORY ARCHITECT (Visible only to Admin) */}
            {isAdmin && (
                <div style={styles.adminSection}>
                    <div style={styles.adminHeader}>
                        <Settings size={16} color="#2563eb" /> 
                        <span style={styles.adminTitle}>Global Ecosystem Architect</span>
                    </div>
                    <div style={{...styles.adminControls, flexDirection: isMobile ? 'column' : 'row'}}>
                        <input 
                            style={styles.adminInput} 
                            placeholder="Add System-Wide Category (Jobs/Learning)..." 
                            value={newCat}
                            onChange={(e) => setNewCat(e.target.value)}
                        />
                        <button onClick={addCategory} style={styles.adminAddBtn}><Plus size={16}/> Create</button>
                    </div>
                    <div style={styles.catWrap}>
                        {categories.map(c => (
                            <div key={c._id} style={styles.catChip}>
                                {c.name}
                                <Trash2 size={12} style={styles.trash} onClick={() => deleteCategory(c._id)} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. MAIN HEADER CARD */}
            <div style={{
                ...styles.headerCard, 
                padding: isMobile ? '40px 20px' : '60px 40px',
                flexDirection: isMobile ? 'column' : 'row',
                textAlign: isMobile ? 'center' : 'left'
            }}>
                <div style={styles.avatarWrapper}>
                    <div style={{...styles.avatarCircle, margin: isMobile ? '0 auto' : '0'}}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div style={styles.levelBadge}>Lv. {currentLevel}</div>
                </div>
                
                <div style={{ flex: 1, marginTop: isMobile ? '25px' : '0', marginLeft: isMobile ? '0' : '40px' }}>
                    <div style={{display: 'flex', justifyContent: isMobile ? 'center' : 'space-between', alignItems: 'center', flexWrap:'wrap', gap:'10px'}}>
                        <h1 style={styles.userName}>{user?.name || 'Talent Member'}</h1>
                        <button style={styles.shareBtn}><Share2 size={14} /> Global ID</button>
                    </div>
                    
                    <div style={{...styles.userInfo, justifyContent: isMobile ? 'center' : 'flex-start'}}>
                        <span style={styles.infoTag}><Mail size={12} /> {user?.email}</span>
                        <span style={styles.infoTag}><MapPin size={12} /> {isAdmin ? 'Admin Console' : 'Remote BD'}</span>
                    </div>
                    
                    <div style={{...styles.xpSection, margin: isMobile ? '30px auto 0' : '30px 0 0'}}>
                        <div style={styles.xpLabels}>
                            <span>Tier Progress</span>
                            <span>{pointsInCurrentLevel} / 1000 XP</span>
                        </div>
                        <div style={styles.progressBarContainer}>
                            <div style={{...styles.progressBar, width: `${progressPercentage}%`}}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. INSIGHTS GRID */}
            <div style={{
                ...styles.statsGrid, 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)'
            }}>
                <div style={styles.statBox}>
                    <div style={{...styles.iconBg, background: '#eff6ff'}}><Target color="#2563eb" size={20} /></div>
                    <div style={styles.statVal}>84%</div>
                    <div style={styles.statLabel}>AI Match Rate</div>
                </div>
                <div style={styles.statBox}>
                    <div style={{...styles.iconBg, background: '#fff7ed'}}><Zap color="#eab308" size={20} /></div>
                    <div style={styles.statVal}>{user?.skills?.length || 0}</div>
                    <div style={styles.statLabel}>Skill Badges</div>
                </div>
                <div style={styles.statBox}>
                    <div style={{...styles.iconBg, background: '#f0fdf4'}}><Wallet color="#16a34a" size={20} /></div>
                    <div style={styles.statVal}>${user?.wallet || '0.00'}</div>
                    <div style={styles.statLabel}>Wallet Balance</div>
                </div>
            </div>

            {/* 4. VERIFIED CREDENTIALS */}
            <div style={{...styles.badgeSection, padding: isMobile ? '30px 20px' : '45px'}}>
                <div style={{...styles.sectionHeader, flexDirection: isMobile ? 'column' : 'row', gap: '15px'}}>
                    <h3 style={styles.sectionTitle}>
                        <Award size={24} color="#2563eb" /> Verified Credentials
                    </h3>
                    <div style={styles.badgeCount}>{user?.skills?.length || 0} Professional Assets</div>
                </div>

                <div style={{
                    ...styles.badgeGrid,
                    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(200px, 1fr))'
                }}>
                    {user?.skills && user.skills.length > 0 ? (
                        user.skills.map((skill, i) => (
                            <div key={i} style={styles.badgeCard}>
                                <div style={styles.badgeIcon}>
                                    <Hexagon size={44} color="#2563eb" fill="#eff6ff" />
                                    <ShieldCheck size={20} color="#16a34a" style={styles.innerShield} />
                                </div>
                                <div style={styles.badgeName}>{skill}</div>
                                <div style={styles.badgeMeta}>Verified 2026</div>
                            </div>
                        ))
                    ) : (
                        <div style={styles.noSkills}>
                            <TrendingUp size={40} color="#cbd5e1" />
                            <p>No verified badges yet. Explore the Learning Hub to start earning.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: '1100px', margin: '0 auto' },
    adminSection: { background: '#f8fafc', padding: '24px', borderRadius: '28px', marginBottom: '40px', border: '1px dashed #cbd5e1' },
    adminHeader: { display:'flex', alignItems:'center', gap:'8px', marginBottom:'15px' },
    adminTitle: { fontSize:'12px', fontWeight:'900', textTransform:'uppercase', color:'#475569' },
    adminControls: { display:'flex', gap:'10px', marginBottom:'15px' },
    adminInput: { flex:1, padding:'14px', borderRadius:'12px', border:'1px solid #e2e8f0', outline:'none', fontSize:'14px' },
    adminAddBtn: { background:'#0f172a', color:'#fff', border:'none', padding:'0 20px', borderRadius:'12px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px' },
    catWrap: { display:'flex', flexWrap:'wrap', gap:'8px' },
    catChip: { background:'#fff', padding:'6px 14px', borderRadius:'10px', fontSize:'12px', fontWeight:'700', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'8px' },
    trash: { color:'#ef4444', cursor:'pointer' },
    headerCard: { background: '#0f172a', borderRadius: '36px', color: '#fff', display: 'flex', alignItems: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' },
    avatarWrapper: { position: 'relative' },
    avatarCircle: { width: '130px', height: '130px', background: '#2563eb', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '52px', fontWeight: '900', border: '6px solid rgba(255,255,255,0.1)' },
    levelBadge: { position: 'absolute', bottom: '-8px', right: '-8px', background: '#eab308', color: '#000', padding: '6px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '900', border: '4px solid #0f172a' },
    userName: { fontSize: '40px', margin: 0, fontWeight: '900', letterSpacing: '-1.5px' },
    userInfo: { display: 'flex', gap: '12px', marginTop: '18px', color: '#94a3b8', flexWrap: 'wrap' },
    infoTag: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)', padding: '6px 16px', borderRadius: '50px', fontSize: '13px', fontWeight: '600' },
    xpSection: { width: '100%', maxWidth: '450px' },
    xpLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
    progressBarContainer: { height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden' },
    progressBar: { height: '100%', background: 'linear-gradient(90deg, #2563eb, #3b82f6)', borderRadius: '20px' },
    shareBtn: { background: '#2563eb', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '800' },
    statsGrid: { display: 'grid', gap: '20px', margin: '35px 0' },
    statBox: { background: '#fff', padding: '30px', borderRadius: '32px', textAlign: 'center', border: '1px solid #e2e8f0' },
    iconBg: { width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' },
    statVal: { fontSize: '32px', fontWeight: '900', color: '#0f172a' },
    statLabel: { fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginTop: '5px' },
    badgeSection: { background: '#fff', borderRadius: '36px', border: '1px solid #e2e8f0' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    sectionTitle: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '26px', fontWeight: '900', margin: 0 },
    badgeCount: { fontSize: '12px', fontWeight: '900', color: '#2563eb', background: '#eff6ff', padding: '10px 20px', borderRadius: '50px' },
    badgeGrid: { display: 'grid', gap: '25px' },
    badgeCard: { background: '#f8fafc', padding: '35px 20px', borderRadius: '30px', textAlign: 'center', border: '1px solid #f1f5f9' },
    badgeIcon: { position: 'relative', display: 'inline-block', marginBottom: '20px' },
    innerShield: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    badgeName: { fontSize: '18px', fontWeight: '800', color: '#1e293b' },
    badgeMeta: { fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginTop: '5px' },
    noSkills: { color: '#94a3b8', textAlign: 'center', gridColumn: '1 / -1', padding: '80px 0' }
};