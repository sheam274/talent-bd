import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    Play, Award, Clock, BookOpen, Star, ShieldCheck, 
    Zap, ChevronRight, CheckCircle2, Layers, Plus, Trash2, Filter
} from 'lucide-react';

// --- CONFIGURATION ---
const API_BASE = window.location.hostname === 'localhost' 
    ? "http://localhost:5000/api" 
    : "https://talent-bd-backend.onrender.com/api";

export default function LearningHub({ onStartCourse, user }) {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [newCat, setNewCat] = useState('');
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    
    const isAdmin = user?.role === 'admin' || user?.email === 'admin@talentbd.com';

    // --- 1. SYNC LOGIC (Fetching Live 2026 Curriculum) ---
    const syncData = useCallback(async () => {
        setLoading(true);
        try {
            const [catRes, courseRes] = await Promise.all([
                axios.get(`${API_BASE}/categories?group=learning`),
                axios.get(`${API_BASE}/admin/learning-hub`)
            ]);

            // Handle categories response
            const rawCats = catRes.data.categories || catRes.data || [];
            const cats = Array.isArray(rawCats) ? rawCats : [];
            setCategories(cats);

            // Handle courses/videos response with multiple fallbacks
            let rawCourses = [];
            if (courseRes.data.videos && Array.isArray(courseRes.data.videos)) {
                rawCourses = courseRes.data.videos;
            } else if (courseRes.data.courses && Array.isArray(courseRes.data.courses)) {
                rawCourses = courseRes.data.courses;
            } else if (Array.isArray(courseRes.data)) {
                rawCourses = courseRes.data;
            }
            
            // If DB is empty, use the high-quality featuredContent as fallback
            setCourses(rawCourses.length > 0 ? rawCourses : featuredContent);

        } catch (err) {
            console.warn("⚠️ Sync Pending: Using local high-quality modules.", err);
            setCourses(featuredContent);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        syncData();
        return () => window.removeEventListener('resize', handleResize);
    }, [syncData]);

    // --- 2. ADMIN ACTIONS ---
    const addCategory = async () => {
        if (!newCat) return;
        try {
            await axios.post(`${API_BASE}/categories`, { 
                name: newCat, 
                group: 'learning',
                icon: '📚' 
            });
            setNewCat('');
            syncData();
        } catch (err) { alert("Category addition failed."); }
    };

    const archiveCategory = async (id) => {
        try {
            await axios.patch(`${API_BASE}/admin/archive/category/${id}`);
            syncData();
        } catch (err) { alert("Archive operation failed."); }
    };

    // --- 3. VIDEO PROCESSING (YouTube Parser) ---
    const getYouTubeThumb = (url) => {
        if (!url) return 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) 
            ? `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg` 
            : 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800';
    };

    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1100;
    const userSkills = user?.skills?.map(s => s.toLowerCase().trim()) || [];

    const filteredCourses = activeFilter === 'All' 
        ? courses 
        : courses.filter(c => (c.tag || c.category) === activeFilter);

    return (
        <div style={{...styles.container, padding: isMobile ? '20px 15px' : '40px 24px'}}>
            
            {/* ADMIN CONSOLE: Only visible to Admin */}
            {isAdmin && (
                <div style={styles.adminSection}>
                    <div style={styles.adminHeader}>
                        <Layers size={16} color="#2563eb" /> 
                        <span style={styles.adminTitle}>Curriculum Control Panel</span>
                    </div>
                    <div style={{...styles.adminControls, flexDirection: isMobile ? 'column' : 'row'}}>
                        <input 
                            style={styles.adminInput} 
                            placeholder="Add New Track (e.g. Next.js 15)..." 
                            value={newCat}
                            onChange={(e) => setNewCat(e.target.value)}
                        />
                        <button onClick={addCategory} style={styles.adminAddBtn}><Plus size={16}/> Create Track</button>
                    </div>
                    <div style={styles.catWrap}>
                        {categories.map(c => (
                            <div key={c._id} style={styles.catChip}>
                                {c.name}
                                <Trash2 size={12} style={styles.trash} onClick={() => archiveCategory(c._id)} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* HERO HEADER */}
            <header style={{...styles.header, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center'}}>
                <div style={styles.headerText}>
                    <div style={styles.topBadge}><Zap size={12} fill="#2563eb" /> 2026 WEB DEVELOPMENT TRACK</div>
                    <h2 style={{...styles.mainTitle, fontSize: isMobile ? '32px' : '42px'}}>Learning <span style={{color:'#2563eb'}}>Hub</span></h2>
                    <p style={styles.subtitle}>Master these modules to unlock "Skill Verified" badges on your profile and get 3x more job invites.</p>
                </div>
                <div style={{...styles.badgeCount, marginTop: isMobile ? '20px' : '0'}}>
                    <ShieldCheck size={20} color="#2563eb" />
                    <span><strong>{courses.length}</strong> Modules Live</span>
                </div>
            </header>

            {/* FILTER ENGINE */}
            <div style={styles.filterBar}>
                <button 
                    onClick={() => setActiveFilter('All')}
                    style={{...styles.filterTab, background: activeFilter === 'All' ? '#2563eb' : '#fff', color: activeFilter === 'All' ? '#fff' : '#64748b'}}
                >
                    All Modules
                </button>
                {categories.map(cat => (
                    <button 
                        key={cat._id}
                        onClick={() => setActiveFilter(cat.name)}
                        style={{...styles.filterTab, background: activeFilter === cat.name ? '#2563eb' : '#fff', color: activeFilter === cat.name ? '#fff' : '#64748b'}}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* MODULE GRID */}
            <div style={{
                ...styles.grid, 
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(auto-fill, minmax(360px, 1fr))'
            }}>
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} style={styles.skeletonCard} />)
                ) : (
                    filteredCourses.map((course, index) => {
                        const isCompleted = userSkills.includes((course.tag || course.category || '').toLowerCase().trim());
                        
                        return (
                            <div 
                                key={course._id || index} 
                                style={{...styles.card, border: isCompleted ? '2px solid #10b981' : '1px solid #f1f5f9'}}
                                onClick={() => onStartCourse(course)}
                            >
                                <div style={styles.imageWrapper}>
                                    <img src={getYouTubeThumb(course.video || course.videoUrl)} alt={course.title} style={styles.image} />
                                    {isCompleted ? (
                                        <div style={styles.completedOverlay}>
                                            <CheckCircle2 size={40} color="#fff" />
                                            <span style={styles.verifiedText}>SKILL VERIFIED</span>
                                        </div>
                                    ) : (
                                        <div style={styles.playOverlay}><Play fill="white" size={24} /></div>
                                    )}
                                    <div style={styles.durationTag}><Clock size={12} /> {course.duration || '25 min'}</div>
                                </div>

                                <div style={styles.content}>
                                    <div style={styles.tagRow}>
                                        <span style={{...styles.tag, background: isCompleted ? '#f0fdf4' : '#eff6ff', color: isCompleted ? '#16a34a' : '#2563eb'}}>
                                            {course.tag || course.category || 'Web Dev'}
                                        </span>
                                        <div style={styles.rating}><Star size={12} fill="#eab308" color="#eab308" /> <span>4.9</span></div>
                                    </div>
                                    
                                    <h3 style={styles.cardTitle}>{course.title}</h3>
                                    <p style={styles.cardDescription}>{course.description}</p>

                                    <button style={{...styles.btn, background: isCompleted ? '#f8fafc' : '#2563eb', color: isCompleted ? '#64748b' : '#fff', border: isCompleted ? '1px solid #e2e8f0' : 'none'}}>
                                        {isCompleted ? 'Review Content' : 'Start Learning Now'} 
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

// --- INITIAL DATA (100+ Videos will load from MongoDB, these are fallback/featured) ---
const featuredContent = [
    { _id: 'f1', title: 'Full Stack Web Development 2026', video: 'https://www.youtube.com/watch?v=QOOLshsQvpY', tag: 'Fullstack', description: 'Comprehensive roadmap for the 2026 tech ecosystem.', duration: '8h 51m' },
    { _id: 'f2', title: 'Modern MERN Architecture', video: 'https://www.youtube.com/watch?v=GxmfcnU3feo', tag: 'MERN', description: 'Deep dive into scalable Node.js patterns for 2026.', duration: '15 min' },
    { _id: 'f3', title: 'Advanced React 19 Patterns', video: 'https://www.youtube.com/watch?v=Zq5fmkH0T78', tag: 'Frontend', description: 'Server components, actions, and modern hydration.', duration: '5h 23m' },
    { _id: 'f4', title: 'Next.js 15 Masterclass', video: 'https://www.youtube.com/watch?v=ek7hmv5PVV8', tag: 'NextJS', description: 'Building production-ready apps with App Router.', duration: '7h 53m' }
];

const styles = {
    container: { maxWidth: '1400px', margin: '0 auto', minHeight: '100vh' },
    adminSection: { background: '#fff', padding: '24px', borderRadius: '24px', marginBottom: '40px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' },
    adminHeader: { display:'flex', alignItems:'center', gap:'8px', marginBottom:'15px' },
    adminTitle: { fontSize:'11px', fontWeight:'900', textTransform:'uppercase', color:'#475569', letterSpacing: '1px' },
    adminControls: { display:'flex', gap:'10px', marginBottom:'15px' },
    adminInput: { flex:1, padding:'14px', borderRadius:'12px', border:'1px solid #e2e8f0', outline:'none', fontSize:'14px' },
    adminAddBtn: { background:'#2563eb', color:'#fff', border:'none', padding:'12px 20px', borderRadius:'12px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', transition: '0.2s' },
    catWrap: { display:'flex', flexWrap:'wrap', gap:'8px' },
    catChip: { background:'#f8fafc', padding:'6px 14px', borderRadius:'10px', fontSize:'12px', fontWeight:'700', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'8px' },
    trash: { color:'#94a3b8', cursor:'pointer' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', gap: '20px' },
    headerText: { flex: 1 },
    topBadge: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '900', color: '#2563eb', marginBottom: '10px', letterSpacing: '1px' },
    mainTitle: { fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1.5px' },
    subtitle: { color: '#64748b', fontSize: '16px', marginTop: '10px', maxWidth: '650px', lineHeight: '1.6' },
    badgeCount: { background: '#fff', padding: '12px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e2e8f0', color: '#1e40af', fontWeight: '800', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    filterBar: { display: 'flex', gap: '10px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' },
    filterTab: { padding: '10px 24px', borderRadius: '50px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', transition: '0.3s' },
    grid: { display: 'grid', gap: '30px' },
    card: { background: '#fff', borderRadius: '32px', overflow: 'hidden', transition: '0.3s transform', cursor: 'pointer', position: 'relative', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' },
    imageWrapper: { position: 'relative', height: '210px', background: '#0f172a' },
    image: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 },
    playOverlay: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#2563eb', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)' },
    completedOverlay: { position: 'absolute', inset: 0, background: 'rgba(16, 185, 129, 0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    verifiedText: { fontWeight:'900', fontSize:'11px', marginTop:'8px', color: '#fff', letterSpacing:'1px' },
    durationTag: { position: 'absolute', bottom: '15px', right: '15px', background: 'rgba(15, 23, 42, 0.85)', color: '#fff', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' },
    content: { padding: '26px' },
    tagRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' },
    tag: { fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '50px' },
    rating: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '800', color: '#334155' },
    cardTitle: { fontSize: '22px', fontWeight: '800', margin: '0 0 10px 0', color: '#0f172a', lineHeight: '1.3' },
    cardDescription: { fontSize: '14px', color: '#64748b', marginBottom: '25px', lineHeight: '1.5', height: '42px', overflow: 'hidden' },
    btn: { width: '100%', padding: '16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '900', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s' },
    skeletonCard: { height: '450px', background: '#f8fafc', borderRadius: '32px', border: '1px solid #f1f5f9' }
};