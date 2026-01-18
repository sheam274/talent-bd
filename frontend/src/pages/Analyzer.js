import React, { useState, useEffect } from 'react';
import { 
    UploadCloud, CheckCircle, AlertCircle, Sparkles, 
    FileText, RefreshCcw, Cpu, Target, Zap 
} from 'lucide-react';

export default function Analyzer() {
    const [file, setFile] = useState(null);
    const [jobDesc, setJobDesc] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // Track responsiveness for HP-840 vs Mobile
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleAnalyze = async () => {
        if (!file || !jobDesc) return alert("Please upload a resume and paste a job description.");
        setLoading(true);

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDesc);

        try {
            const res = await fetch('http://localhost:5000/api/analyze', {
                method: 'POST',
                body: formData
            });
            
            if (!res.ok) throw new Error("Backend processing failed");
            const data = await res.json();
            setResult(data);
        } catch (err) { 
            console.warn("Using TalentBD AI Mock Engine for demo.");
            // SYNC: Mock data reflects the Bangladeshi Tech Stack
            setResult({
                score: 74,
                missingSkills: ['Kubernetes', 'CI/CD', 'TypeScript', 'Docker'],
                matchingSkills: ['React', 'Node.js', 'MongoDB', 'REST APIs', 'Express'],
                suggestion: "Your MERN stack foundation is excellent. To hit a 90%+ score for this role, explicitly mention your experience with 'Containerization' and 'TypeScript' in your project descriptions."
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setJobDesc('');
        setResult(null);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.iconCircle}><Cpu color="#2563eb" size={32} /></div>
                <h2 style={styles.title}>ATS <span style={{color: '#2563eb'}}>Intelligence</span> Architect</h2>
                <p style={styles.subtitle}>Our AI scans your resume against job requirements to ensure you pass through automated filters.</p>
            </div>

            <div style={{
                ...styles.grid,
                gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr'
            }}>
                {/* Input Section */}
                <div style={styles.card}>
                    <div style={styles.inputGroup}>
                        <h4 style={styles.sectionHeading}><FileText size={18} color="#2563eb" /> 1. Resume Source</h4>
                        <div style={{
                            ...styles.uploadArea, 
                            borderColor: file ? '#2563eb' : '#e2e8f0',
                            backgroundColor: file ? '#f0f7ff' : '#f8fafc'
                        }}>
                            <input 
                                type="file" 
                                id="resume-upload"
                                accept=".pdf,.doc,.docx" 
                                onChange={e => setFile(e.target.files[0])} 
                                style={{display: 'none'}} 
                            />
                            <label htmlFor="resume-upload" style={styles.uploadLabel}>
                                <UploadCloud size={30} color={file ? '#2563eb' : '#94a3b8'} />
                                {file ? (
                                    <div style={{textAlign: 'center'}}>
                                        <p style={{color: '#1e293b', margin: '5px 0'}}>{file.name}</p>
                                        <span style={{fontSize: '11px', color: '#2563eb'}}>File Ready for AI Scan</span>
                                    </div>
                                ) : "Drop your PDF or Click to Browse"}
                            </label>
                        </div>
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <h4 style={styles.sectionHeading}><Target size={18} color="#2563eb" /> 2. Target Requirements</h4>
                        <textarea 
                            style={styles.textArea} 
                            placeholder="Paste the Job Description (Responsibilities & Skills) here..."
                            value={jobDesc}
                            onChange={(e) => setJobDesc(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={handleAnalyze} 
                        style={{...styles.btn, transform: loading ? 'scale(0.98)' : 'scale(1)'}} 
                        disabled={loading}
                    >
                        {loading ? <Zap className="spin-icon" size={18} /> : 'Calculate ATS Compatibility'}
                    </button>
                </div>

                {/* Result Section */}
                <div style={{...styles.card, background: result ? '#fff' : '#fcfdfe'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '25px'}}>
                        <h4 style={{...styles.sectionHeading, marginBottom: 0}}>Analysis Report</h4>
                        {result && (
                            <button onClick={handleReset} style={styles.resetBtn}>
                                <RefreshCcw size={14} /> Clear Scan
                            </button>
                        )}
                    </div>

                    {result ? (
                        <div style={styles.resContent}>
                            {/* Score Panel */}
                            <div style={styles.meterBox}>
                                <div style={styles.scoreCircle}>
                                    <h1 style={{...styles.scoreText, color: result.score > 70 ? '#059669' : '#d97706'}}>
                                        {result.score}<span style={{fontSize: '24px'}}>%</span>
                                    </h1>
                                    <span style={styles.matchBadge}>{result.score > 70 ? 'HIGH MATCH' : 'POTENTIAL GAP'}</span>
                                </div>
                                <div style={styles.progressBarContainer}>
                                    <div style={{
                                        ...styles.progressBar, 
                                        width: `${result.score}%`, 
                                        backgroundColor: result.score > 70 ? '#10b981' : '#f59e0b'
                                    }}></div>
                                </div>
                            </div>

                            <div style={{...styles.skillsGrid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr'}}>
                                <div style={styles.skillList}>
                                    <h5 style={{...styles.skillTitle, color: '#059669'}}><CheckCircle size={14} /> Found Keywords</h5>
                                    <div style={styles.tags}>
                                        {result.matchingSkills.map(s => <span key={s} style={styles.tagMatch}>{s}</span>)}
                                    </div>
                                </div>
                                <div style={styles.skillList}>
                                    <h5 style={{...styles.skillTitle, color: '#dc2626'}}><AlertCircle size={14} /> Missing Keywords</h5>
                                    <div style={styles.tags}>
                                        {result.missingSkills.map(s => <span key={s} style={styles.tagMissing}>{s}</span>)}
                                    </div>
                                </div>
                            </div>

                            <div style={styles.suggestionBox}>
                                <div style={{display:'flex', gap: '8px', alignItems:'center', marginBottom: '10px'}}>
                                    <Sparkles size={16} color="#2563eb" />
                                    <strong style={{fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>AI Strategy</strong>
                                </div>
                                <p style={{margin: 0, lineHeight: '1.6', fontSize: '14px', color: '#334155'}}>{result.suggestion}</p>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIconCircle}>
                                <Cpu size={48} color={loading ? "#2563eb" : "#e2e8f0"} className={loading ? "pulse" : ""} />
                            </div>
                            <p style={{marginTop: '20px', fontWeight: '600', color: '#64748b'}}>
                                {loading ? "Extracting Entities..." : "Upload Resume to Begin AI Analysis"}
                            </p>
                            <span style={{fontSize: '12px', color: '#94a3b8'}}>Supports PDF, DOCX (Max 5MB)</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: '1300px', margin: '40px auto', padding: '0 24px', minHeight: '85vh' },
    header: { textAlign: 'center', marginBottom: '60px' },
    iconCircle: { background: '#f0f7ff', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.1)' },
    title: { fontSize: '36px', color: '#0f172a', marginBottom: '12px', fontWeight: '900', letterSpacing: '-1px' },
    subtitle: { color: '#64748b', fontSize: '17px', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' },
    grid: { display: 'grid', gap: '40px' },
    card: { background: '#fff', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', transition: '0.3s' },
    sectionHeading: { display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b', marginBottom: '25px', fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' },
    inputGroup: { marginBottom: '35px' },
    uploadArea: { border: '2px dashed #cbd5e1', borderRadius: '24px', padding: '40px', textAlign: 'center', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' },
    uploadLabel: { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#475569', fontWeight: '700', fontSize: '15px' },
    textArea: { width: '100%', height: '220px', padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'none', background: '#f8fafc', outline: 'none', transition: 'border 0.2s' },
    btn: { width: '100%', padding: '20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '18px', cursor: 'pointer', fontWeight: '800', fontSize: '16px', transition: '0.3s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' },
    resetBtn: { background: '#f1f5f9', border: 'none', color: '#64748b', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' },
    resContent: { animation: 'fadeIn 0.8s ease-out' },
    meterBox: { textAlign: 'center', marginBottom: '40px', background: '#f8fafc', padding: '30px', borderRadius: '28px', border: '1px solid #f1f5f9' },
    scoreCircle: { marginBottom: '20px' },
    scoreText: { fontSize: '72px', margin: 0, fontWeight: '900', letterSpacing: '-3px', lineHeight: 1 },
    matchBadge: { fontSize: '10px', fontWeight: '900', color: '#64748b', border: '1px solid #e2e8f0', padding: '4px 12px', borderRadius: '20px', background: '#fff' },
    progressBarContainer: { height: '12px', background: '#e2e8f0', borderRadius: '20px', overflow: 'hidden', width: '80%', margin: '20px auto 0' },
    progressBar: { height: '100%', transition: 'width 2s cubic-bezier(0.4, 0, 0.2, 1)' },
    skillsGrid: { display: 'grid', gap: '25px', marginBottom: '35px' },
    skillTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', margin: '0 0 15px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' },
    tags: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
    tagMatch: { background: '#f0fdf4', color: '#16a34a', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', border: '1px solid #dcfce7', fontWeight: '700' },
    tagMissing: { background: '#fef2f2', color: '#dc2626', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', border: '1px solid #fee2e2', fontWeight: '700' },
    suggestionBox: { background: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', borderTop: '4px solid #2563eb', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)' },
    emptyState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    emptyIconCircle: { width: '100px', height: '100px', background: '#f8fafc', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' }
};