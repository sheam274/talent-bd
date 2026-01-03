import React, { useState } from 'react';

export default function Home({ setView }) {
    const [file, setFile] = useState(null);
    const [jobDesc, setJobDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(null);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!file || !jobDesc) return alert("Upload a PDF and paste requirements!");
        setLoading(true);
        setTimeout(() => {
            setScore(Math.floor(Math.random() * (95 - 60 + 1)) + 60);
            setLoading(false);
        }, 1500);
    };

    return (
        <div style={styles.heroWrapper}>
            <div style={styles.container}>
                <div style={styles.heroGrid}>
                    {/* LEFT SIDE: Bold Statement */}
                    <div style={styles.textSide}>
                        <div style={styles.pill}>BETA v2.0 AI-POWERED</div>
                        <h1 style={styles.bigText}>The Future of <span style={{color: '#2563eb'}}>Hiring</span> in Bangladesh.</h1>
                        <p style={styles.subText}>Don't just apply. Use our AI tools to match your skills with the biggest job circulars or build a professional CV in seconds.</p>
                        <button onClick={() => setView('jobs')} style={styles.mainBtn}>View 500+ Live Jobs</button>
                    </div>

                    {/* RIGHT SIDE: Dynamic Cards */}
                    <div style={styles.cardSide}>
                        {/* CARD 1: AI ANALYZER */}
                        <div style={styles.toolCard}>
                            <h4 style={styles.cardTitle}>⚡ AI Match Score</h4>
                            {!score ? (
                                <form onSubmit={handleAnalyze}>
                                    <div style={styles.uploadBox}>
                                        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} style={styles.hiddenInput} />
                                        <p style={{margin:0, fontSize:'12px', fontWeight:'bold'}}>{file ? file.name : "📁 Click to upload Resume (PDF)"}</p>
                                    </div>
                                    <textarea 
                                        style={styles.miniArea} 
                                        placeholder="Paste Job Post Text..." 
                                        value={jobDesc}
                                        onChange={(e) => setJobDesc(e.target.value)}
                                    />
                                    <button type="submit" style={styles.actionBtn}>{loading ? "Analyzing..." : "Analyze Match"}</button>
                                </form>
                            ) : (
                                <div style={{textAlign:'center', padding: '10px'}}>
                                    <div style={styles.scoreCircle}>{score}%</div>
                                    <h3 style={{margin:0, color:'#16a34a'}}>Match Found!</h3>
                                    <button onClick={() => setScore(null)} style={styles.resetLink}>Try Another</button>
                                </div>
                            )}
                        </div>

                        {/* CARD 2: CV BUILDER TRIGGER */}
                        <div style={{...styles.toolCard, background: '#1e293b', color: '#fff'}}>
                            <h4 style={{margin: '0 0 10px 0', fontWeight:'900'}}>📄 Pro CV Builder</h4>
                            <p style={{fontSize: '12px', opacity: 0.8, marginBottom: '15px'}}>Generate a job-ready PDF with modern templates instantly.</p>
                            <button onClick={() => setView('cv-builder')} style={styles.cvBtn}>Create My CV</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    heroWrapper: { background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)', padding: '100px 0', minHeight: '85vh', display: 'flex', alignItems: 'center' },
    container: { maxWidth: '1200px', margin: '0 auto', width: '90%' },
    heroGrid: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '50px', alignItems: 'center' },
    textSide: { textAlign: 'left' },
    bigText: { fontSize: '64px', fontWeight: '900', lineHeight: '1.1', color: '#0f172a', marginBottom: '25px' },
    subText: { fontSize: '20px', color: '#475569', marginBottom: '35px', lineHeight: '1.6' },
    pill: { background: '#dbeafe', color: '#2563eb', padding: '5px 15px', borderRadius: '50px', fontSize: '12px', fontWeight: '900', display: 'inline-block', marginBottom: '15px' },
    mainBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '18px 40px', borderRadius: '12px', fontSize: '18px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)' },
    cardSide: { display: 'flex', flexDirection: 'column', gap: '20px' },
    toolCard: { background: '#fff', padding: '25px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
    cardTitle: { margin: '0 0 15px 0', fontSize: '16px', fontWeight: '900', color: '#0f172a' },
    uploadBox: { border: '2px dashed #cbd5e1', padding: '15px', borderRadius: '12px', textAlign: 'center', position: 'relative', marginBottom: '10px', cursor: 'pointer', background: '#f8fafc' },
    hiddenInput: { position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer' },
    miniArea: { width: '100%', height: '70px', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', marginBottom: '10px', boxSizing: 'border-box', fontFamily: 'inherit' },
    actionBtn: { width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    cvBtn: { width: '100%', background: '#fff', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    resetLink: { background: 'none', border: 'none', color: '#2563eb', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px', marginTop: '10px' },
    scoreCircle: { width: '70px', height: '70px', borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '20px', fontWeight: '900', border: '3px solid #22c55e' }
};