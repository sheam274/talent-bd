import React from 'react';
import { Award, Zap, Target, ShieldCheck, Mail, MapPin, Wallet, TrendingUp } from 'lucide-react';

export default function Profile({ user }) {
    // FIXED: Robust Level Logic
    // Level 1: 0-999 XP, Level 2: 1000-1999 XP, etc.
    const currentPoints = user.points || 0;
    const currentLevel = Math.floor(currentPoints / 1000) + 1;
    const pointsInCurrentLevel = currentPoints % 1000;
    const progressPercentage = (pointsInCurrentLevel / 1000) * 100;

    return (
        <div style={styles.container}>
            {/* Main Profile Header */}
            <div style={styles.headerCard}>
                <div style={styles.avatarWrapper}>
                    <div style={styles.avatarCircle}>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div style={styles.levelBadge}>Lv. {currentLevel}</div>
                </div>
                
                <h1 style={styles.userName}>{user.name || 'Anonymous Talent'}</h1>
                
                <div style={styles.userInfo}>
                    <span style={styles.infoTag}><Mail size={14} /> {user.email}</span>
                    <span style={styles.infoTag}><MapPin size={14} /> Dhaka, BD</span>
                </div>
                
                {/* XP & Level Bar */}
                <div style={styles.xpSection}>
                    <div style={styles.xpLabels}>
                        <span style={{color: '#94a3b8'}}>Level {currentLevel} Progress</span>
                        <span style={{color: '#fff'}}>{pointsInCurrentLevel} / 1000 XP</span>
                    </div>
                    <div style={styles.progressBarContainer}>
                        <div style={{...styles.progressBar, width: `${progressPercentage}%`}}></div>
                    </div>
                    <p style={styles.xpHint}>Earn {1000 - pointsInCurrentLevel} more XP to reach Level {currentLevel + 1}</p>
                </div>
            </div>

            {/* Career & Financial Stats */}
            <div style={styles.statsGrid}>
                <div style={styles.statBox}>
                    <div style={{...styles.iconBg, background: '#eff6ff'}}><Target color="#2563eb" size={20} /></div>
                    <div style={styles.statVal}>84%</div>
                    <div style={styles.statLabel}>AI Match Rate</div>
                </div>
                <div style={styles.statBox}>
                    <div style={{...styles.iconBg, background: '#fff7ed'}}><Zap color="#eab308" size={20} /></div>
                    <div style={styles.statVal}>{user.skills?.length || 0}</div>
                    <div style={styles.statLabel}>Skill Badges</div>
                </div>
                <div style={styles.statBox}>
                    <div style={{...styles.iconBg, background: '#f0fdf4'}}><Wallet color="#16a34a" size={20} /></div>
                    <div style={styles.statVal}>${user.wallet || '0.00'}</div>
                    <div style={styles.statLabel}>Total Earned</div>
                </div>
            </div>

            {/* Verified Badges Section */}
            <div style={styles.badgeSection}>
                <div style={styles.sectionHeader}>
                    <h3 style={styles.sectionTitle}>
                        <Award size={22} color="#2563eb" /> Verified Credentials
                    </h3>
                    <div style={styles.badgeCount}>{user.skills?.length || 0} Badges Earned</div>
                </div>

                <div style={styles.badgeGrid}>
                    {user.skills && user.skills.length > 0 ? (
                        user.skills.map((skill, i) => (
                            <div key={i} style={styles.badgeCard}>
                                <div style={styles.badgeIcon}>
                                    <ShieldCheck size={28} color="#16a34a" fill="#dcfce7" />
                                </div>
                                <div style={styles.badgeName}>{skill}</div>
                                <div style={styles.badgeMeta}>Verified 2026</div>
                            </div>
                        ))
                    ) : (
                        <div style={styles.noSkills}>
                            <TrendingUp size={40} color="#cbd5e1" />
                            <p>No verified skills yet. Start a course to earn your first badge!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: '900px', margin: '40px auto', padding: '0 20px', minHeight: '90vh' },
    headerCard: { 
        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)', 
        padding: '50px 40px', 
        borderRadius: '32px', 
        color: '#fff', 
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        overflow: 'hidden'
    },
    avatarWrapper: { position: 'relative', width: '100px', margin: '0 auto 25px' },
    avatarCircle: { 
        width: '100px', height: '100px', background: '#2563eb', 
        borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '42px', fontWeight: '900', border: '4px solid rgba(255,255,255,0.1)',
        transform: 'rotate(-5deg)'
    },
    levelBadge: {
        position: 'absolute', bottom: '-10px', right: '-10px',
        background: '#eab308', color: '#000', padding: '4px 12px',
        borderRadius: '50px', fontSize: '12px', fontWeight: '900',
        border: '3px solid #1e293b'
    },
    userName: { fontSize: '32px', margin: '0 0 10px 0', fontWeight: '900', letterSpacing: '-1px' },
    userInfo: { display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px', color: '#94a3b8', fontSize: '14px' },
    infoTag: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '50px' },
    xpSection: { maxWidth: '450px', margin: '0 auto' },
    xpLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px', fontWeight: '700' },
    progressBarContainer: { height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' },
    progressBar: { height: '100%', background: 'linear-gradient(90deg, #2563eb, #60a5fa)', borderRadius: '20px', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' },
    xpHint: { fontSize: '11px', color: '#64748b', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '1px' },
    
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '30px 0' },
    statBox: { 
        background: '#fff', padding: '24px', borderRadius: '24px', textAlign: 'center', 
        border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' 
    },
    iconBg: { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' },
    statVal: { fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '0 0 4px 0' },
    statLabel: { fontSize: '13px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },

    badgeSection: { background: '#fff', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    sectionTitle: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' },
    badgeCount: { fontSize: '13px', fontWeight: '800', color: '#2563eb', background: '#eff6ff', padding: '6px 16px', borderRadius: '50px' },
    badgeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' },
    badgeCard: { 
        background: '#fff', border: '1px solid #f1f5f9', padding: '25px 15px', 
        borderRadius: '24px', textAlign: 'center', transition: '0.3s ease',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
    },
    badgeIcon: { marginBottom: '15px' },
    badgeName: { fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '5px' },
    badgeMeta: { fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' },
    noSkills: { color: '#94a3b8', textAlign: 'center', gridColumn: '1 / -1', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }
};