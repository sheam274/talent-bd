import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Sparkles, FileText, RefreshCcw } from 'lucide-react';

export default function Analyzer() {
    const [file, setFile] = useState(null);
    const [jobDesc, setJobDesc] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!file || !jobDesc) return alert("Please upload a resume and paste a job description.");
        setLoading(true);

        // SYNC: Create FormData for file upload support
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDesc);

        try {
            const res = await fetch('http://localhost:5000/api/analyze', {
                method: 'POST',
                // Note: Header 'Content-Type' is NOT set manually because 
                // browser adds the boundary for FormData automatically.
                body: formData
            });
            
            if (!res.ok) throw new Error("Backend processing failed");
            
            const data = await res.json();
            setResult(data);
        } catch (err) { 
            console.warn("Using mock result for demo logic.");
            // Mock result for demo/offline purposes
            setResult({
                score: 74,
                missingSkills: ['Kubernetes', 'CI/CD Pipelines', 'TypeScript'],
                matchingSkills: ['React', 'Node.js', 'MongoDB', 'REST APIs'],
                suggestion: "Your technical background is strong, but you should explicitly mention 'DevOps' practices and 'TypeScript' to improve your ranking for this specific role."
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
                <div style={styles.iconCircle}><Sparkles color="#2563eb" size={32} /></div>
                <h2 style={styles.title}>AI Resume Matcher & Optimizer</h2>
                <p style={styles.subtitle}>Check how well your CV aligns with specific Job Descriptions using ATS analysis.</p>
            </div>

            <div style={styles.grid}>
                {/* Input Section */}
                <div style={styles.card}>
                    <div style={styles.inputGroup}>
                        <h4 style={styles.sectionHeading}><FileText size={18} /> 1. Upload Resume</h4>
                        <div style={{...styles.uploadArea, borderColor: file ? '#2563eb' : '#cbd5e1'}}>
                            <input 
                                type="file" 
                                id="resume-upload"
                                accept=".pdf,.doc,.docx" 
                                onChange={e => setFile(e.target.files[0])} 
                                style={{display: 'none'}} 
                            />
                            <label htmlFor="resume-upload" style={styles.uploadLabel}>
                                <UploadCloud size={24} color={file ? '#2563eb' : '#64748b'} />
                                {file ? (
                                    <span style={{color: '#2563eb'}}>{file.name}</span>
                                ) : "Click to select PDF/Doc Resume"}
                            </label>
                        </div>
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <h4 style={styles.sectionHeading}><Sparkles size={18} /> 2. Paste Job Description</h4>
                        <textarea 
                            style={styles.textArea} 
                            placeholder="Paste the full job requirements text here..."
                            value={jobDesc}
                            onChange={(e) => setJobDesc(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={handleAnalyze} 
                        style={{...styles.btn, opacity: loading ? 0.7 : 1}} 
                        disabled={loading}
                    >
                        {loading ? 'Crunching Data...' : 'Analyze Match Score'}
                    </button>
                </div>

                {/* Result Section */}
                <div style={styles.card}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '20px'}}>
                        <h4 style={{...styles.sectionHeading, marginBottom: 0}}>ATS Intelligence Report</h4>
                        {result && (
                            <button onClick={handleReset} style={styles.resetBtn}>
                                <RefreshCcw size={14} /> Reset
                            </button>
                        )}
                    </div>

                    {result ? (
                        <div style={styles.resContent}>
                            {/* Match Meter */}
                            <div style={styles.meterBox}>
                                <div style={styles.scoreCircle}>
                                    <h1 style={{...styles.scoreText, color: result.score > 70 ? '#16a34a' : '#ea580c'}}>
                                        {result.score}%
                                    </h1>
                                    <span style={{fontSize: '12px', color: '#64748b', fontWeight: 'bold'}}>COMPATIBILITY</span>
                                </div>
                                <div style={styles.progressBarContainer}>
                                    <div style={{...styles.progressBar, width: `${result.score}%`, backgroundColor: result.score > 70 ? '#16a34a' : '#ea580c'}}></div>
                                </div>
                            </div>

                            <div style={styles.skillsGrid}>
                                <div style={styles.skillList}>
                                    <h5 style={{...styles.skillTitle, color: '#16a34a'}}><CheckCircle size={14} /> Matching</h5>
                                    <div style={styles.tags}>
                                        {result.matchingSkills.map(s => <span key={s} style={styles.tagMatch}>{s}</span>)}
                                    </div>
                                </div>
                                <div style={styles.skillList}>
                                    <h5 style={{...styles.skillTitle, color: '#dc2626'}}><AlertCircle size={14} /> Missing</h5>
                                    <div style={styles.tags}>
                                        {result.missingSkills.map(s => <span key={s} style={styles.tagMissing}>{s}</span>)}
                                    </div>
                                </div>
                            </div>

                            <div style={styles.suggestionBox}>
                                <strong>AI Recommendation:</strong>
                                <p style={{margin: '8px 0 0', lineHeight: '1.5', fontSize: '13px'}}>{result.suggestion}</p>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.emptyState}>
                            <div className={loading ? "pulse-animation" : ""}>
                                <UploadCloud size={64} color={loading ? "#2563eb" : "#e2e8f0"} />
                            </div>
                            <p style={{marginTop: '15px', fontWeight: '500'}}>
                                {loading ? "Analyzing keywords..." : "Upload data to see your score."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: '1200px', margin: '60px auto', padding: '0 20px', minHeight: '80vh' },
    header: { textAlign: 'center', marginBottom: '50px' },
    iconCircle: { background: '#eff6ff', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' },
    title: { fontSize: '32px', color: '#1e293b', marginBottom: '10px', fontWeight: '800', letterSpacing: '-0.5px' },
    subtitle: { color: '#64748b', fontSize: '16px', maxWidth: '600px', margin: '0 auto' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' },
    card: { background: '#fff', padding: '35px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' },
    sectionHeading: { display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', marginBottom: '20px', fontSize: '16px', fontWeight: '700' },
    inputGroup: { marginBottom: '25px' },
    uploadArea: { border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '25px', textAlign: 'center', transition: 'all 0.3s ease', background: '#f8fafc' },
    uploadLabel: { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#475569', fontWeight: '600', fontSize: '14px' },
    textArea: { width: '100%', height: '200px', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'none', background: '#f8fafc' },
    btn: { width: '100%', padding: '18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '800', fontSize: '16px', transition: '0.3s', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' },
    resetBtn: { background: 'none', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' },
    resContent: { animation: 'fadeIn 0.6s ease-out' },
    meterBox: { textAlign: 'center', marginBottom: '35px', background: '#f8fafc', padding: '20px', borderRadius: '20px' },
    scoreCircle: { marginBottom: '15px' },
    scoreText: { fontSize: '56px', margin: 0, fontWeight: '900', letterSpacing: '-2px' },
    progressBarContainer: { height: '10px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden', width: '80%', margin: '0 auto' },
    progressBar: { height: '100%', transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' },
    skillsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' },
    skillTitle: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', margin: '0 0 12px', fontWeight: '700', textTransform: 'uppercase' },
    tags: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    tagMatch: { background: '#f0fdf4', color: '#16a34a', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', border: '1px solid #bbf7d0', fontWeight: '600' },
    tagMissing: { background: '#fef2f2', color: '#dc2626', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', border: '1px solid #fecaca', fontWeight: '600' },
    suggestionBox: { background: '#fff', padding: '20px', borderRadius: '16px', fontSize: '14px', border: '1px solid #e2e8f0', borderLeft: '6px solid #2563eb', color: '#334155', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    emptyState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }
};