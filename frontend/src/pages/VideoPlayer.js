import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Play, CheckCircle, AlertCircle, Award, ArrowRight, Trophy,
    ShieldCheck, Smartphone, Monitor, Layers, Plus, Trash2, Settings
} from 'lucide-react';

const VideoPlayer = ({ course, user, setView, onVerify }) => {
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [error, setError] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    
    // Admin State for Category Sync
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState('');
    const isAdmin = user?.role === 'admin' || user?.email === 'admin@talentbd.com';

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        window.addEventListener('resize', handleResize);
        if (isAdmin) fetchCategories();
        return () => window.removeEventListener('resize', handleResize);
    }, [isAdmin]);

    // --- ADMIN CATEGORY SYNC ---
    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data);
        } catch (err) { console.warn("Backend offline, using local state."); }
    };

    const addCategory = async () => {
        if (!newCat) return;
        try {
            await axios.post('http://localhost:5000/api/admin/categories', { name: newCat, group: 'global' });
            setNewCat('');
            fetchCategories();
        } catch (err) { alert("Sync failed."); }
    };

    const deleteCategory = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/admin/categories/${id}`);
            fetchCategories();
        } catch (err) { console.error(err); }
    };

    const getEmbedUrl = (url) => {
        if (!url) return "";
        let videoId = "";
        try {
            if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0];
            else if (url.includes('be/')) videoId = url.split('be/')[1]?.split('?')[0];
            else if (url.includes('embed/')) return url;
            else videoId = url; 
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        } catch (e) { return url; }
    };

    if (!course) {
        return (
            <div style={vStyles.errorContainer}>
                <AlertCircle size={48} color="#ef4444" />
                <h2 style={{fontWeight: '900', marginTop: '20px'}}>Module Not Found</h2>
                <button onClick={() => setView('learning')} style={vStyles.backBtn}>Return to Hub</button>
            </div>
        );
    }

    const activeQuiz = course.quiz || [
        { question: `Ready to verify ${course.skillTag || 'Skill'}?`, options: ["Yes, I'm ready", "Not yet"], correctAnswer: 0 }
    ];

    const handleAnswer = () => {
        const correctIdx = activeQuiz[currentQuestion].correctAnswer;
        if (selectedOption === correctIdx) {
            if (currentQuestion + 1 < activeQuiz.length) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedOption(null);
                setError(false);
            } else {
                setIsFinished(true);
                if (onVerify) onVerify(course.skillTag || course.tag, 100, 50);
            }
        } else { setError(true); }
    };

    return (
        <div style={{...vStyles.wrapper, padding: isMobile ? '15px' : '30px'}}>
            
            {/* 1. ADMIN CATEGORY ARCHITECT (Visible during verification for context) */}
            {isAdmin && (
                <div style={vStyles.adminPanel}>
                    <div style={vStyles.adminHeader}>
                        <Settings size={14} color="#2563eb" /> 
                        <span style={vStyles.adminTitle}>Global Category Sync</span>
                    </div>
                    <div style={{...vStyles.adminRow, flexDirection: isMobile ? 'column' : 'row'}}>
                        <input 
                            style={vStyles.adminInput} 
                            placeholder="Add System Category..." 
                            value={newCat}
                            onChange={(e) => setNewCat(e.target.value)}
                        />
                        <button onClick={addCategory} style={vStyles.adminAddBtn}><Plus size={14}/> Add</button>
                    </div>
                    <div style={vStyles.catScroll}>
                        {categories.map(c => (
                            <div key={c._id} style={vStyles.catTag}>
                                {c.name} <Trash2 size={10} onClick={() => deleteCategory(c._id)} style={{cursor:'pointer', color:'#ef4444'}} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <header style={{...vStyles.header, flexDirection: isMobile ? 'column' : 'row'}}>
                <button onClick={() => setView('learning')} style={vStyles.backLink}>
                    <ArrowRight size={16} style={{transform: 'rotate(180deg)'}} /> Back
                </button>
                <div style={{flex: 1}}>
                    <h1 style={{...vStyles.title, fontSize: isMobile ? '22px' : '28px'}}>{course.title}</h1>
                    <div style={vStyles.badge}><ShieldCheck size={14} /> VERIFICATION ACTIVE</div>
                </div>
            </header>

            <div style={{...vStyles.mainGrid, gridTemplateColumns: isMobile ? '1fr' : '1.8fr 1fr'}}>
                {/* VIDEO PLAYER SECTION */}
                <div style={vStyles.videoSection}>
                    <div style={vStyles.videoWrapper}>
                        <iframe src={getEmbedUrl(course.video || course.videoUrl)} title="Course" frameBorder="0" allowFullScreen style={vStyles.iframe}></iframe>
                    </div>
                    <div style={vStyles.description}>
                        <div style={vStyles.moduleIndicator}><Monitor size={14} /> Module v1.0</div>
                        <h3 style={{margin: '10px 0', fontSize: '20px', fontWeight: '800'}}>About this Skill</h3>
                        <p style={vStyles.descText}>{course.description || "Master these fundamentals to unlock premium gigs."}</p>
                    </div>
                </div>

                {/* ASSESSMENT SECTION */}
                <div style={{...vStyles.quizSection, marginTop: isMobile ? '20px' : '0'}}>
                    {!quizStarted ? (
                        <div style={vStyles.quizCard}>
                            <div style={vStyles.iconCircle}><Award size={32} color="#2563eb" /></div>
                            <h2 style={{margin: '20px 0 10px'}}>Certify Skill</h2>
                            <p style={vStyles.quizHint}>Complete the quiz to earn <b>100 XP</b> and <b>$50</b>.</p>
                            <button onClick={() => setQuizStarted(true)} style={vStyles.startBtn}>Start Assessment</button>
                        </div>
                    ) : isFinished ? (
                        <div style={vStyles.successCard}>
                            <Trophy size={48} color="#fff" />
                            <h2 style={{margin: '20px 0 10px'}}>Verified!</h2>
                            <div style={vStyles.rewardRow}>
                                <div style={vStyles.rewardItem}><span style={vStyles.rewardVal}>+$50</span><span style={vStyles.rewardLab}>Wallet</span></div>
                                <div style={vStyles.rewardItem}><span style={vStyles.rewardVal}>+100</span><span style={vStyles.rewardLab}>XP</span></div>
                            </div>
                            <button onClick={() => setView('dashboard')} style={vStyles.dashboardBtn}>Claim Rewards</button>
                        </div>
                    ) : (
                        <div style={vStyles.quizCard}>
                            <div style={vStyles.quizHeader}>
                                <span style={vStyles.qCount}>Question {currentQuestion + 1}</span>
                                <div style={vStyles.miniProgress}><div style={{...vStyles.miniBar, width: `${((currentQuestion + 1) / activeQuiz.length) * 100}%`}} /></div>
                            </div>
                            <h3 style={vStyles.questionText}>{activeQuiz[currentQuestion].question}</h3>
                            <div style={vStyles.optionsList}>
                                {activeQuiz[currentQuestion].options.map((opt, idx) => (
                                    <button key={idx} onClick={() => {setSelectedOption(idx); setError(false);}} style={selectedOption === idx ? vStyles.optionBtnActive : vStyles.optionBtn}>
                                        <div style={selectedOption === idx ? vStyles.radioActive : vStyles.radio} /> {opt}
                                    </button>
                                ))}
                            </div>
                            {error && <div style={vStyles.errorMsg}>Incorrect. Try again!</div>}
                            <button onClick={handleAnswer} disabled={selectedOption === null} style={selectedOption === null ? vStyles.nextBtnDisabled : vStyles.nextBtn}>Next Step</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const vStyles = {
    wrapper: { maxWidth: '1280px', margin: '0 auto' },
    adminPanel: { background: '#f8fafc', padding: '15px', borderRadius: '18px', marginBottom: '25px', border: '1px dashed #cbd5e1' },
    adminHeader: { display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' },
    adminTitle: { fontSize:'10px', fontWeight:'900', textTransform:'uppercase', color:'#64748b' },
    adminRow: { display:'flex', gap:'8px' },
    adminInput: { flex:1, padding:'10px', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'13px' },
    adminAddBtn: { background:'#0f172a', color:'#fff', border:'none', padding:'0 15px', borderRadius:'8px', fontWeight:'bold', fontSize:'12px', cursor:'pointer' },
    catScroll: { display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'10px' },
    catTag: { background:'#fff', padding:'4px 10px', borderRadius:'6px', fontSize:'11px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'5px', fontWeight:'700' },
    
    header: { marginBottom: '30px', display: 'flex', gap: '20px' },
    backLink: { background: '#fff', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: '14px', cursor: 'pointer', fontWeight: '800', display:'flex', alignItems:'center', gap:'8px' },
    title: { margin: 0, fontWeight: '900', color: '#0f172a' },
    badge: { background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '50px', fontSize: '11px', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px' },
    mainGrid: { display: 'grid', gap: '30px' },
    videoSection: { background: '#fff', borderRadius: '28px', overflow: 'hidden', border: '1px solid #e2e8f0' },
    videoWrapper: { position: 'relative', paddingBottom: '56.25%', background: '#000' },
    iframe: { position: 'absolute', width: '100%', height: '100%' },
    description: { padding: '30px' },
    moduleIndicator: { fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display:'flex', alignItems:'center', gap:'5px' },
    descText: { color: '#64748b', lineHeight: '1.6', fontSize: '15px' },
    quizSection: { position: 'relative' },
    quizCard: { background: '#fff', padding: '30px', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' },
    iconCircle: { width: '60px', height: '60px', background: '#eff6ff', borderRadius: '18px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto' },
    quizHint: { color: '#64748b', fontSize: '14px', marginBottom: '25px' },
    startBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '16px 25px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    successCard: { background: '#0f172a', color: '#fff', padding: '40px 20px', borderRadius: '28px', textAlign: 'center' },
    rewardRow: { display: 'flex', gap: '10px', margin: '25px 0' },
    rewardItem: { background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '15px', flex: 1 },
    rewardVal: { fontSize: '20px', fontWeight: '900', color: '#10b981', display: 'block' },
    rewardLab: { fontSize: '10px', opacity: 0.6, fontWeight: '800' },
    dashboardBtn: { background: '#fff', color: '#0f172a', border: 'none', padding: '15px 30px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    quizHeader: { marginBottom: '20px', textAlign: 'left' },
    qCount: { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform:'uppercase' },
    miniProgress: { height: '6px', background: '#f1f5f9', borderRadius: '10px', marginTop: '8px', overflow:'hidden' },
    miniBar: { height: '100%', background: '#2563eb', transition: 'width 0.4s' },
    questionText: { fontWeight: '800', textAlign: 'left', marginBottom: '20px' },
    optionsList: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
    optionBtn: { padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:'12px', fontSize:'14px' },
    optionBtnActive: { padding: '16px', borderRadius: '14px', border: '2px solid #2563eb', background: '#eff6ff', color: '#1e40af', textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:'12px', fontSize:'14px', fontWeight:'700' },
    radio: { width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #cbd5e1' },
    radioActive: { width: '18px', height: '18px', borderRadius: '50%', border: '5px solid #2563eb', background: '#fff' },
    nextBtn: { background: '#0f172a', color: '#fff', width: '100%', padding: '16px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: '900' },
    nextBtnDisabled: { background: '#f1f5f9', color: '#94a3b8', width: '100%', padding: '16px', borderRadius: '14px', cursor: 'not-allowed' },
    errorMsg: { color: '#be123c', fontSize: '12px', fontWeight: '800', marginBottom: '15px' },
    errorContainer: { textAlign:'center', padding:'100px 20px' },
    backBtn: { background:'#2563eb', color:'#fff', border:'none', padding:'12px 25px', borderRadius:'10px', marginTop:'20px', cursor:'pointer' }
};

export default VideoPlayer;