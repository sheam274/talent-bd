import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Play, 
    CheckCircle, 
    AlertCircle, 
    Award, 
    ArrowRight, 
    Trophy,
    ShieldCheck,
    Smartphone,
    Monitor
} from 'lucide-react';

const VideoPlayer = ({ course, user, setView, onVerify }) => {
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [error, setError] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    // Responsive Tracker
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getEmbedUrl = (url) => {
        if (!url) return "";
        let videoId = "";
        try {
            if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0];
            else if (url.includes('be/')) videoId = url.split('be/')[1]?.split('?')[0];
            else if (url.includes('embed/')) return url;
            else videoId = url; 
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        } catch (e) {
            return url;
        }
    };

    if (!course) {
        return (
            <div style={vStyles.errorContainer}>
                <AlertCircle size={48} color="#ef4444" />
                <h2 style={{fontWeight: '900', marginTop: '20px'}}>Verification Module Not Found</h2>
                <button onClick={() => setView('learning')} style={vStyles.backBtn}>Return to Hub</button>
            </div>
        );
    }

    const activeQuiz = course.quiz || [
        { 
            question: `Are you ready to verify your ${course.skillTag || 'Skill'}?`, 
            options: ["Yes, I watched the video", "No, not yet"], 
            correctAnswer: 0 
        }
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
                // SYNC: Pushes data to parent state (points + wallet)
                if (onVerify) {
                    onVerify(course.skillTag || course.tag, 100, 50);
                }
            }
        } else {
            setError(true);
        }
    };

    return (
        <div style={{
            ...vStyles.wrapper, 
            padding: isMobile ? '15px' : '30px'
        }}>
            <header style={{
                ...vStyles.header,
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center'
            }}>
                <button onClick={() => setView('learning')} style={vStyles.backLink}>
                    <ArrowRight size={16} style={{transform: 'rotate(180deg)'}} /> Back to Learning
                </button>
                <div style={{flex: 1}}>
                    <h1 style={{...vStyles.title, fontSize: isMobile ? '22px' : '28px'}}>{course.title}</h1>
                    <div style={vStyles.badge}>
                        <ShieldCheck size={14} /> {(course.skillTag || course.tag || 'Skill').toUpperCase()} VERIFICATION
                    </div>
                </div>
            </header>

            <div style={{
                ...vStyles.mainGrid,
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1.8fr)) 1fr'
            }}>
                {/* 1. VIDEO SECTION */}
                <div style={vStyles.videoSection}>
                    <div style={vStyles.videoWrapper}>
                        <iframe
                            src={getEmbedUrl(course.video || course.videoUrl)}
                            title="Course Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={vStyles.iframe}
                        ></iframe>
                    </div>
                    <div style={{...vStyles.description, padding: isMobile ? '20px' : '30px'}}>
                        <div style={vStyles.moduleIndicator}>
                            <Monitor size={14} /> <span>Official Curriculum v1.0</span>
                        </div>
                        <h3 style={{margin: '10px 0 10px 0', fontSize: '20px', fontWeight: '800'}}>Module Overview</h3>
                        <p style={{color: '#64748b', lineHeight: '1.6', margin: 0, fontSize: '15px'}}>
                            {course.description || "Master the core fundamentals of this skill through our verified curriculum."}
                        </p>
                    </div>
                </div>

                {/* 2. QUIZ & REWARD SECTION */}
                <div style={{
                    ...vStyles.quizSection,
                    position: isMobile ? 'static' : 'sticky',
                    marginTop: isMobile ? '20px' : '0'
                }}>
                    {!quizStarted ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={vStyles.quizCard}>
                            <div style={vStyles.iconCircle}><Award size={32} color="#2563eb" /></div>
                            <h2 style={{margin: '20px 0 10px 0', fontWeight: '900'}}>Ready to Certify?</h2>
                            <p style={{color: '#64748b', fontSize: '14px', marginBottom: '25px', lineHeight: '1.5'}}>
                                Complete the assessment to earn <b style={{color: '#0f172a'}}>100 XP</b> and 
                                unlock your <b style={{color: '#16a34a'}}>$50</b> reward.
                            </p>
                            <button onClick={() => setQuizStarted(true)} style={vStyles.startBtn}>
                                Start Assessment <Play size={14} fill="currentColor" />
                            </button>
                        </motion.div>
                    ) : isFinished ? (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={vStyles.successCard}>
                            <div style={vStyles.successIcon}><Trophy size={48} color="#fff" /></div>
                            <h2 style={{fontSize: '26px', fontWeight: '900', margin: '20px 0 5px'}}>Skill Verified!</h2>
                            <p style={{opacity: 0.8, fontSize: '14px', marginBottom: '25px'}}>You've officially earned the <b>{course.skillTag || course.tag}</b> badge.</p>
                            
                            <div style={vStyles.rewardRow}>
                                <div style={vStyles.rewardItem}>
                                    <span style={vStyles.rewardVal}>+$50</span>
                                    <span style={vStyles.rewardLab}>Wallet</span>
                                </div>
                                <div style={vStyles.rewardItem}>
                                    <span style={vStyles.rewardVal}>+100</span>
                                    <span style={vStyles.rewardLab}>XP</span>
                                </div>
                            </div>

                            <button onClick={() => setView('dashboard')} style={vStyles.dashboardBtn}>
                                Claim Rewards <CheckCircle size={18} />
                            </button>
                        </motion.div>
                    ) : (
                        <div style={{...vStyles.quizCard, padding: isMobile ? '25px' : '35px'}}>
                            <div style={vStyles.quizHeader}>
                                <span style={vStyles.qCount}>Step {currentQuestion + 1} of {activeQuiz.length}</span>
                                <div style={vStyles.miniProgress}>
                                    <div style={{...vStyles.miniBar, width: `${((currentQuestion + 1) / activeQuiz.length) * 100}%`}} />
                                </div>
                            </div>
                            
                            <h3 style={{...vStyles.questionText, fontSize: isMobile ? '16px' : '18px'}}>{activeQuiz[currentQuestion].question}</h3>
                            
                            <div style={vStyles.optionsList}>
                                {activeQuiz[currentQuestion].options.map((option, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => { setSelectedOption(idx); setError(false); }}
                                        style={selectedOption === idx ? vStyles.optionBtnActive : vStyles.optionBtn}
                                    >
                                        <div style={selectedOption === idx ? vStyles.radioActive : vStyles.radio} />
                                        <span style={{fontWeight: selectedOption === idx ? '800' : '500'}}>{option}</span>
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={vStyles.errorMsg}>
                                        <AlertCircle size={14} /> Incorrect. Review the video.
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button 
                                onClick={handleAnswer} 
                                disabled={selectedOption === null}
                                style={selectedOption === null ? vStyles.nextBtnDisabled : vStyles.nextBtn}
                            >
                                {currentQuestion + 1 === activeQuiz.length ? 'Finalize Certification' : 'Next Step'}
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const vStyles = {
    wrapper: { maxWidth: '1300px', margin: '0 auto' },
    header: { marginBottom: '30px', display: 'flex', gap: '20px' },
    backLink: { background: '#fff', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: '14px', color: '#64748b', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', transition: '0.2s' },
    title: { margin: 0, fontWeight: '900', color: '#0f172a', letterSpacing: '-1px' },
    badge: { background: '#eff6ff', color: '#2563eb', padding: '6px 14px', borderRadius: '50px', fontSize: '11px', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #dbeafe', marginTop: '8px' },
    mainGrid: { display: 'grid', gap: '30px', alignItems: 'start' },
    videoSection: { background: '#fff', borderRadius: '28px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' },
    videoWrapper: { position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' },
    iframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
    moduleIndicator: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
    description: { padding: '30px' },
    quizSection: { top: '30px' },
    quizCard: { background: '#fff', padding: '35px', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', textAlign: 'center' },
    iconCircle: { width: '70px', height: '70px', background: '#eff6ff', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)' },
    quizHeader: { marginBottom: '25px', textAlign: 'left' },
    qCount: { fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' },
    miniProgress: { height: '6px', background: '#f1f5f9', borderRadius: '10px', marginTop: '10px', overflow: 'hidden' },
    miniBar: { height: '100%', background: 'linear-gradient(90deg, #2563eb, #60a5fa)', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' },
    questionText: { fontWeight: '800', color: '#1e293b', textAlign: 'left', lineHeight: '1.6', margin: '0 0 20px 0' },
    optionsList: { display: 'flex', flexDirection: 'column', gap: '14px', margin: '20px 0' },
    optionBtn: { padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontSize: '15px', transition: '0.2s' },
    optionBtnActive: { padding: '18px', borderRadius: '16px', border: '2px solid #2563eb', background: '#eff6ff', color: '#1e40af', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontSize: '15px', transition: '0.2s' },
    radio: { width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #cbd5e1', flexShrink: 0 },
    radioActive: { width: '20px', height: '20px', borderRadius: '50%', border: '6px solid #2563eb', background: '#fff', flexShrink: 0 },
    nextBtn: { background: '#0f172a', color: '#fff', width: '100%', padding: '18px', borderRadius: '16px', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', fontWeight: '900', fontSize: '16px', transition: '0.3s ease', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.3)' },
    nextBtnDisabled: { background: '#f1f5f9', color: '#94a3b8', width: '100%', padding: '18px', borderRadius: '16px', border: 'none', cursor: 'not-allowed', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', fontWeight: '900' },
    errorMsg: { color: '#be123c', background: '#fff1f2', padding: '14px', borderRadius: '12px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', fontWeight: '800', border: '1px solid #fecdd3' },
    successCard: { background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '50px 30px', borderRadius: '28px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' },
    successIcon: { width: '90px', height: '90px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: '0 0 20px rgba(255,255,255,0.1)' },
    rewardRow: { display: 'flex', justifyContent: 'center', gap: '15px', margin: '30px 0' },
    rewardItem: { background: 'rgba(255,255,255,0.08)', padding: '18px', borderRadius: '18px', display: 'flex', flexDirection: 'column', flex: 1, border: '1px solid rgba(255,255,255,0.1)' },
    rewardVal: { fontSize: '24px', fontWeight: '900', color: '#10b981' },
    rewardLab: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.6, fontWeight: '800', marginTop: '6px', letterSpacing: '1px' },
    startBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '900', margin: '0 auto', fontSize: '16px', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)' },
    dashboardBtn: { background: '#fff', color: '#0f172a', border: 'none', padding: '16px 32px', borderRadius: '14px', cursor: 'pointer', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '12px', fontSize: '16px', transition: '0.3s' },
    errorContainer: { textAlign: 'center', padding: '120px 20px', minHeight: '80vh' },
    backBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '12px', cursor: 'pointer', marginTop: '20px', fontWeight: '800' }
};

export default VideoPlayer;