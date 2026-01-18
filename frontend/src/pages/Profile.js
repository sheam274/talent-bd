import React, { useState, useEffect } from 'react';
import { Award, Zap, Target, ShieldCheck, Mail, MapPin, Wallet, TrendingUp, Calendar, Share2, Hexagon } from 'lucide-react';

export default function Profile({ user }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Robust Level Logic Sync
    const currentPoints = user?.points || 0;
    const currentLevel = Math.floor(currentPoints / 1000) + 1;
    const pointsInCurrentLevel = currentPoints % 1000;
    const progressPercentage = (pointsInCurrentLevel / 1000) * 100;

    return (
        <div style={{...styles.container, padding: isMobile ? '20px 15px' : '40px 20px'}}>
            
            {/* Main Profile Header Card */}
            <div style={{
                ...styles.headerCard, 
                padding: isMobile ? '40px 20px' : '60px 40px',
                flexDirection: isMobile ? 'column' : 'row',
                textAlign: isMobile ? 'center' : 'left'
            }}>
                <div style={styles.avatarWrapper}>
                    <div style={{
                        ...styles.avatarCircle, 
                        margin: isMobile ? '0 auto' : '0'
                    }}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div style={styles.levelBadge}>Lv. {currentLevel}</div>
                </div>
                
                <div style={{ flex: 1, marginTop: isMobile ? '20px' : '0', marginLeft: isMobile ? '0' : '30px' }}>
                    <div style={{display: 'flex', justifyContent: isMobile ? 'center' : 'space-between', alignItems: 'center'}}>
                        <h1 style={styles.userName}>{user?.name || 'Talent Member'}</h1>
                        {!isMobile && <button style={styles.shareBtn}><Share2 size={16} /> Share ID</button>}
                    </div>
                    
                    <div style={{...styles.userInfo, justifyContent: isMobile ? 'center' : 'flex-start', flexWrap: 'wrap'}}>
                        <span style={styles.infoTag}><Mail size={14} /> {user?.email}</span>
                        <span style={styles.infoTag}><MapPin size={14} /> Dhaka, BD</span>
                        <span style={styles.infoTag}><Calendar size={14} /> Joined 2026</span>
                    </div>
                    
                    {/* XP & Level Bar Integration */}
                    <div style={{...styles.xpSection, margin: isMobile ? '30px auto 0' : '20px 0 0'}}>
                        <div style={styles.xpLabels}>
                            <span style={{color: '#94a3b8'}}>Tier Progress</span>
                            <span style={{color: '#fff'}}>{pointsInCurrentLevel} <small style={{opacity: 0.6}}>/ 1000 XP</small></span>
                        </div>
                        <div style={styles.progressBarContainer}>
                            <div style={{...styles.progressBar, width: `${progressPercentage}%`}}></div>
                        </div>
                        <p style={{...styles.xpHint, textAlign: isMobile ? 'center' : 'left'}}>
                            {1000 - pointsInCurrentLevel} XP until next rank
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Insights Stats Grid */}
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
                    <div style={styles.statLabel}>Total Earned</div>
                </div>
            </div>

            {/* Verified Credentials Marketplace Section */}
            <div style={{...styles.badgeSection, padding: isMobile ? '30px 20px' : '40px'}}>
                <div style={{...styles.sectionHeader, flexDirection: isMobile ? 'column' : 'row', gap: '15px'}}>
                    <h3 style={styles.sectionTitle}>
                        <Award size={24} color="#2563eb" /> Verified Credentials
                    </h3>
                    <div style={styles.badgeCount}>{user?.skills?.length || 0} Professional Badges</div>
                </div>

                <div style={{
                    ...styles.badgeGrid,
                    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(200px, 1fr))'
                }}>
                    {user?.skills && user.skills.length > 0 ? (
                        user.skills.map((skill, i) => (
                            <div key={i} style={styles.badgeCard}>
                                <div style={styles.badgeIcon}>
                                    <Hexagon size={42} color="#2563eb" fill="#eff6ff" />
                                    <ShieldCheck size={18} color="#16a34a" style={styles.innerShield} />
                                </div>
                                <div style={styles.badgeName}>{skill}</div>
                                <div style={styles.badgeMeta}>Level 1 Verified</div>
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
    container: { maxWidth: '1000px', margin: '0 auto', minHeight: '90vh' },
    headerCard: { 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        borderRadius: '32px', 
        color: '#fff', 
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255,255,255,0.05)'
    },
    avatarWrapper: { position: 'relative' },
    avatarCircle: { 
        width: '120px', height: '120px', background: '#2563eb', 
        borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '48px', fontWeight: '900', border: '5px solid rgba(255,255,255,0.1)',
        transform: 'rotate(-3deg)', boxShadow: '0 20px 40px rgba(37, 99, 235, 0.3)'
    },
    levelBadge: {
        position: 'absolute', bottom: '-5px', right: '-5px',
        background: '#eab308', color: '#000', padding: '6px 14px',
        borderRadius: '12px', fontSize: '12px', fontWeight: '900',
        border: '3px solid #1e293b'
    },
    userName: { fontSize: '36px', margin: 0, fontWeight: '900', letterSpacing: '-1.5px' },
    userInfo: { display: 'flex', gap: '12px', marginTop: '15px', color: '#94a3b8' },
    infoTag: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: '600' },
    xpSection: { width: '100%', maxWidth: '500px' },
    xpLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' },
    progressBarContainer: { height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden' },
    progressBar: { height: '100%', background: 'linear-gradient(90deg, #2563eb, #3b82f6)', transition: 'width 1.5s ease-in-out' },
    xpHint: { fontSize: '11px', color: '#64748b', marginTop: '8px', fontWeight: '700' },
    shareBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700' },
    
    statsGrid: { display: 'grid', gap: '20px', margin: '30px 0' },
    statBox: { 
        background: '#fff', padding: '28px', borderRadius: '28px', textAlign: 'center', 
        border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' 
    },
    iconBg: { width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' },
    statVal: { fontSize: '28px', fontWeight: '900', color: '#0f172a' },
    statLabel: { fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginTop: '4px' },

    badgeSection: { background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' },
    sectionTitle: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: '900', margin: 0, color: '#0f172a' },
    badgeCount: { fontSize: '12px', fontWeight: '900', color: '#2563eb', background: '#eff6ff', padding: '8px 18px', borderRadius: '50px', border: '1px solid #dbeafe' },
    badgeGrid: { display: 'grid', gap: '20px' },
    badgeCard: { 
        background: '#fcfdfe', border: '1px solid #f1f5f9', padding: '30px 15px', 
        borderRadius: '26px', textAlign: 'center', transition: '0.3s'
    },
    badgeIcon: { position: 'relative', display: 'inline-block', marginBottom: '18px' },
    innerShield: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    badgeName: { fontSize: '17px', fontWeight: '800', color: '#1e293b', marginBottom: '4px' },
    badgeMeta: { fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' },
    noSkills: { color: '#94a3b8', textAlign: 'center', gridColumn: '1 / -1', padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }
};