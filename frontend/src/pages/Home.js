import React, { useState } from 'react';
import { Sparkles, FileText, Briefcase, Zap, CheckCircle, Users, ArrowRight } from 'lucide-react';

export default function Home({ setView }) {
    const [file, setFile] = useState(null);
    const [jobDesc, setJobDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(null);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!file || !jobDesc) return alert("Please upload a PDF Resume and paste the Job Requirements first!");
        
        setLoading(true);
        // SYNC: Simulated AI processing (Simulates the connection to the Python/Node backend)
        setTimeout(() => {
            const simulatedScore = Math.floor(Math.random() * (95 - 68 + 1)) + 68;
            setScore(simulatedScore);
            setLoading(false);
        }, 1800);
    };

    return (
        <div style={styles.heroWrapper}>
            <div style={styles.container}>
                <div style={styles.heroGrid}>
                    
                    {/* LEFT SIDE: Brand Positioning */}
                    <div style={styles.textSide}>
                        <div style={styles.pill}>
                            <Sparkles size={14} /> 2026 AI-POWERED ECOSYSTEM
                        </div>
                        <h1 style={styles.bigText}>
                            The Future of <span style={{color: '#2563eb'}}>Hiring</span> in Bangladesh.
                        </h1>
                        <p style={styles.subText}>
                            Don't just apply. Use our AI Matcher to bridge the gap between your skills and global job circulars. Build, Analyze, and Earn.
                        </p>
                        
                        <div style={styles.buttonGroup}>
                            <button onClick={() => setView('jobs')} style={styles.mainBtn}>
                                <Briefcase size={20} /> Browse Live Jobs
                            </button>
                            <div style={styles.userStats}>
                                <div style={styles.avatars}>
                                    <div style={styles.avatarCircle}><Users size={16} color="#fff" /></div>
                                </div>
                                <span style={styles.statText}><strong>12,400+</strong> active talents this month</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Interactive AI Tools */}
                    <div style={styles.cardSide}>
                        
                        {/* CARD 1: AI MATCH SCORE (Mini-Analyzer) */}
                        <div style={{...styles.toolCard, transform: loading ? 'scale(0.98)' : 'scale(1)'}}>
                            <h4 style={styles.cardTitle}>
                                <Zap size={18} color="#2563eb" fill="#2563eb" /> AI Matcher (Quick Scan)
                            </h4>
                            {!score ? (
                                <form onSubmit={handleAnalyze}>
                                    <div style={{
                                        ...styles.uploadBox, 
                                        borderColor: file ? '#2563eb' : '#cbd5e1',
                                        background: file ? '#eff6ff' : '#f8fafc'
                                    }}>
                                        <input 
                                            type="file" 
                                            accept=".pdf" 
                                            onChange={(e) => setFile(e.target.files[0])} 
                                            style={styles.hiddenInput} 
                                        />
                                        <FileText size={24} color={file ? '#2563eb' : '#64748b'} />
                                        <p style={{margin:'8px 0 0', fontSize:'12px', fontWeight:'bold', color: file ? '#2563eb' : '#475569'}}>
                                            {file ? file.name : "Drop Resume PDF"}
                                        </p>
                                    </div>
                                    <textarea 
                                        style={styles.miniArea} 
                                        placeholder="Paste specific job requirements..." 
                                        value={jobDesc}
                                        onChange={(e) => setJobDesc(e.target.value)}
                                        required
                                    />
                                    <button type="submit" style={styles.actionBtn} disabled={loading}>
                                        {loading ? "AI is Scanning Skills..." : "Calculate Match"}
                                    </button>
                                </form>
                            ) : (
                                <div style={styles.resultView}>
                                    <div style={styles.scoreCircle}>
                                        <span style={{fontSize:'26px', fontWeight:'900'}}>{score}%</span>
                                    </div>
                                    <h3 style={{margin:'15px 0 5px', color:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px'}}>
                                        <CheckCircle size={20} /> High Compatibility!
                                    </h3>
                                    <p style={{fontSize: '12px', color: '#64748b', marginBottom: '15px'}}>Your resume aligns well with these requirements.</p>
                                    <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
                                        <button onClick={() => setScore(null)} style={styles.resetLink}>Re-scan</button>
                                        <button onClick={() => setView('analyzer')} style={styles.detailBtn}>Full Report <ArrowRight size={14}/></button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CARD 2: CV ARCHITECT PREVIEW */}
                        <div style={{...styles.toolCard, background: '#0f172a', color: '#fff', border: 'none', position:'relative', overflow:'hidden'}}>
                            <div style={styles.cardGlow}></div>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', position:'relative', zIndex: 1}}>
                                <div>
                                    <h4 style={{margin: '0 0 5px 0', fontWeight:'900', fontSize:'18px'}}>CV Architect</h4>
                                    <p style={{fontSize: '12px', opacity: 0.7, marginBottom: '20px', maxWidth:'200px'}}>Generate recruiter-approved PDFs in under 60 seconds.</p>
                                </div>
                                <div style={styles.templateIcon}>PDF 2.0</div>
                            </div>
                            <button onClick={() => setView('cv-builder')} style={styles.cvBtn}>
                                Start Building <Sparkles size={14} color="#2563eb" fill="#2563eb" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

const styles = {
    heroWrapper: { 
        background: 'radial-gradient(circle at top right, #f1f5f9 0%, #ffffff 100%)', 
        padding: '100px 0', 
        minHeight: '85vh', 
        display: 'flex', 
        alignItems: 'center'
    },
    container: { maxWidth: '1200px', margin: '0 auto', width: '90%' },
    heroGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '80px', alignItems: 'center' },
    textSide: { textAlign: 'left' },
    pill: { background: '#dbeafe', color: '#2563eb', padding: '6px 16px', borderRadius: '50px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content', marginBottom: '24px', border: '1px solid #bfdbfe' },
    bigText: { fontSize: 'clamp(42px, 5vw, 68px)', fontWeight: '900', lineHeight: '1', color: '#0f172a', marginBottom: '25px', letterSpacing: '-2px' },
    subText: { fontSize: '19px', color: '#475569', marginBottom: '45px', lineHeight: '1.6', maxWidth: '520px' },
    buttonGroup: { display: 'flex', flexDirection: 'column', gap: '25px' },
    mainBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '20px 40px', borderRadius: '16px', fontSize: '18px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', width: 'fit-content', boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.3)', transition: '0.3s' },
    userStats: { display: 'flex', alignItems: 'center', gap: '12px' },
    avatarCircle: { width:'32px', height:'32px', borderRadius:'50%', background:'#2563eb', display:'flex', alignItems:'center', justifyContent:'center', border: '2px solid #fff' },
    statText: { fontSize: '14px', color: '#64748b', fontWeight: '500' },
    cardSide: { display: 'flex', flexDirection: 'column', gap: '24px' },
    toolCard: { background: '#fff', padding: '30px', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
    cardTitle: { margin: '0 0 20px 0', fontSize: '18px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.3px' },
    uploadBox: { border: '2px dashed #cbd5e1', padding: '25px', borderRadius: '18px', textAlign: 'center', position: 'relative', marginBottom: '15px', transition: '0.3s ease' },
    hiddenInput: { position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer' },
    miniArea: { width: '100%', height: '90px', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '13px', marginBottom: '15px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'none', background: '#fcfdfe' },
    actionBtn: { width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', transition: '0.2s', fontSize: '15px' },
    cvBtn: { width: '100%', background: '#fff', color: '#0f172a', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap: '10px', fontSize: '15px', position:'relative', zIndex: 1 },
    cardGlow: { position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle at center, rgba(37, 99, 235, 0.15) 0%, transparent 70%)', zIndex: 0 },
    templateIcon: { background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '900', color: '#fff' },
    resultView: { textAlign: 'center', padding: '10px 0' },
    scoreCircle: { width: '90px', height: '90px', borderRadius: '50%', background: '#f0fdf4', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '5px solid #dcfce7' },
    resetLink: { background: 'none', border: '1px solid #e2e8f0', color: '#64748b', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
    detailBtn: { background: '#2563eb', border: 'none', color: '#fff', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }
};