import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    User, FileText, Bookmark, Calendar, CheckCircle, AlertCircle, 
    Camera, LogOut, ExternalLink, LayoutDashboard, Settings, 
    Layers, Plus, Trash2, ShieldCheck 
} from 'lucide-react';

export default function UserProfile({ user, setUser, setView }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState('');
    const isAdmin = user?.role === 'admin' || user?.email === 'admin@talentbd.com';

    // Sync window size for responsive layout adjustments
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        if (isAdmin) fetchCategories();
        return () => window.removeEventListener('resize', handleResize);
    }, [isAdmin]);

    // --- ADMIN CATEGORY MANAGEMENT ---
    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data);
        } catch (err) { console.warn("Syncing with local instance..."); }
    };

    const addCategory = async () => {
        if (!newCat) return;
        try {
            await axios.post('http://localhost:5000/api/admin/categories', { name: newCat, group: 'global' });
            setNewCat('');
            fetchCategories();
        } catch (err) { alert("Admin sync error"); }
    };

    const deleteCategory = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/admin/categories/${id}`);
            fetchCategories();
        } catch (err) { console.error(err); }
    };

    // Session Wall
    if (!user) return (
        <div style={styles.loginWall}>
            <div style={styles.alertCircle}><AlertCircle size={40} color="#ef4444" /></div>
            <h2 style={{fontSize: isMobile ? '20px' : '24px', fontWeight: '900'}}>Session Expired</h2>
            <p style={{color: '#64748b'}}>Please login to access your dashboard.</p>
            <button onClick={() => setView('login')} style={styles.actionBtn}>Return to Login</button>
        </div>
    );

    const handleLogout = () => {
        localStorage.removeItem('talentbd_v1');
        setUser(null);
        setView('login');
    };

    const cv = user.savedCV;
    const isCVComplete = !!(cv?.name && cv?.email);

    return (
        <div style={{...styles.container, padding: isMobile ? '20px 15px' : '40px 25px'}}>
            
            {/* 1. ADMIN INFRASTRUCTURE PANEL (Visible only to Admin) */}
            {isAdmin && (
                <div style={styles.adminSection}>
                    <div style={styles.adminHeader}>
                        <div style={styles.adminIcon}><Settings size={16} color="#fff" /></div>
                        <h3 style={styles.adminTitle}>Global Ecosystem Architect</h3>
                    </div>
                    <div style={{...styles.adminControls, flexDirection: isMobile ? 'column' : 'row'}}>
                        <input 
                            style={styles.adminInput} 
                            placeholder="Add New Job/Learning Category..." 
                            value={newCat}
                            onChange={(e) => setNewCat(e.target.value)}
                        />
                        <button onClick={addCategory} style={styles.adminAddBtn}><Plus size={16}/> Sync Category</button>
                    </div>
                    <div style={styles.catWrap}>
                        {categories.map(c => (
                            <div key={c._id} style={styles.catChip}>
                                <Layers size={12} color="#2563eb" />
                                <span>{c.name}</span>
                                <Trash2 size={12} style={styles.trash} onClick={() => deleteCategory(c._id)} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. DASHBOARD HEADER */}
            <header style={{...styles.header, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center'}}>
                <div>
                    <div style={styles.topBadge}><LayoutDashboard size={12} /> PORTAL 2026</div>
                    <h1 style={{...styles.title, fontSize: isMobile ? '26px' : '32px'}}>Career Dashboard</h1>
                    <p style={styles.subtitle}>Welcome, {user.name.split(' ')[0]}! Track your professional growth.</p>
                </div>
                <button onClick={handleLogout} style={{...styles.logoutBtn, width: isMobile ? '100%' : 'auto'}}>
                    <LogOut size={16} /> Logout
                </button>
            </header>

            {/* 3. RESPONSIVE GRID */}
            <div style={{...styles.dashboardGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(380px, 1fr))'}}>
                
                {/* CV STATUS CARD */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}><ShieldCheck size={18} color="#2563eb" /></div>
                        <h3 style={styles.cardTitle}>Professional Identity</h3>
                    </div>

                    <div style={styles.profileSection}>
                        <div style={styles.imageContainer}>
                            {cv?.profileImage ? (
                                <img src={cv.profileImage} alt="User" style={styles.profileImg} />
                            ) : (
                                <div style={styles.avatarPlaceholder}><User size={32} color="#cbd5e1" /></div>
                            )}
                            <button onClick={() => setView('cv-builder')} style={styles.editThumbBtn}><Camera size={14} /></button>
                        </div>
                        <div style={{flex: 1}}>
                            <h3 style={{margin: 0, fontSize: '18px', fontWeight: '800'}}>{user.name}</h3>
                            <div style={styles.memberSince}><Calendar size={12} /> Established 2026</div>
                        </div>
                    </div>
                    
                    <div style={{...styles.cvStatusBox, borderLeft: isCVComplete ? '5px solid #10b981' : '5px solid #f59e0b'}}>
                        <div style={styles.statusRow}>
                            <span style={{fontWeight: '800', fontSize: '12px', color: '#64748b', textTransform:'uppercase'}}>Identity Score</span>
                            <span style={{color: isCVComplete ? '#10b981' : '#f59e0b', fontWeight: '900', fontSize: '12px'}}>
                                {isCVComplete ? 'VERIFIED' : 'PENDING'}
                            </span>
                        </div>
                        <div style={styles.progressTrack}>
                            <div style={{...styles.progressBar, width: isCVComplete ? '100%' : '40%', background: isCVComplete ? '#10b981' : '#f59e0b'}} />
                        </div>
                        <button onClick={() => setView('cv-builder')} style={{...styles.actionBtn, background: isCVComplete ? '#0f172a' : '#2563eb'}}>
                            {isCVComplete ? 'Update Digital CV' : 'Verify My Identity'}
                        </button>
                    </div>
                </div>

                {/* SAVED JOBS CARD */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={{...styles.iconBox, background: '#fff7ed'}}><Bookmark size={18} color="#f59e0b" /></div>
                        <h3 style={styles.cardTitle}>Watchlist Gigs</h3>
                    </div>
                    
                    <div style={styles.bookmarksList}>
                        {user.bookmarks && user.bookmarks.length > 0 ? (
                            user.bookmarks.map(j => (
                                <div key={j._id} style={{...styles.itemStyle, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '0'}}>
                                    <div style={styles.jobInfo}>
                                        <div style={{...styles.jobDot, background: j.status === 'active' ? '#10b981' : '#2563eb'}} />
                                        <div>
                                            <div style={styles.jobTitleText}>{j.title}</div>
                                            <div style={{fontSize: '11px', color: '#94a3b8'}}>{j.skill} • ${j.reward}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => setView('jobs')} style={{...styles.viewBtn, width: isMobile ? '100%' : 'auto'}}>
                                        Apply <ExternalLink size={12} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div style={styles.emptyState}>
                                <Bookmark size={32} color="#e2e8f0" style={{marginBottom:'15px'}} />
                                <p style={{color: '#94a3b8', fontSize: '14px', margin:'0 0 15px'}}>No saved opportunities yet.</p>
                                <button onClick={() => setView('jobs')} style={styles.exploreLink}>Browse Gigs</button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: '1150px', margin: '0 auto', minHeight: '80vh' },
    adminSection: { background: '#f8fafc', padding: '25px', borderRadius: '28px', marginBottom: '40px', border: '1px dashed #cbd5e1' },
    adminHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
    adminIcon: { background: '#2563eb', padding: '6px', borderRadius: '8px', display: 'flex' },
    adminTitle: { margin: 0, fontSize: '14px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' },
    adminControls: { display: 'flex', gap: '12px', marginBottom: '20px' },
    adminInput: { flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' },
    adminAddBtn: { background: '#0f172a', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', height: '48px' },
    catWrap: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
    catChip: { background: '#fff', padding: '8px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '700' },
    trash: { color: '#ef4444', cursor: 'pointer', marginLeft: '5px' },
    
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '40px', gap: '20px' },
    topBadge: { display: 'flex', alignItems: 'center', gap: '5px', color: '#2563eb', fontSize: '10px', fontWeight: '900', marginBottom: '8px', letterSpacing: '1px' },
    title: { fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1.5px' },
    subtitle: { color: '#64748b', fontSize: '15px', marginTop: '6px' },
    logoutBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: '13px' },
    dashboardGrid: { display: 'grid', gap: '30px' },
    card: { background: '#fff', padding: '30px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' },
    iconBox: { width: '42px', height: '42px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    cardTitle: { margin: 0, fontSize: '12px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px' },
    profileSection: { display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' },
    imageContainer: { position: 'relative' },
    profileImg: { width: '85px', height: '85px', borderRadius: '24px', objectFit: 'cover' },
    avatarPlaceholder: { width: '85px', height: '85px', borderRadius: '24px', background: '#f8fafc', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    editThumbBtn: { position: 'absolute', bottom: '-4px', right: '-4px', background: '#2563eb', color: '#fff', border: '3px solid #fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    memberSince: { fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontWeight: '700' },
    cvStatusBox: { background: '#f8fafc', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9' },
    statusRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
    progressTrack: { height: '10px', background: '#e2e8f0', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' },
    progressBar: { height: '100%', transition: 'width 1s ease' },
    actionBtn: { width: '100%', padding: '16px', borderRadius: '16px', border: 'none', color: '#fff', fontWeight: '900', cursor: 'pointer' },
    bookmarksList: { display: 'flex', flexDirection: 'column' },
    itemStyle: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', padding: '15px 0' },
    jobInfo: { display: 'flex', alignItems: 'center', gap: '15px' },
    jobDot: { width: '10px', height: '10px', borderRadius: '4px' },
    jobTitleText: { fontSize: '15px', fontWeight: '800', color: '#1e293b' },
    viewBtn: { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '12px 18px', borderRadius: '14px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' },
    emptyState: { textAlign: 'center', padding: '40px 20px', background: '#fcfdfe', borderRadius: '24px', border: '2px dashed #e2e8f0' },
    exploreLink: { background: '#2563eb', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    loginWall: { textAlign: 'center', padding: '120px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    alertCircle: { width: '80px', height: '80px', background: '#fef2f2', borderRadius: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }
};