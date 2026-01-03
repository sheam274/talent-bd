import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Play, 
    CheckCircle, 
    AlertCircle, 
    Award, 
    ArrowRight, 
    RefreshCcw, 
    Trophy,
    ShieldCheck
} from 'lucide-react';

const VideoPlayer = ({ course, user, setView, onVerify }) => {
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [error, setError] = useState(false);

    // FIXED: Convert standard YT URL to Embed URL so it actually plays
    const getEmbedUrl = (url) => {
        if (!url) return "";
        let videoId = "";
        if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0];
        else if (url.includes('be/')) videoId = url.split('be/')[1]?.split('?')[0];
        else if (url.includes('embed/')) return url;
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    };

    if (!course) {
        return (
            <div style={vStyles.errorContainer}>
                <AlertCircle size={48} color="#ef4444" />
                <h2>Verification Module Not Found</h2>
                <p>The course data could not be loaded. Please try again.</p>
                <button onClick={() => setView('learning')} style={vStyles.backBtn}>Return to Hub</button>
            </div>
        );
    }

    const handleAnswer = () => {
        const correctIdx = course.quiz[currentQuestion].correctAnswer;
        
        // Check if selected is correct (handles both string and number comparison)
        if (selectedOption == correctIdx) {
            if (currentQuestion + 1 < course.quiz.length) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedOption(null);
                setError(false);
            } else {
                setIsFinished(true);
                // FIXED: Triggering the verification logic passed from App.js
                if (onVerify) {
                    onVerify(course.skillTag, course.rewardXP || 100, course.rewardWallet || 50);
                }
            }
        } else {
            setError(true);
        }
    };

    return (
        <div style={vStyles.wrapper}>
            <header style={vStyles.header}>
                <button onClick={() => setView('learning')} style={vStyles.backLink}>
                    <ArrowRight size={16} style={{transform: 'rotate(180deg)'}} /> Back to Hub
                </button>
                <h1 style={vStyles.title}>{course.title}</h1>
                <div style={vStyles.badge}>
                    <ShieldCheck size={14} /> {course.skillTag?.toUpperCase()} VERIFICATION
                </div>
            </header>

            <div style={vStyles.mainGrid}>
                {/* 1. VIDEO SECTION */}
                <div style={vStyles.videoSection}>
                    <div style={vStyles.videoWrapper}>
                        <iframe
                            src={getEmbedUrl(course.videoUrl)}
                            title="Course Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={vStyles.iframe}
                        ></iframe>
                    </div>
                    <div style={vStyles.description}>
                        <h3 style={{margin: '0 0 10px 0', fontSize: '20px', fontWeight: '800'}}>Module Overview</h3>
                        <p style={{color: '#64748b', lineHeight: '1.6', margin: 0}}>{course.description || "Master the core fundamentals of this skill through our verified curriculum."}</p>
                    </div>
                </div>

                {/* 2. QUIZ & REWARD SECTION */}
                <div style={vStyles.quizSection}>
                    {!quizStarted ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={vStyles.quizCard}>
                            <div style={vStyles.iconCircle}><Award size={32} color="#2563eb" /></div>
                            <h2 style={{margin: '15px 0 10px 0'}}>Ready to Certify?</h2>
                            <p style={{color: '#64748b', fontSize: '14px', marginBottom: '25px'}}>
                                Pass the assessment to earn <b style={{color: '#0f172a'}}>{course.rewardXP || 100} XP</b> and 
                                unlock your <b style={{color: '#16a34a'}}>${course.rewardWallet || 50}</b> reward.
                            </p>
                            <button onClick={() => setQuizStarted(true)} style={vStyles.startBtn}>
                                Start Assessment <Play size={14} fill="currentColor" />
                            </button>
                        </motion.div>
                    ) : isFinished ? (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={vStyles.successCard}>
                            <div style={vStyles.successIcon}><Trophy size={48} color="#fff" /></div>
                            <h2 style={{fontSize: '24px', fontWeight: '900', margin: '15px 0 5px'}}>Skill Verified!</h2>
                            <p style={{opacity: 0.9, fontSize: '14px'}}>You've officially earned the <b>{course.skillTag}</b> badge.</p>
                            
                            <div style={vStyles.rewardRow}>
                                <div style={vStyles.rewardItem}>
                                    <span style={styles.rewardVal}>+${course.rewardWallet || 50}</span>
                                    <span style={styles.rewardLab}>Wallet</span>
                                </div>
                                <div style={vStyles.rewardItem}>
                                    <span style={styles.rewardVal}>+{course.rewardXP || 100}</span>
                                    <span style={styles.rewardLab}>Experience</span>
                                </div>
                            </div>

                            <button onClick={() => setView('dashboard')} style={vStyles.dashboardBtn}>
                                Go to Dashboard <CheckCircle size={16} />
                            </button>
                        </motion.div>
                    ) : (
                        <div style={vStyles.quizCard}>
                            <div style={vStyles.quizHeader}>
                                <span style={vStyles.qCount}>Step {currentQuestion + 1} of {course.quiz?.length || 1}</span>
                                <div style={vStyles.miniProgress}>
                                    <div style={{...vStyles.miniBar, width: `${((currentQuestion + 1) / course.quiz.length) * 100}%`}} />
                                </div>
                            </div>
                            
                            <h3 style={vStyles.questionText}>{course.quiz[currentQuestion].question}</h3>
                            
                            <div style={vStyles.optionsList}>
                                {course.quiz[currentQuestion].options.map((option, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => { setSelectedOption(idx); setError(false); }}
                                        style={selectedOption === idx ? vStyles.optionBtnActive : vStyles.optionBtn}
                                    >
                                        <div style={selectedOption === idx ? vStyles.radioActive : vStyles.radio} />
                                        {option}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={vStyles.errorMsg}>
                                        <AlertCircle size={14} /> Incorrect answer. Please review the video.
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button 
                                onClick={handleAnswer} 
                                disabled={selectedOption === null}
                                style={selectedOption === null ? vStyles.nextBtnDisabled : vStyles.nextBtn}
                            >
                                {currentQuestion + 1 === course.quiz.length ? 'Finalize & Claim' : 'Continue Assessment'}
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const vStyles = {
    wrapper: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
    header: { marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' },
    backLink: { background: '#fff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '10px', color: '#64748b', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' },
    title: { margin: 0, fontSize: '28px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' },
    badge: { background: '#f0f9ff', color: '#0369a1', padding: '6px 14px', borderRadius: '50px', fontSize: '11px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e0f2fe' },
    mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1.8fr)) 1fr', gap: '30px', alignItems: 'start' },
    videoSection: { background: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' },
    videoWrapper: { position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' },
    iframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
    description: { padding: '30px' },
    quizSection: { position: 'sticky', top: '100px' },
    quizCard: { background: '#fff', padding: '35px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', textAlign: 'center' },
    iconCircle: { width: '64px', height: '64px', background: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' },
    quizHeader: { marginBottom: '20px', textAlign: 'left' },
    qCount: { fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
    miniProgress: { height: '4px', background: '#f1f5f9', borderRadius: '10px', marginTop: '8px', overflow: 'hidden' },
    miniBar: { height: '100%', background: '#2563eb', transition: '0.4s ease' },
    questionText: { fontSize: '18px', fontWeight: '800', color: '#1e293b', textAlign: 'left', lineHeight: '1.5', margin: '0 0 20px 0' },
    optionsList: { display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' },
    optionBtn: { padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', textAlign: 'left', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '600', color: '#475569' },
    optionBtnActive: { padding: '16px', borderRadius: '14px', border: '2px solid #2563eb', background: '#eff6ff', color: '#1e40af', textAlign: 'left', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' },
    radio: { width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #cbd5e1' },
    radioActive: { width: '18px', height: '18px', borderRadius: '50%', border: '5px solid #2563eb', background: '#fff' },
    nextBtn: { background: '#0f172a', color: '#fff', width: '100%', padding: '16px', borderRadius: '14px', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontWeight: '800' },
    nextBtnDisabled: { background: '#f1f5f9', color: '#94a3b8', width: '100%', padding: '16px', borderRadius: '14px', border: 'none', cursor: 'not-allowed', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontWeight: '800' },
    errorMsg: { color: '#be123c', background: '#fff1f2', padding: '12px', borderRadius: '10px', fontSize: '12px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontWeight: '700' },
    successCard: { background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', padding: '40px 30px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' },
    successIcon: { width: '80px', height: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' },
    rewardRow: { display: 'flex', justifyContent: 'center', gap: '15px', margin: '25px 0' },
    rewardItem: { background: 'rgba(255,255,255,0.05)', padding: '15px 20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', flex: 1 },
    startBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', margin: '0 auto' },
    dashboardBtn: { background: '#fff', color: '#0f172a', border: 'none', padding: '14px 28px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '10px', marginTop: '10px' },
    errorContainer: { textAlign: 'center', padding: '100px 20px' },
    backBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', marginTop: '20px' }
};

const styles = {
    rewardVal: { fontSize: '20px', fontWeight: '900', color: '#10b981' },
    rewardLab: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.6, fontWeight: '700', marginTop: '4px' }
};

export default VideoPlayer;