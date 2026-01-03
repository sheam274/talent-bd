import React from 'react';

export default function Navbar({ setView, user, handleLogout }) {
    return (
        <nav style={styles.nav}>
            <div style={styles.container}>
                <div style={styles.logo} onClick={() => setView('home')}>
                    Talent<span style={{ color: '#2563eb' }}>BD</span>
                </div>

                <div style={styles.links}>
                    <p style={styles.link} onClick={() => setView('jobs')}>Jobs</p>
                    <p style={styles.link} onClick={() => setView('cv-builder')}>CV Builder</p>
                    
                    <div style={{ position: 'relative' }}>
                        <p style={{ ...styles.link, color: '#2563eb', fontWeight: 'bold' }} onClick={() => setView('learning')}>
                            Learning Hub
                        </p>
                        <span style={styles.badge}>AI Recommended</span>
                    </div>

                    {user ? (
                        <div style={styles.userSection}>
                            <p style={styles.link} onClick={() => setView('profile')}>Profile</p>
                            {user.role === 'admin' && (
                                <p style={{...styles.link, color: '#ef4444'}} onClick={() => setView('admin')}>Admin</p>
                            )}
                            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                        </div>
                    ) : (
                        <button onClick={() => setView('login')} style={styles.loginBtn}>Login</button>
                    )}
                </div>
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        position: 'fixed', top: 0, left: 0, right: 0,
        height: '80px', background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', zIndex: 1000
    },
    container: {
        width: '90%', maxWidth: '1200px', margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    logo: { fontSize: '24px', fontWeight: '900', cursor: 'pointer', color: '#0f172a' },
    links: { display: 'flex', alignItems: 'center', gap: '30px' },
    link: { fontSize: '14px', fontWeight: '500', color: '#475569', cursor: 'pointer' },
    badge: {
        position: 'absolute', top: '-15px', right: '-10px',
        background: '#dbeafe', color: '#2563eb', fontSize: '8px',
        padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold'
    },
    loginBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' },
    logoutBtn: { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' },
    userSection: { display: 'flex', alignItems: 'center', gap: '20px' }
};