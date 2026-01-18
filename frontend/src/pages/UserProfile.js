import React, { useState, useEffect } from 'react';
import { User, FileText, Bookmark, Calendar, ArrowRight, CheckCircle, AlertCircle, Camera, LogOut, ExternalLink, Menu, LayoutDashboard } from 'lucide-react';

export default function UserProfile({ user, setUser, setView }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Sync window size for responsive layout adjustments
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // FIXED: Handle session expiration gracefully
    if (!user) return (
        <div style={styles.loginWall}>
            <div style={styles.alertCircle}><AlertCircle size={40} color="#ef4444" /></div>
            <h2 style={{fontSize: isMobile ? '20px' : '24px', fontWeight: '900'}}>Session Expired</h2>
            <p style={{color: '#64748b', padding: '0 20px'}}>Please login to access your professional dashboard.</p>
            <button onClick={() => setView('login')} style={{...styles.actionBtn, maxWidth: '250px', marginTop: '20px'}}>Login to TalentBD</button>
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
        <div style={{
            ...styles.container, 
            padding: isMobile ? '20px 15px' : '40px 25px',
            marginTop: isMobile ? '20px' : '60px'
        }}>
            {/* Header with Responsive Logic */}
            <header style={{
                ...styles.header, 
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '20px' : '0'
            }}>
                <div>
                    <div style={styles.topBadge}><LayoutDashboard size={12} /> PORTAL 2026</div>
                    <h1 style={{...styles.title, fontSize: isMobile ? '26px' : '32px'}}>Career Dashboard</h1>
                    <p style={styles.subtitle}>Welcome back, {user.name.split(' ')[0]}! Track your professional growth.</p>
                </div>
                <button onClick={handleLogout} style={{
                    ...styles.logoutBtn,
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center'
                }}>
                    <LogOut size={16} /> Logout
                </button>
            </header>

            <div style={{
                ...styles.dashboardGrid,
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(380px, 1fr))'
            }}>
                
                {/* CV STATUS CARD */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBox}><FileText size={18} color="#2563eb" /></div>
                        <h3 style={styles.cardTitle}>Professional Identity</h3>
                    </div>

                    <div style={{
                        ...styles.profileSection,
                        flexDirection: isMobile ? 'row' : 'row' // Keeps horizontal even on mobile for space efficiency
                    }}>
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
                        <div style={{flex: 1}}>
                            <h3 style={{margin: 0, fontSize: isMobile ? '16px' : '18px', fontWeight: '800'}}>{user.name}</h3>
                            <div style={styles.memberSince}>
                                <Calendar size={12} /> Member since 2026
                            </div>
                        </div>
                    </div>
                    
                    <div style={{
                        ...styles.cvStatusBox, 
                        borderLeft: isCVComplete ? '4px solid #10b981' : '4px solid #f59e0b',
                        padding: isMobile ? '16px' : '24px'
                    }}>
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
                                <div key={j._id} style={{
                                    ...styles.itemStyle,
                                    flexDirection: isMobile ? 'column' : 'row',
                                    alignItems: isMobile ? 'flex-start' : 'center',
                                    gap: isMobile ? '12px' : '0',
                                    padding: isMobile ? '15px 0' : '15px 0'
                                }}>
                                    <div style={styles.jobInfo}>
                                        <div style={{...styles.jobDot, background: j.status === 'active' ? '#10b981' : '#2563eb'}} />
                                        <div>
                                            <div style={styles.jobTitleText}>{j.title}</div>
                                            <div style={{fontSize: '11px', color: '#94a3b8'}}>{j.skill} • ${j.reward}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => setView('jobs')} style={{
                                        ...styles.viewBtn,
                                        width: isMobile ? '100%' : 'auto',
                                        justifyContent: 'center'
                                    }}>
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
    container: { maxWidth: '1100px', margin: '0 auto', minHeight: '80vh' },
    topBadge: { display: 'flex', alignItems: 'center', gap: '5px', color: '#2563eb', fontSize: '10px', fontWeight: '900', marginBottom: '8px', letterSpacing: '1px' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '40px' },
    title: { fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1.5px' },
    subtitle: { color: '#64748b', fontSize: '15px', marginTop: '6px' },
    logoutBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
    dashboardGrid: { display: 'grid', gap: '25px' },
    card: { background: '#fff', padding: '30px', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' },
    iconBox: { width: '40px', height: '40px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    cardTitle: { margin: 0, fontSize: '13px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px' },
    profileSection: { display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' },
    imageContainer: { position: 'relative' },
    profileImg: { width: '80px', height: '80px', borderRadius: '22px', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 10px 20px rgba(0,0,0,0.08)' },
    avatarPlaceholder: { width: '80px', height: '80px', borderRadius: '22px', background: '#f8fafc', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    editThumbBtn: { position: 'absolute', bottom: '-4px', right: '-4px', background: '#2563eb', color: '#fff', border: '3px solid #fff', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    memberSince: { fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontWeight: '700' },
    cvStatusBox: { background: '#f8fafc', borderRadius: '22px', marginTop: 'auto', border: '1px solid #f1f5f9' },
    statusRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    progressTrack: { height: '8px', background: '#e2e8f0', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' },
    progressBar: { height: '100%', borderRadius: '10px', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' },
    actionBtn: { width: '100%', padding: '16px', borderRadius: '14px', border: 'none', color: '#fff', fontWeight: '900', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', fontSize: '14px' },
    bookmarksList: { display: 'flex', flexDirection: 'column' },
    itemStyle: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '15px', marginBottom: '5px' },
    jobInfo: { display: 'flex', alignItems: 'center', gap: '15px' },
    jobDot: { width: '10px', height: '10px', borderRadius: '4px' },
    jobTitleText: { fontSize: '15px', fontWeight: '800', color: '#0f172a' },
    viewBtn: { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' },
    emptyState: { textAlign: 'center', padding: '50px 20px', background: '#fcfdfe', borderRadius: '24px', border: '2px dashed #e2e8f0' },
    emptyIcon: { marginBottom: '15px', opacity: 0.5 },
    exploreLink: { background: '#2563eb', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', marginTop: '20px', fontSize: '13px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)' },
    loginWall: { textAlign: 'center', padding: '120px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', minHeight: '90vh' },
    alertCircle: { width: '80px', height: '80px', background: '#fef2f2', borderRadius: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px', transform: 'rotate(-5deg)' }
};