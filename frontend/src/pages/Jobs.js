import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
    Plus, Search, MapPin, Filter, ChevronDown, XCircle, Clock, Sparkles, Briefcase, Globe
} from 'lucide-react';

const BDJOBS_CATEGORIES = [
    "IT & Telecommunication", "Accounting/Finance", "Engineer/Architects", 
    "Marketing/Sales", "Medical/Pharma", "Education/Training", "Creative Design"
];

const SMART_SUGGESTIONS = [
    "Web Development", "React Developer", "MERN Stack", "Frontend Engineer",
    "Graphics Design", "Digital Marketing", "Python Django", "Dhaka", "Remote"
];

const API_BASE = 'http://localhost:5000/api';

export default function Jobs({ user, setView, setSelectedJob }) { // Added setSelectedJob prop
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Sectors');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    const suggestionRef = useRef(null);
    const dropdownRef = useRef(null);

    const isAdmin = user?.role === 'admin';

    // 1. UI LIFECYCLE
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
            if (suggestionRef.current && !suggestionRef.current.contains(e.target)) setShowSuggestions(false);
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 2. CATEGORY SYNC: Matches your new backend /api/categories endpoint
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await axios.get(`${API_BASE}/categories?group=job`);
                const data = res.data.categories || [];
                setCategories(data.length > 0 ? data : BDJOBS_CATEGORIES.map(n => ({ name: n })));
            } catch (err) {
                setCategories(BDJOBS_CATEGORIES.map(n => ({ name: n })));
            }
        };
        fetchCats();
    }, []);

    // 3. JOB ENGINE: Fetch logic mapped to optimized Express route
    const fetchLiveJobs = useCallback(async () => {
        setLoading(true);
        try {
            const params = { isLive: 'true' };
            if (searchQuery.trim()) params.search = searchQuery.trim();
            if (locationQuery.trim()) params.location = locationQuery.trim();
            if (selectedCategory !== 'All Sectors') params.category = selectedCategory;

            const res = await axios.get(`${API_BASE}/jobs`, { params });
            setJobs(res.data.jobs || []);
        } catch (err) {
            console.error("TalentBD Engine Sync Failed:", err);
            setJobs([]);
        } finally { setLoading(false); }
    }, [searchQuery, locationQuery, selectedCategory]);

    // 4. DEBOUNCED SEARCH
    useEffect(() => {
        const timer = setTimeout(fetchLiveJobs, 400);
        return () => clearTimeout(timer);
    }, [fetchLiveJobs]);

    // 5. SEARCH SUGGESTIONS OVERLAY
    useEffect(() => {
        if (searchQuery.length > 1) {
            const filtered = SMART_SUGGESTIONS.filter(s => 
                s.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else { setShowSuggestions(false); }
    }, [searchQuery]);

    const handleViewDetails = (job) => {
        setSelectedJob(job);
        setView('job-detail');
    };

    return (
        <div style={styles.pageWrapper}>
            <header style={{...styles.header, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '15px' : '0'}}>
                <div>
                    <h1 style={styles.mainTitle}>Career <span style={{color: '#2563eb'}}>Opportunities</span></h1>
                    <p style={styles.subtitle}>Verified Professional Job Board 2026</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setView('admin-post')} style={{...styles.postBtn, width: isMobile ? '100%' : 'auto'}}>
                        <Plus size={18} /> Post a Job
                    </button>
                )}
            </header>

            {/* Filter Section */}
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
                                    <button onClick={() => { setSelectedCategory('All Sectors'); setIsDropdownOpen(false); }} style={styles.menuItem}>
                                        <Globe size={14} style={{marginRight: '8px'}}/> All Sectors
                                    </button>
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

                    <div style={{...styles.inputGroup, position: 'relative'}} ref={suggestionRef}>
                        <Search size={18} color="#94a3b8" />
                        <input 
                            style={styles.input} 
                            placeholder="Search Job Title..." 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                        />
                        {showSuggestions && (
                            <div style={styles.suggestionBox}>
                                {suggestions.map((s, i) => (
                                    <div key={i} style={styles.suggestionItem} onClick={() => {setSearchQuery(s); setShowSuggestions(false);}}>
                                        <Sparkles size={14} color="#2563eb" /> {s}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {!isMobile && <div style={styles.divider} />}

                    <div style={styles.inputGroup}>
                        <MapPin size={18} color="#94a3b8" />
                        <input 
                            style={styles.input} 
                            placeholder="City or Remote" 
                            value={locationQuery} 
                            onChange={(e) => setLocationQuery(e.target.value)} 
                        />
                    </div>
                </div>
            </div>

            {/* Jobs Display Grid */}
            <div style={{...styles.grid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(380px, 1fr))'}}>
                {loading ? (
                    <div style={styles.msg}>
                        <motion.div animate={{rotate: 360}} transition={{repeat: Infinity, duration: 1, ease:'linear'}}>📡</motion.div> 
                        Syncing Career Radar...
                    </div>
                ) : jobs.length > 0 ? (
                    jobs.map(job => (
                        <motion.div layout initial={{opacity:0, y: 15}} animate={{opacity:1, y: 0}} key={job._id} style={styles.jobCard}>
                            <div style={styles.cardHeader}>
                                <div style={styles.logo}><Briefcase size={22}/></div>
                                <div style={{flex: 1}}>
                                    <h3 style={styles.title}>{job.title}</h3>
                                    <p style={styles.company}>{job.company}</p>
                                </div>
                                <div style={styles.salaryTag}>{job.salary || 'Negotiable'}</div>
                            </div>
                            <div style={styles.badgeContainer}>
                                <div style={styles.categoryBadge}>{job.category}</div>
                                {job.isRemote && <div style={styles.remoteBadge}><Globe size={10}/> Remote</div>}
                            </div>
                            <div style={styles.meta}>
                                <span style={styles.metaItem}><MapPin size={14}/> {job.location}</span>
                                <span style={styles.metaItem}><Clock size={14}/> Deadline: {new Date(job.deadline).toLocaleDateString('en-GB')}</span>
                            </div>
                            <button style={styles.applyBtn} onClick={() => handleViewDetails(job)}>
                                View Details & Apply
                            </button>
                        </motion.div>
                    ))
                ) : (
                    <div style={styles.empty}>
                        <XCircle size={50} color="#cbd5e1" />
                        <h3 style={{margin: '15px 0 5px', color: '#1e293b'}}>No Vacancies Found</h3>
                        <p style={{color: '#94a3b8', fontSize: '14px', marginBottom: '20px'}}>
                            Try adjusting your filters or search terms.
                        </p>
                        <button onClick={() => {setSelectedCategory('All Sectors'); setSearchQuery(''); setLocationQuery('');}} style={styles.resetBtn}>Reset Search</button>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    pageWrapper: { maxWidth: '1250px', margin: '0 auto', padding: '20px', minHeight: '100vh', backgroundColor: '#f8fafc' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '35px' },
    mainTitle: { fontSize: '32px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px', color: '#0f172a' },
    subtitle: { color: '#64748b', margin: '5px 0 0', fontWeight: '500', fontSize: '15px' },
    filterSection: { marginBottom: '40px' },
    searchBar: { display: 'flex', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' },
    dropdownWrapper: { position: 'relative' },
    dropdownBtn: { width: '100%', height: '54px', display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', border: 'none', padding: '0 20px', borderRadius: '18px', cursor: 'pointer', fontWeight: '700', color: '#1e293b' },
    dropdownText: { flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    dropdownMenu: { position: 'absolute', top: '65px', left: 0, width: '100%', minWidth: '250px', background: '#fff', borderRadius: '18px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', zIndex: 100, border: '1px solid #e2e8f0', padding: '10px' },
    menuItem: { width: '100%', padding: '12px 15px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#475569' },
    inputGroup: { flex: 2, display: 'flex', alignItems: 'center', gap: '12px', padding: '0 15px' },
    input: { width: '100%', border: 'none', outline: 'none', fontSize: '15px', fontWeight: '500', color: '#1e293b', background: 'transparent' },
    divider: { width: '1px', height: '30px', background: '#e2e8f0' },
    suggestionBox: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0', zIndex: 110, marginTop: '10px', overflow: 'hidden', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' },
    suggestionItem: { padding: '12px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', borderBottom: '1px solid #f1f5f9', fontWeight: '500' },
    grid: { display: 'grid', gap: '25px' },
    jobCard: { background: '#fff', padding: '26px', borderRadius: '28px', border: '1px solid #e2e8f0', transition: '0.3s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' },
    cardHeader: { display: 'flex', gap: '16px', marginBottom: '18px' },
    logo: { width: '52px', height: '52px', background: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' },
    title: { margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' },
    company: { margin: '4px 0 0', color: '#64748b', fontSize: '14px', fontWeight: '600' },
    salaryTag: { background: '#ecfdf5', color: '#059669', padding: '5px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', height: 'fit-content' },
    badgeContainer: { display: 'flex', gap: '8px', marginBottom: '20px' },
    categoryBadge: { background: '#f1f5f9', padding: '6px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' },
    remoteBadge: { background: '#e0f2fe', padding: '6px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: '800', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' },
    meta: { borderTop: '1px solid #f1f5f9', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: '500' },
    applyBtn: { width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '15px', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', transition: '0.2s', fontSize: '14px' },
    postBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
    msg: { gridColumn: '1/-1', textAlign: 'center', padding: '100px 0', color: '#94a3b8', fontSize: '16px', fontWeight: '600' },
    empty: { gridColumn: '1/-1', textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '30px', border: '2px dashed #cbd5e1' },
    resetBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', marginTop: '10px' }
};