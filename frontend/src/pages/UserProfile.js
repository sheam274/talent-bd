import React from 'react';
import { User, FileText, Bookmark, Calendar, ArrowRight, CheckCircle, AlertCircle, Camera, LogOut, ExternalLink } from 'lucide-react';

export default function UserProfile({ user, setUser, setView }) {
    // FIXED: Handle session expiration gracefully
    if (!user) return (
        <div style={styles.loginWall}>
            <div style={styles.alertCircle}><AlertCircle size={40} color="#ef4444" /></div>
            <h2 style={{fontSize: '24px', fontWeight: '900'}}>Session Expired</h2>
            <p style={{color: '#64748b'}}>Please login to access your professional dashboard.</p>
            <button onClick={() => setView('login')} style={styles.actionBtn}>Login to TalentBD</button>
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
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>Career Dashboard</h1>
                    <p style={styles.subtitle}>Welcome back, {user.name.split(' ')[0]}! Track your professional growth.</p>
                </div>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                    <LogOut size={16} /> Logout
                </button>
            </header>

            <div style={styles.dashboardGrid}>
                
                {/* CV STATUS CARD */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}><FileText size={18} color="#2563eb" /></div>
                        <h3 style={styles.cardTitle}>Professional Identity</h3>
                    </div>

                    <div style={styles.profileSection}>
                        <div style={styles.imageContainer}>
                            {cv?.profileImage ? (
                                <img src={cv.profileImage} alt="User" style={styles.profileImg} />
                            ) : (
                                <div style={styles.avatarPlaceholder}><User size={32} color="#cbd5e1" /></div>
                            )}
                            <button onClick={() => setView('cv-builder')} style={styles.editThumbBtn}>
                                <Camera size={14} />
                            </button>
                        </div>
                        <div>
                            <h3 style={{margin: 0, fontSize: '18px', fontWeight: '800'}}>{user.name}</h3>
                            <div style={styles.memberSince}>
                                <Calendar size={12} /> Member since 2026
                            </div>
                        </div>
                    </div>
                    
                    <div style={{...styles.cvStatusBox, borderLeft: isCVComplete ? '4px solid #10b981' : '4px solid #f59e0b'}}>
                        <div style={styles.statusRow}>
                            <span style={{fontWeight: '700', fontSize: '13px', color: '#64748b'}}>CV Readiness</span>
                            <span style={{color: isCVComplete ? '#10b981' : '#f59e0b', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase'}}>
                                {isCVComplete ? 'Verified' : 'Incomplete'}
                            </span>
                        </div>
                        <div style={styles.progressTrack}>
                            <div style={{
                                ...styles.progressBar, 
                                width: isCVComplete ? '100%' : '40%',
                                background: isCVComplete ? '#10b981' : '#f59e0b'
                            }} />
                        </div>
                        <button onClick={() => setView('cv-builder')} style={{
                            ...styles.actionBtn,
                            background: isCVComplete ? '#0f172a' : '#2563eb'
                        }}>
                            {isCVComplete ? 'Edit Digital Identity' : 'Complete Your CV'}
                        </button>
                    </div>
                </div>

                {/* SAVED JOBS CARD */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={{...styles.iconBox, background: '#fff7ed'}}><Bookmark size={18} color="#f59e0b" /></div>
                        <h3 style={styles.cardTitle}>Saved Gigs</h3>
                    </div>
                    
                    <div style={styles.bookmarksList}>
                        {user.bookmarks && user.bookmarks.length > 0 ? (
                            user.bookmarks.map(j => (
                                <div key={j._id} style={styles.itemStyle}>
                                    <div style={styles.jobInfo}>
                                        <div style={styles.jobDot} />
                                        <div>
                                            <div style={styles.jobTitleText}>{j.title}</div>
                                            <div style={{fontSize: '11px', color: '#94a3b8'}}>{j.skill} • ${j.reward}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => setView('jobs')} style={styles.viewBtn}>
                                        Apply <ExternalLink size={12} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div style={styles.emptyState}>
                                <div style={styles.emptyIcon}><Bookmark size={32} color="#e2e8f0" /></div>
                                <p style={{color: '#94a3b8', fontSize: '14px'}}>Your watchlist is empty.</p>
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
    container: { maxWidth: '1100px', margin: '60px auto', padding: '0 25px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    title: { fontSize: '32px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1px' },
    subtitle: { color: '#64748b', fontSize: '16px', marginTop: '6px' },
    logoutBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: '700', cursor: 'pointer', fontSize: '14px', transition: '0.2s' },
    dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '30px' },
    card: { background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' },
    iconBox: { width: '36px', height: '36px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    cardTitle: { margin: 0, fontSize: '14px', fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' },
    profileSection: { display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' },
    imageContainer: { position: 'relative' },
    profileImg: { width: '85px', height: '85px', borderRadius: '24px', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
    avatarPlaceholder: { width: '85px', height: '85px', borderRadius: '24px', background: '#f8fafc', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    editThumbBtn: { position: 'absolute', bottom: '-5px', right: '-5px', background: '#2563eb', color: '#fff', border: '3px solid #fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    memberSince: { fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontWeight: '600' },
    cvStatusBox: { background: '#f8fafc', padding: '24px', borderRadius: '20px', marginTop: 'auto' },
    statusRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    progressTrack: { height: '8px', background: '#e2e8f0', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' },
    progressBar: { height: '100%', borderRadius: '10px', transition: 'width 0.8s ease' },
    actionBtn: { background: '#2563eb', color: '#fff', border: 'none', width: '100%', padding: '14px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s' },
    bookmarksList: { display: 'flex', flexDirection: 'column', gap: '4px' },
    itemStyle: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f8fafc' },
    jobInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
    jobDot: { width: '10px', height: '10px', borderRadius: '3px', background: '#10b981' },
    jobTitleText: { fontSize: '15px', fontWeight: '700', color: '#1e293b' },
    viewBtn: { background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' },
    emptyState: { textAlign: 'center', padding: '40px 0', background: '#fcfcfc', borderRadius: '20px', border: '1px dashed #e2e8f0' },
    emptyIcon: { marginBottom: '12px' },
    exploreLink: { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', marginTop: '15px', fontSize: '13px' },
    loginWall: { textAlign: 'center', padding: '120px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    alertCircle: { width: '80px', height: '80px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }
};