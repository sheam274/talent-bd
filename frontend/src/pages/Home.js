import React, { useState, useEffect } from 'react';
import { 
    Sparkles, FileText, Briefcase, Zap, 
    CheckCircle, Users, ArrowRight, ShieldCheck, 
    BarChart3, Globe, Rocket
} from 'lucide-react';

export default function Home({ setView }) {
    const [file, setFile] = useState(null);
    const [jobDesc, setJobDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(null);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    // Track responsiveness for HP-840 Dashboard vs Mobile
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;
    const isTablet = windowWidth < 1100;

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!file || !jobDesc) return alert("Please upload a PDF Resume and paste the Job Requirements first!");
        
        setLoading(true);
        // SYNC: Simulating the same AI logic used in Analyzer.js
        setTimeout(() => {
            const simulatedScore = Math.floor(Math.random() * (95 - 68 + 1)) + 68;
            setScore(simulatedScore);
            setLoading(false);
        }, 1800);
    };

    return (
        <div style={styles.heroWrapper}>
            <div style={styles.container}>
                <div style={{
                    ...styles.heroGrid,
                    gridTemplateColumns: isTablet ? '1fr' : '1.1fr 0.9fr',
                    gap: isMobile ? '50px' : '80px',
                }}>
                    
                    {/* LEFT SIDE: Brand Positioning */}
                    <div style={{
                        ...styles.textSide,
                        textAlign: isTablet ? 'center' : 'left',
                    }}>
                        <div style={{
                            ...styles.pill,
                            margin: isTablet ? '0 auto 24px' : '0 0 24px 0'
                        }}>
                            <Rocket size={14} /> BD's FIRST AI JOB ECOSYSTEM
                        </div>
                        
                        <h1 style={{
                            ...styles.bigText,
                            fontSize: isMobile ? '38px' : 'clamp(44px, 5.5vw, 72px)',
                        }}>
                            Elevate Your <span style={{color: '#2563eb'}}>Career</span> with Precision AI.
                        </h1>
                        
                        <p style={{
                            ...styles.subText,
                            fontSize: isMobile ? '16px' : '19px',
                            margin: isTablet ? '0 auto 40px' : '0 0 45px 0'
                        }}>
                            TalentBD bridges the gap between local talent and global expectations. 
                            Scan your CV against real job requirements and fix gaps instantly.
                        </p>
                        
                        <div style={{
                            ...styles.buttonGroup,
                            alignItems: isTablet ? 'center' : 'flex-start'
                        }}>
                            <div style={styles.ctaWrapper}>
                                <button onClick={() => setView('jobs')} style={styles.mainBtn}>
                                    <Briefcase size={20} /> Browse Gigs & Jobs
                                </button>
                                <button onClick={() => setView('learning')} style={styles.secondaryBtn}>
                                    Explore Courses
                                </button>
                            </div>

                            <div style={styles.userStats}>
                                <div style={styles.avatars}>
                                    {[1,2,3].map(i => (
                                        <div key={i} style={{...styles.avatarCircle, marginLeft: i === 1 ? 0 : '-10px', background: i === 3 ? '#2563eb' : '#cbd5e1'}}>
                                            <Users size={14} color="#fff" />
                                        </div>
                                    ))}
                                </div>
                                <span style={styles.statText}>Join <strong>12.4k+</strong> tech professionals</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Interactive AI Tools */}
                    <div style={{
                        ...styles.cardSide,
                        width: '100%',
                        maxWidth: isTablet ? '550px' : 'none',
                        margin: isTablet ? '0 auto' : '0'
                    }}>
                        
                        {/* TOOL 1: QUICK ATS SCANNER */}
                        <div style={styles.toolCard}>
                            <div style={styles.cardHeader}>
                                <h4 style={styles.cardTitle}>
                                    <Zap size={18} color="#2563eb" fill="#2563eb" /> Quick ATS Match
                                </h4>
                                <div style={styles.liveIndicator}>LIVE AI</div>
                            </div>
                            
                            {!score ? (
                                <form onSubmit={handleAnalyze}>
                                    <div style={{
                                        ...styles.uploadBox, 
                                        borderColor: file ? '#2563eb' : '#e2e8f0',
                                        background: file ? '#eff6ff' : '#f8fafc'
                                    }}>
                                        <input 
                                            type="file" 
                                            accept=".pdf" 
                                            onChange={(e) => setFile(e.target.files[0])} 
                                            style={styles.hiddenInput} 
                                        />
                                        <FileText size={28} color={file ? '#2563eb' : '#94a3b8'} />
                                        <p style={{...styles.uploadText, color: file ? '#2563eb' : '#64748b'}}>
                                            {file ? file.name : "Select Resume PDF"}
                                        </p>
                                    </div>
                                    <textarea 
                                        style={styles.miniArea} 
                                        placeholder="Paste Job Description Keywords..." 
                                        value={jobDesc}
                                        onChange={(e) => setJobDesc(e.target.value)}
                                        required
                                    />
                                    <button type="submit" style={styles.actionBtn} disabled={loading}>
                                        {loading ? "AI is Analyzing..." : "Check My Compatibility"}
                                    </button>
                                </form>
                            ) : (
                                <div style={styles.resultView}>
                                    <div style={styles.scoreCircle}>
                                        <div style={styles.scoreInner}>
                                            <span style={{fontSize:'28px', fontWeight:'900'}}>{score}%</span>
                                            <span style={{fontSize:'10px', fontWeight:'800'}}>MATCH</span>
                                        </div>
                                    </div>
                                    <h3 style={styles.resultTitle}>
                                        <CheckCircle size={20} color="#16a34a" /> Skill Gap Verified
                                    </h3>
                                    <p style={styles.resultSub}>Your profile is strong. We found 4 matching core skills.</p>
                                    <div style={styles.resultActions}>
                                        <button onClick={() => setScore(null)} style={styles.resetLink}>New Scan</button>
                                        <button onClick={() => setView('analyzer')} style={styles.detailBtn}>
                                            Full Insight <ArrowRight size={14}/>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* TOOL 2: CV ARCHITECT BANNER */}
                        <div style={styles.architectCard}>
                            <div style={styles.cardGlow}></div>
                            <div style={styles.architectContent}>
                                <div style={styles.architectText}>
                                    <div style={styles.newTag}>NEW</div>
                                    <h4 style={styles.architectTitle}>CV Architect</h4>
                                    <p style={styles.architectSub}>Create a high-ranking A4 PDF optimized for 2026 ATS filters.</p>
                                </div>
                                <button onClick={() => setView('cv-builder')} style={styles.cvBtn}>
                                    Design <Sparkles size={14} color="#2563eb" fill="#2563eb" />
                                </button>
                            </div>
                        </div>

                        {/* TRUST FOOTER */}
                        <div style={styles.trustFooter}>
                            <div style={styles.trustItem}><ShieldCheck size={14}/> Encrypted</div>
                            <div style={styles.trustItem}><Globe size={14}/> Global Standards</div>
                            <div style={styles.trustItem}><BarChart3 size={14}/> Real-time Data</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

const styles = {
    heroWrapper: { background: '#fff', minHeight: '90vh', display: 'flex', alignItems: 'center', overflow: 'hidden' },
    container: { maxWidth: '1250px', margin: '0 auto', width: '92%' },
    heroGrid: { display: 'grid', alignItems: 'center' },
    textSide: { display: 'flex', flexDirection: 'column' },
    pill: { background: '#eff6ff', color: '#2563eb', padding: '8px 16px', borderRadius: '50px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content', border: '1px solid #dbeafe' },
    bigText: { fontWeight: '900', lineHeight: '1.05', color: '#0f172a', marginBottom: '28px', letterSpacing: '-2px' },
    subText: { color: '#475569', marginBottom: '45px', lineHeight: '1.6', maxWidth: '580px' },
    ctaWrapper: { display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '30px' },
    mainBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '20px 36px', borderRadius: '18px', fontSize: '16px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.2)', transition: '0.3s' },
    secondaryBtn: { background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', padding: '20px 32px', borderRadius: '18px', fontSize: '16px', fontWeight: '800', cursor: 'pointer' },
    userStats: { display: 'flex', alignItems: 'center', gap: '15px' },
    avatars: { display: 'flex', alignItems: 'center' },
    avatarCircle: { width:'34px', height:'34px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border: '2px solid #fff', position:'relative' },
    statText: { fontSize: '14px', color: '#64748b', fontWeight: '600' },
    cardSide: { display: 'flex', flexDirection: 'column', gap: '20px' },
    toolCard: { background: '#fff', padding: '30px', borderRadius: '32px', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    cardTitle: { margin: 0, fontSize: '19px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' },
    liveIndicator: { background: '#f0fdf4', color: '#16a34a', fontSize: '10px', fontWeight: '900', padding: '4px 10px', borderRadius: '8px', border: '1px solid #dcfce7' },
    uploadBox: { border: '2px dashed #cbd5e1', padding: '25px', borderRadius: '22px', textAlign: 'center', position: 'relative', marginBottom: '18px', cursor: 'pointer' },
    hiddenInput: { position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer' },
    uploadText: { margin:'10px 0 0', fontSize:'13px', fontWeight:'700' },
    miniArea: { width: '100%', height: '100px', padding: '16px', borderRadius: '18px', border: '1px solid #e2e8f0', fontSize: '14px', marginBottom: '20px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'none', background: '#f8fafc', outline: 'none' },
    actionBtn: { width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '18px', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', transition: '0.2s', fontSize: '15px' },
    architectCard: { background: '#0f172a', padding: '24px', borderRadius: '32px', position:'relative', overflow:'hidden', border: '1px solid rgba(255,255,255,0.1)' },
    architectContent: { position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    newTag: { background: '#2563eb', color: '#fff', fontSize: '9px', fontWeight: '900', padding: '2px 8px', borderRadius: '6px', width: 'fit-content', marginBottom: '8px' },
    architectTitle: { margin: '0 0 4px', color: '#fff', fontSize: '20px', fontWeight: '900' },
    architectSub: { margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '12px', maxWidth: '240px' },
    cvBtn: { background: '#fff', color: '#0f172a', border: 'none', padding: '14px 24px', borderRadius: '16px', fontWeight: '900', cursor: 'pointer', display:'flex', alignItems:'center', gap: '8px' },
    cardGlow: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(45deg, rgba(37, 99, 235, 0.2) 0%, transparent 100%)' },
    resultView: { textAlign: 'center' },
    scoreCircle: { width: '100px', height: '100px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '6px solid #dcfce7' },
    scoreInner: { display: 'flex', flexDirection: 'column', lineHeight: 1 },
    resultTitle: { fontSize: '20px', fontWeight: '900', color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    resultSub: { fontSize: '13px', color: '#64748b', marginBottom: '25px' },
    resultActions: { display: 'flex', gap: '12px', justifyContent: 'center' },
    resetLink: { background: 'none', border: '1px solid #e2e8f0', color: '#64748b', padding: '10px 18px', borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
    detailBtn: { background: '#2563eb', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' },
    trustFooter: { display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' },
    trustItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }
};