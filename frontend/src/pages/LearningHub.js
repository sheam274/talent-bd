import React, { useState, useEffect } from 'react';
import { Play, Award, Clock, BookOpen, Star, ShieldCheck, Zap, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function LearningHub({ onStartCourse, courses = [], user }) {
    const [loading, setLoading] = useState(true);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    // Track responsiveness for HP-840 vs Mobile
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        const timer = setTimeout(() => setLoading(false), 800);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, []);

    const isMobile = windowWidth < 768;
    const isTablet = windowWidth < 1024;

    // FEATURE PRESERVED: Advanced YouTube Thumbnail parser
    const getYouTubeThumb = (url) => {
        if (!url) return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500';
        let videoId = null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        videoId = (match && match[2].length === 11) ? match[2] : null;
        return videoId 
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` 
            : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500';
    };

    // SYNC: Check if user already has the skill badge
    const userSkills = user?.skills?.map(s => s.toLowerCase().trim()) || [];

    return (
        <div style={{...styles.container, padding: isMobile ? '20px 15px' : '40px 20px'}}>
            <header style={{...styles.header, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center'}}>
                <div style={styles.headerText}>
                    <div style={styles.topBadge}><Zap size={12} fill="#2563eb" /> SKILL VERIFICATION ENGINE</div>
                    <h2 style={{...styles.mainTitle, fontSize: isMobile ? '28px' : '36px'}}>Learning <span style={{color:'#2563eb'}}>Hub</span></h2>
                    <p style={styles.subtitle}>Complete modules to earn badges and unlock high-reward marketplace gigs.</p>
                </div>
                <div style={{...styles.badgeCount, width: isMobile ? '100%' : 'auto', justifyContent: 'center'}}>
                    <ShieldCheck size={20} color="#2563eb" />
                    <span><strong>{courses.length}</strong> Verification Tracks Available</span>
                </div>
            </header>

            {/* PROGRESS TRACKER BAR (New Feature Added) */}
            {!loading && userSkills.length > 0 && (
                <div style={styles.miniStatsRow}>
                    <div style={styles.miniStat}>
                        <CheckCircle2 size={16} color="#10b981" />
                        <span>{userSkills.length} Badges Earned</span>
                    </div>
                    <div style={styles.progressBarBg}>
                        <div style={{...styles.progressFill, width: `${Math.min((userSkills.length / courses.length) * 100, 100)}%`}}></div>
                    </div>
                </div>
            )}

            <div style={{
                ...styles.grid, 
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(auto-fill, minmax(340px, 1fr))'
            }}>
                {loading ? (
                    // FEATURE PRESERVED: Skeleton UI
                    [1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} style={styles.skeletonCard}>
                            <div style={styles.skeletonImage} />
                            <div style={{padding: '25px'}}>
                                <div style={styles.skeletonLine} />
                                <div style={{...styles.skeletonLine, width: '60%'}} />
                                <div style={{...styles.skeletonLine, width: '40%', marginTop: '20px', height: '30px'}} />
                            </div>
                        </div>
                    ))
                ) : courses.length === 0 ? (
                    <div style={styles.empty}>
                        <BookOpen size={48} color="#cbd5e1" style={{marginBottom: '15px'}} />
                        <h3>No modules found</h3>
                        <p>The marketplace is preparing new verification tracks. Check back soon!</p>
                    </div>
                ) : (
                    courses.map((course, index) => {
                        const isCompleted = userSkills.includes((course.tag || course.skillTag || '').toLowerCase().trim());
                        
                        return (
                            <div 
                                key={course.id || course._id || index} 
                                style={{
                                    ...styles.card,
                                    border: isCompleted ? '2px solid #10b981' : '1px solid #e2e8f0',
                                    transform: 'scale(1)'
                                }}
                                onClick={() => onStartCourse(course)}
                            >
                                <div style={styles.imageWrapper}>
                                    <img 
                                        src={getYouTubeThumb(course.video || course.videoUrl)} 
                                        alt={course.title} 
                                        style={styles.image} 
                                        onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                                    />
                                    {isCompleted ? (
                                        <div style={styles.completedOverlay}>
                                            <CheckCircle2 size={40} color="#fff" />
                                            <span style={{fontWeight:'900', fontSize:'12px', marginTop:'5px'}}>VERIFIED</span>
                                        </div>
                                    ) : (
                                        <div style={styles.playOverlay}>
                                            <Play fill="white" size={24} />
                                        </div>
                                    )}
                                    <div style={styles.durationTag}>
                                        <Clock size={12} /> 15 min
                                    </div>
                                </div>

                                <div style={styles.content}>
                                    <div style={styles.tagRow}>
                                        <span style={{
                                            ...styles.tag, 
                                            background: isCompleted ? '#f0fdf4' : '#eff6ff',
                                            color: isCompleted ? '#16a34a' : '#2563eb'
                                        }}>
                                            {course.tag || course.skillTag || 'Talent Badge'}
                                        </span>
                                        <div style={styles.rating}>
                                            <Star size={12} fill="#eab308" color="#eab308" /> 
                                            <span>4.9</span>
                                        </div>
                                    </div>
                                    
                                    <h3 style={styles.title}>{course.title}</h3>
                                    <p style={styles.description}>
                                        Pass the certification to unlock <strong>{course.tag || course.skillTag}</strong> level micro-tasks.
                                    </p>

                                    <button style={{
                                        ...styles.btn,
                                        background: isCompleted ? '#f8fafc' : '#2563eb',
                                        color: isCompleted ? '#64748b' : '#fff',
                                        border: isCompleted ? '1px solid #e2e8f0' : 'none'
                                    }}>
                                        {isCompleted ? 'Review Content' : 'Start Verification'} 
                                        {!isCompleted && <ChevronRight size={18} />}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: '1250px', margin: '0 auto', minHeight: '85vh' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '40px', gap: '20px' },
    headerText: { flex: '1' },
    topBadge: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '900', color: '#2563eb', marginBottom: '10px', letterSpacing: '1px' },
    mainTitle: { fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1.5px' },
    subtitle: { color: '#64748b', fontSize: '16px', marginTop: '10px', maxWidth: '600px', lineHeight: '1.5' },
    badgeCount: { background: '#fff', padding: '15px 25px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', border: '1px solid #e2e8f0', color: '#1e40af', fontWeight: '800', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' },
    miniStatsRow: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '35px', background: '#f8fafc', padding: '15px 20px', borderRadius: '16px', border: '1px solid #e2e8f0' },
    miniStat: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: '#1e293b', whiteSpace: 'nowrap' },
    progressBarBg: { flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' },
    progressFill: { height: '100%', background: '#10b981', transition: 'width 1s ease-in-out' },
    grid: { display: 'grid', gap: '30px' },
    card: { background: '#fff', borderRadius: '32px', overflow: 'hidden', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' },
    imageWrapper: { position: 'relative', height: '200px', background: '#000', overflow: 'hidden' },
    image: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8, transition: '0.4s' },
    playOverlay: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', background: '#2563eb', width: '55px', height: '55px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 15px 30px rgba(37, 99, 235, 0.4)' },
    completedOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(16, 185, 129, 0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    durationTag: { position: 'absolute', bottom: '15px', right: '15px', background: 'rgba(15, 23, 42, 0.85)', color: '#fff', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' },
    content: { padding: '28px' },
    tagRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' },
    tag: { fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '50px', letterSpacing: '0.5px' },
    rating: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '800', color: '#1e293b' },
    title: { fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', color: '#0f172a', lineHeight: '1.4' },
    description: { fontSize: '14px', color: '#64748b', marginBottom: '30px', lineHeight: '1.6' },
    btn: { width: '100%', padding: '16px', borderRadius: '18px', cursor: 'pointer', fontWeight: '900', fontSize: '15px', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
    empty: { gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', color: '#94a3b8' },
    skeletonCard: { background: '#fff', borderRadius: '32px', overflow: 'hidden', border: '1px solid #f1f5f9' },
    skeletonImage: { height: '200px', background: '#f1f5f9' },
    skeletonLine: { height: '15px', background: '#f8fafc', borderRadius: '4px', marginBottom: '12px' }
};