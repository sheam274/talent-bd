import React, { useState, useEffect } from 'react';
import { Play, Award, Clock, BookOpen, Star, ShieldCheck } from 'lucide-react';

// ✅ Added 'courses' to the props
export default function LearningHub({ onStartCourse, courses = [] }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We simulate a brief loading state to keep the skeleton UI feature you liked
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    // FIXED: Advanced YouTube Thumbnail parser (Handles hqdefault fallback)
    const getYouTubeThumb = (url) => {
        if (!url) return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500';
        let videoId = null;
        
        // Improved regex to handle various YouTube URL formats
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        videoId = (match && match[2].length === 11) ? match[2] : null;
        
        return videoId 
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` 
            : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500';
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.headerText}>
                    <h2 style={styles.mainTitle}>Professional Skill Verification</h2>
                    <p style={styles.subtitle}>Complete certified modules to unlock high-paying tasks in the Marketplace.</p>
                </div>
                <div style={styles.badgeCount}>
                    <ShieldCheck size={20} color="#2563eb" />
                    {/* ✅ Dynamically shows the count from App.js state */}
                    <span><strong>{courses.length}</strong> Verification Tracks</span>
                </div>
            </header>

            <div style={styles.grid}>
                {loading ? (
                    // FEATURE PRESERVED: Skeleton UI
                    [1, 2, 3].map(i => (
                        <div key={i} style={styles.skeletonCard}>
                            <div style={styles.skeletonImage} />
                            <div style={{padding: '20px'}}>
                                <div style={styles.skeletonLine} />
                                <div style={{...styles.skeletonLine, width: '60%'}} />
                            </div>
                        </div>
                    ))
                ) : courses.length === 0 ? (
                    <div style={styles.empty}>
                        <BookOpen size={48} color="#cbd5e1" style={{marginBottom: '15px'}} />
                        <h3>No modules found</h3>
                        <p>Check back later or add modules via the Admin Dashboard.</p>
                    </div>
                ) : (
                    // ✅ FIXED: Mapping over the 'courses' prop from App.js
                    courses.map((course, index) => (
                        <div 
                            key={course.id || course._id || index} 
                            style={styles.card}
                            onClick={() => onStartCourse(course)}
                        >
                            <div style={styles.imageWrapper}>
                                <img 
                                    src={getYouTubeThumb(course.video || course.videoUrl)} 
                                    alt={course.title} 
                                    style={styles.image} 
                                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                                />
                                <div style={styles.playOverlay}>
                                    <Play fill="white" size={24} />
                                </div>
                                <div style={styles.durationTag}>
                                    <Clock size={12} /> 15-20 min
                                </div>
                            </div>

                            <div style={styles.content}>
                                <div style={styles.tagRow}>
                                    <span style={styles.tag}>{course.tag || course.skillTag || 'Talent Badge'}</span>
                                    <div style={styles.rating}>
                                        <Star size={12} fill="#eab308" color="#eab308" /> 
                                        <span>4.9</span>
                                    </div>
                                </div>
                                
                                <h3 style={styles.title}>{course.title}</h3>
                                <p style={styles.description}>
                                    Watch & pass the quiz to earn your <strong>{course.tag || course.skillTag}</strong> badge.
                                </p>

                                <button style={styles.btn}>
                                    Start Verification
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// --- ALL STYLES PRESERVED EXACTLY AS PROVIDED ---
const styles = {
    container: { maxWidth: '1200px', margin: '40px auto', padding: '0 20px', minHeight: '80vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px', flexWrap: 'wrap', gap: '20px' },
    headerText: { flex: '1' },
    mainTitle: { fontSize: '32px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1px' },
    subtitle: { color: '#64748b', fontSize: '17px', marginTop: '8px' },
    badgeCount: { background: '#fff', padding: '12px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', border: '1px solid #e2e8f0', color: '#1e40af', fontWeight: '800', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' },
    card: { background: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', position: 'relative' },
    imageWrapper: { position: 'relative', height: '190px', background: '#000', overflow: 'hidden' },
    image: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, transition: '0.3s' },
    playOverlay: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', background: '#2563eb', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)' },
    durationTag: { position: 'absolute', bottom: '15px', right: '15px', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' },
    content: { padding: '25px' },
    tagRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    tag: { fontSize: '10px', color: '#2563eb', fontWeight: '900', textTransform: 'uppercase', background: '#eff6ff', padding: '5px 12px', borderRadius: '50px', letterSpacing: '0.5px' },
    rating: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '800', color: '#1e293b' },
    title: { fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', color: '#1e293b', lineHeight: '1.4' },
    description: { fontSize: '14px', color: '#64748b', marginBottom: '25px', lineHeight: '1.6' },
    btn: { width: '100%', padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '800', fontSize: '15px', transition: '0.2s', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)' },
    empty: { gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', color: '#94a3b8' },
    skeletonCard: { background: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9' },
    skeletonImage: { height: '190px', background: '#f1f5f9' },
    skeletonLine: { height: '15px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '10px' }
};