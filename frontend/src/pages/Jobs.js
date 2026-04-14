import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
    Plus, Search, MapPin, Filter, ChevronDown, XCircle, Clock, Sparkles, Briefcase, Globe, Zap, ExternalLink
} from 'lucide-react';

const BDJOBS_CATEGORIES = [
    "IT & Telecommunication", "Accounting/Finance", "Engineer/Architects", 
    "Marketing/Sales", "Medical/Pharma", "Education/Training", "Creative Design"
];

const SOCKET_URL = window.location.hostname === 'localhost' 
    ? "http://localhost:5000" 
    : "https://talent-bd-backend.onrender.com";

const API_BASE = `${SOCKET_URL}/api`;

export default function Jobs({ user, setView, setSelectedJob }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Sectors');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    
    const suggestionRef = useRef(null);
    const dropdownRef = useRef(null);
    const socket = useRef(null);

    const isAdmin = user?.role === 'admin';

    // --- 1. REAL-TIME CIRCULAR ENGINE ---
    useEffect(() => {
        socket.current = io(SOCKET_URL);

        socket.current.on('receive_job_alert', (newJob) => {
            const matchesFilter = selectedCategory === 'All Sectors' || newJob.category === selectedCategory;
            
            if (matchesFilter) {
                // Play subtle alert sound if available
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
                audio.play().catch(() => {}); // Catch browser auto-play blocks

                // Haptic feedback for mobile
                if (navigator.vibrate) navigator.vibrate(50);

                const jobWithFlag = { ...newJob, isJustPosted: true };
                setJobs(prev => [jobWithFlag, ...prev]);

                // Remove the "New" highlight after 10 seconds
                setTimeout(() => {
                    setJobs(currentJobs => 
                        currentJobs.map(j => j._id === newJob._id ? { ...j, isJustPosted: false } : j)
                    );
                }, 10000);
            }
        });

        return () => socket.current.disconnect();
    }, [selectedCategory]);

    // --- 2. UI LIFECYCLE ---
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // --- 3. DATA SYNC ---
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await axios.get(`${API_BASE}/categories?group=job`);
                setCategories(res.data.categories.length > 0 ? res.data.categories : BDJOBS_CATEGORIES.map(n => ({ name: n })));
            } catch (err) { setCategories(BDJOBS_CATEGORIES.map(n => ({ name: n }))); }
        };
        fetchCats();
    }, []);

    const fetchLiveJobs = useCallback(async () => {
        setLoading(true);
        try {
            const params = { isLive: 'true' };
            if (searchQuery.trim()) params.search = searchQuery.trim();
            if (locationQuery.trim()) params.location = locationQuery.trim();
            if (selectedCategory !== 'All Sectors') params.category = selectedCategory;

            const res = await axios.get(`${API_BASE}/jobs`, { params });
            setJobs(res.data.jobs || []);
        } catch (err) { setJobs([]); }
        finally { setLoading(false); }
    }, [searchQuery, locationQuery, selectedCategory]);

    useEffect(() => {
        const timer = setTimeout(fetchLiveJobs, 400);
        return () => clearTimeout(timer);
    }, [fetchLiveJobs]);

    const handleViewDetails = (job) => {
        // Handle External Jobs (Like the Circular App)
        if (job.externalUrl) {
            window.open(job.externalUrl, '_blank');
        } else {
            setSelectedJob(job);
            setView('job-detail');
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <header style={{
                ...styles.header, 
                flexDirection: isMobile ? 'column' : 'row', 
                alignItems: isMobile ? 'flex-start' : 'center'
            }}>
                <div>
                    <div style={styles.liveIndicator}>
                        <div className="pulse-dot" style={styles.pulseDot} />
                        <span style={styles.liveText}>LIVE CIRCULAR FEED</span>
                    </div>
                    <h1 style={styles.mainTitle}>Career <span style={{color: '#2563eb'}}>Opportunities</span></h1>
                </div>
                {isAdmin && (
                    <button onClick={() => setView('admin-post')} style={{...styles.postBtn, width: isMobile ? '100%' : 'auto'}}>
                        <Plus size={18} /> Post a Job
                    </button>
                )}
            </header>

            <div style={styles.filterSection}>
                <div style={{...styles.searchBar, flexDirection: isMobile ? 'column' : 'row'}}>
                    <div style={{...styles.dropdownWrapper, width: isMobile ? '100%' : '240px'}} ref={dropdownRef}>
                        <button style={styles.dropdownBtn} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            <Filter size={16} color="#2563eb" />
                            <span style={styles.dropdownText}>{selectedCategory}</span>
                            <ChevronDown size={16} style={{transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s'}}/>
                        </button>
                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={styles.dropdownMenu}>
                                    <button onClick={() => { setSelectedCategory('All Sectors'); setIsDropdownOpen(false); }} style={styles.menuItem}>All Sectors</button>
                                    {categories.map((cat, idx) => (
                                        <button key={idx} onClick={() => { setSelectedCategory(cat.name); setIsDropdownOpen(false); }} style={styles.menuItem}>
                                            {cat.name}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {!isMobile && <div style={styles.divider} />}

                    <div style={styles.inputGroup}>
                        <Search size={18} color="#94a3b8" />
                        <input 
                            style={styles.input} 
                            placeholder="Job title, company..." 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                        />
                    </div>
                </div>
            </div>

            <div style={{...styles.grid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(380px, 1fr))'}}>
                <AnimatePresence mode='popLayout'>
                    {jobs.length > 0 ? (
                        jobs.map(job => (
                            <motion.div 
                                layout 
                                initial={{opacity:0, scale: 0.9}} 
                                animate={{opacity:1, scale: 1}} 
                                exit={{opacity: 0}}
                                key={job._id} 
                                style={{
                                    ...styles.jobCard,
                                    border: job.isJustPosted ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                    boxShadow: job.isJustPosted ? '0 10px 20px rgba(37, 99, 235, 0.1)' : 'none'
                                }}
                            >
                                {job.isJustPosted && (
                                    <div style={styles.newBadge}>
                                        <Zap size={10} fill="currentColor" /> JUST NOW
                                    </div>
                                )}
                                <div style={styles.cardHeader}>
                                    <div style={styles.logo}><Briefcase size={22}/></div>
                                    <div style={{flex: 1}}>
                                        <h3 style={styles.title}>{job.title}</h3>
                                        <p style={styles.company}>{job.company}</p>
                                    </div>
                                    <div style={styles.salaryTag}>{job.salary || 'Negotiable'}</div>
                                </div>
                                <div style={styles.meta}>
                                    <span style={styles.metaItem}><MapPin size={14}/> {job.location}</span>
                                    <span style={styles.metaItem}><Clock size={14}/> {new Date(job.deadline).toLocaleDateString('en-GB')}</span>
                                </div>
                                <button 
                                    style={{
                                        ...styles.applyBtn,
                                        background: job.externalUrl ? '#4f46e5' : '#0f172a'
                                    }} 
                                    onClick={() => handleViewDetails(job)}
                                >
                                    {job.externalUrl ? (
                                        <span style={{display: 'flex', alignItems:'center', justifyContent:'center', gap: '8px'}}>
                                            Apply via External Source <ExternalLink size={14}/>
                                        </span>
                                    ) : 'View Details & Apply'}
                                </button>
                            </motion.div>
                        ))
                    ) : !loading && (
                        <div style={styles.empty}>
                            <XCircle size={50} color="#cbd5e1" />
                            <h3 style={{marginTop: '15px'}}>No Active Circulars Found</h3>
                        </div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Animation for the pulse dot */}
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .pulse-dot { animation: pulse 2s infinite ease-in-out; }
            `}</style>
        </div>
    );
}

const styles = {
    pageWrapper: { maxWidth: '1250px', margin: '0 auto', padding: '20px', minHeight: '100vh', backgroundColor: '#f8fafc' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '35px', gap: '20px' },
    liveIndicator: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
    pulseDot: { width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' },
    liveText: { fontSize: '11px', fontWeight: '900', color: '#ef4444', letterSpacing: '1px' },
    mainTitle: { fontSize: '32px', fontWeight: '800', margin: 0, color: '#0f172a' },
    filterSection: { marginBottom: '40px' },
    searchBar: { display: 'flex', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    dropdownWrapper: { position: 'relative' },
    dropdownBtn: { width: '100%', height: '54px', display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', border: 'none', padding: '0 20px', borderRadius: '18px', cursor: 'pointer', fontWeight: '700', color: '#1e293b' },
    dropdownText: { flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' },
    dropdownMenu: { position: 'absolute', top: '65px', left: 0, width: '100%', background: '#fff', borderRadius: '18px', boxShadow: '0 20px 25px rgba(0,0,0,0.1)', zIndex: 100, border: '1px solid #e2e8f0', padding: '10px' },
    menuItem: { width: '100%', padding: '12px 15px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#475569' },
    inputGroup: { flex: 2, display: 'flex', alignItems: 'center', gap: '12px', padding: '0 15px' },
    input: { width: '100%', border: 'none', outline: 'none', fontSize: '15px', color: '#1e293b', background: 'transparent' },
    divider: { width: '1px', height: '30px', background: '#e2e8f0' },
    grid: { display: 'grid', gap: '25px' },
    jobCard: { background: '#fff', padding: '26px', borderRadius: '28px', position: 'relative', transition: 'all 0.4s ease' },
    newBadge: { position: 'absolute', top: '-12px', right: '20px', background: '#2563eb', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px' },
    cardHeader: { display: 'flex', gap: '16px', marginBottom: '18px' },
    logo: { width: '52px', height: '52px', background: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' },
    title: { margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', lineHeight: 1.2 },
    company: { margin: '4px 0 0', color: '#64748b', fontSize: '14px', fontWeight: '600' },
    salaryTag: { background: '#ecfdf5', color: '#059669', padding: '5px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '800' },
    meta: { borderTop: '1px solid #f1f5f9', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: '500' },
    applyBtn: { width: '100%', color: '#fff', border: 'none', padding: '15px', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', transition: '0.2s' },
    postBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
    empty: { gridColumn: '1/-1', textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '20px' }
};