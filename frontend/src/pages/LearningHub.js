import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Play, Award, Clock, BookOpen, Star, ShieldCheck, 
    Zap, ChevronRight, CheckCircle2, Layers, Plus, Trash2 
} from 'lucide-react';

export default function LearningHub({ onStartCourse, courses = [], user }) {
    const [loading, setLoading] = useState(true);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    
    // Admin & Category Sync State
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState('');
    const isAdmin = user?.role === 'admin' || user?.email === 'admin@talentbd.com';

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        fetchCategories();
        const timer = setTimeout(() => setLoading(false), 800);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, []);

    // --- CATEGORY SYNC LOGIC ---
    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            // Filter categories for the learning environment
            setCategories(res.data.filter(c => c.group === 'learning' || c.group === 'job'));
        } catch (err) { console.warn("Backend sync pending..."); }
    };

    const addCategory = async () => {
        if (!newCat) return;
        try {
            await axios.post('http://localhost:5000/api/admin/categories', { name: newCat, group: 'learning' });
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

    const isMobile = windowWidth < 768;
    const isTablet = windowWidth < 1024;

    const getYouTubeThumb = (url) => {
        if (!url) return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500';
        let videoId = null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        videoId = (match && match[2].length === 11) ? match[2] : null;
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500';
    };

    const userSkills = user?.skills?.map(s => s.toLowerCase().trim()) || [];

    return (
        <div style={{...styles.container, padding: isMobile ? '20px 15px' : '40px 24px'}}>
            
            {/* 1. ADMIN CATEGORY ARCHITECT (SYNCED) */}
            {isAdmin && (
                <div style={styles.adminSection}>
                    <div style={styles.adminHeader}>
                        <Layers size={16} color="#2563eb" /> 
                        <span style={styles.adminTitle}>Skill Track Architect</span>
                    </div>
                    <div style={{...styles.adminControls, flexDirection: isMobile ? 'column' : 'row'}}>
                        <input 
                            style={styles.adminInput} 
                            placeholder="Add New Learning Category (e.g. AI, Backend)..." 
                            value={newCat}
                            onChange={(e) => setNewCat(e.target.value)}
                        />
                        <button onClick={addCategory} style={styles.adminAddBtn}><Plus size={16}/> Add Category</button>
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

            {/* 2. HEADER SECTION */}
            <header style={{...styles.header, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center'}}>
                <div style={styles.headerText}>
                    <div style={styles.topBadge}><Zap size={12} fill="#2563eb" /> AI-DRIVEN VERIFICATION</div>
                    <h2 style={{...styles.mainTitle, fontSize: isMobile ? '28px' : '38px'}}>Learning <span style={{color:'#2563eb'}}>Hub</span></h2>
                    <p style={styles.subtitle}>Master these modules to unlock higher payout gigs in the Marketplace.</p>
                </div>
                <div style={{...styles.badgeCount, width: isMobile ? '100%' : 'auto', justifyContent: 'center'}}>
                    <ShieldCheck size={20} color="#2563eb" />
                    <span><strong>{courses.length}</strong> Modules Live</span>
                </div>
            </header>

            {/* 3. PROGRESS TRACKER */}
            {!loading && userSkills.length > 0 && (
                <div style={styles.miniStatsRow}>
                    <div style={styles.miniStat}>
                        <CheckCircle2 size={16} color="#10b981" />
                        <span>{userSkills.length} Badges Verified</span>
                    </div>
                    <div style={styles.progressBarBg}>
                        <div style={{...styles.progressFill, width: `${Math.min((userSkills.length / (courses.length || 1)) * 100, 100)}%`}}></div>
                    </div>
                </div>
            )}

            {/* 4. COURSE GRID */}
            <div style={{
                ...styles.grid, 
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(auto-fill, minmax(340px, 1fr))'
            }}>
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} style={styles.skeletonCard}>
                            <div style={styles.skeletonImage} />
                            <div style={{padding: '25px'}}><div style={styles.skeletonLine} /><div style={{...styles.skeletonLine, width: '60%'}} /></div>
                        </div>
                    ))
                ) : (
                    courses.map((course, index) => {
                        const isCompleted = userSkills.includes((course.tag || course.skillTag || '').toLowerCase().trim());
                        
                        return (
                            <div 
                                key={course.id || course._id || index} 
                                style={{
                                    ...styles.card,
                                    border: isCompleted ? '2px solid #10b981' : '1px solid #e2e8f0'
                                }}
                                onClick={() => onStartCourse(course)}
                            >
                                <div style={styles.imageWrapper}>
                                    <img 
                                        src={getYouTubeThumb(course.video || course.videoUrl)} 
                                        alt={course.title} 
                                        style={styles.image} 
                                    />
                                    {isCompleted ? (
                                        <div style={styles.completedOverlay}>
                                            <CheckCircle2 size={40} color="#fff" />
                                            <span style={{fontWeight:'900', fontSize:'11px', marginTop:'5px', letterSpacing:'1px'}}>SKILL VERIFIED</span>
                                        </div>
                                    ) : (
                                        <div style={styles.playOverlay}><Play fill="white" size={24} /></div>
                                    )}
                                    <div style={styles.durationTag}><Clock size={12} /> 15 min</div>
                                </div>

                                <div style={styles.content}>
                                    <div style={styles.tagRow}>
                                        <span style={{
                                            ...styles.tag, 
                                            background: isCompleted ? '#f0fdf4' : '#eff6ff',
                                            color: isCompleted ? '#16a34a' : '#2563eb'
                                        }}>
                                            {course.tag || course.skillTag || 'Expert'}
                                        </span>
                                        <div style={styles.rating}><Star size={12} fill="#eab308" color="#eab308" /> <span>4.9</span></div>
                                    </div>
                                    
                                    <h3 style={styles.title}>{course.title}</h3>
                                    <p style={styles.description}>Certify your {course.tag || course.skillTag} knowledge to access premium work.</p>

                                    <button style={{
                                        ...styles.btn,
                                        background: isCompleted ? '#f8fafc' : '#2563eb',
                                        color: isCompleted ? '#64748b' : '#fff',
                                        border: isCompleted ? '1px solid #e2e8f0' : 'none'
                                    }}>
                                        {isCompleted ? 'Review Module' : 'Unlock Badge'} 
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
    adminSection: { background: '#f8fafc', padding: '24px', borderRadius: '28px', marginBottom: '40px', border: '1px dashed #cbd5e1' },
    adminHeader: { display:'flex', alignItems:'center', gap:'8px', marginBottom:'15px' },
    adminTitle: { fontSize:'12px', fontWeight:'900', textTransform:'uppercase', color:'#475569' },
    adminControls: { display:'flex', gap:'10px', marginBottom:'15px' },
    adminInput: { flex:1, padding:'14px', borderRadius:'12px', border:'1px solid #e2e8f0', outline:'none', fontSize:'14px' },
    adminAddBtn: { background:'#0f172a', color:'#fff', border:'none', padding:'0 20px', borderRadius:'12px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px' },
    catWrap: { display:'flex', flexWrap:'wrap', gap:'8px' },
    catChip: { background:'#fff', padding:'6px 14px', borderRadius:'10px', fontSize:'12px', fontWeight:'700', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'8px' },
    trash: { color:'#ef4444', cursor:'pointer' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '40px', gap: '20px' },
    headerText: { flex: '1' },
    topBadge: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '900', color: '#2563eb', marginBottom: '10px', letterSpacing: '1px' },
    mainTitle: { fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1.5px' },
    subtitle: { color: '#64748b', fontSize: '16px', marginTop: '10px', maxWidth: '600px', lineHeight: '1.5' },
    badgeCount: { background: '#fff', padding: '15px 25px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', border: '1px solid #e2e8f0', color: '#1e40af', fontWeight: '800' },
    miniStatsRow: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '35px', background: '#f8fafc', padding: '15px 20px', borderRadius: '16px', border: '1px solid #e2e8f0' },
    miniStat: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: '#1e293b' },
    progressBarBg: { flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' },
    progressFill: { height: '100%', background: '#10b981', transition: 'width 1s ease' },
    grid: { display: 'grid', gap: '30px' },
    card: { background: '#fff', borderRadius: '32px', overflow: 'hidden', transition: '0.3s', cursor: 'pointer', position: 'relative', border: '1px solid #e2e8f0' },
    imageWrapper: { position: 'relative', height: '200px', background: '#000', overflow: 'hidden' },
    image: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 },
    playOverlay: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#2563eb', width: '55px', height: '55px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    completedOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(16, 185, 129, 0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    durationTag: { position: 'absolute', bottom: '15px', right: '15px', background: 'rgba(15, 23, 42, 0.8)', color: '#fff', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' },
    content: { padding: '28px' },
    tagRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' },
    tag: { fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '50px' },
    rating: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '800' },
    title: { fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', color: '#0f172a', lineHeight: '1.4' },
    description: { fontSize: '14px', color: '#64748b', marginBottom: '30px', lineHeight: '1.6' },
    btn: { width: '100%', padding: '16px', borderRadius: '18px', cursor: 'pointer', fontWeight: '900', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
    skeletonCard: { background: '#fff', borderRadius: '32px', overflow: 'hidden', border: '1px solid #f1f5f9' },
    skeletonImage: { height: '200px', background: '#f1f5f9' },
    skeletonLine: { height: '15px', background: '#f8fafc', borderRadius: '4px', marginBottom: '12px' }
};