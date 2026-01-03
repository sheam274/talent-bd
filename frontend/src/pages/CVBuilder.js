import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * TALENTBD PREMIUM AI CV ARCHITECT
 * Niche: US Standard Resume + AI Circular Matching
 */
export default function CVBuilder({ user, setUser }) {
    const [template, setTemplate] = useState('modern');
    const [jobCircular, setJobCircular] = useState('');
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    // Initial State following US Standards (No photos, focused on metrics)
    const [cvData, setCvData] = useState(user?.savedCV || {
        name: '', email: '', phone: '', linkedin: '', location: '', summary: '',
        skills: [{ name: 'React', category: 'Frontend' }],
        experience: [{ company: '', role: '', location: '', period: '', metrics: '' }],
        education: [{ degree: '', institute: '', year: '', gpa: '' }],
        projects: [{ title: '', tech: '', link: '', result: '' }],
        references: [{ name: '', contact: '', company: '' }]
    });

    // --- AI IMPLEMENTATION: ATS & CIRCULAR MATCHING ---
    const runAIJobAudit = async () => {
        if (!jobCircular) return alert("Please paste a Job Circular first.");
        setLoading(true);
        
        try {
            // Simulated AI Logic for Niche implementation
            const res = await fetch('http://localhost:5000/api/ai/analyze-job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobText: jobCircular, cvData })
            });
            const data = await res.json();
            setAiAnalysis(data); 
        } catch (e) {
            // Fallback mock for demonstration
            setAiAnalysis({
                score: 82,
                missingKeywords: ["Docker", "CI/CD", "Unit Testing"],
                suggestions: "Your summary should mention 'Cloud Architecture' to match this circular."
            });
        }
        setLoading(false);
    };

    const updateField = (section, index, field, value) => {
        const updated = [...cvData[section]];
        updated[index][field] = value;
        setCvData({ ...cvData, [section]: updated });
    };

    const addSectionItem = (section, schema) => {
        setCvData({ ...cvData, [section]: [...cvData[section], schema] });
    };

    const exportPDF = () => {
        const input = document.getElementById('resume-preview');
        html2canvas(input, { scale: 2 }).then(canvas => {
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
            pdf.save(`${cvData.name}_Resume.pdf`);
        });
    };

    return (
        <div style={styles.container}>
            {/* EDITOR PANEL */}
            <aside style={styles.editorPane}>
                <header style={styles.paneHeader}>
                    <h2 style={{margin:0, color:'#3b82f6'}}>TalentBD <span style={{color:'#1e293b'}}>AI</span></h2>
                    <div style={{display:'flex', gap:'5px'}}>
                        <button onClick={() => setTemplate('modern')} style={styles.miniBtn}>US Modern</button>
                        <button onClick={() => setTemplate('classic')} style={styles.miniBtn}>US Classic</button>
                    </div>
                </header>

                {/* AI Circular Tool */}
                <div style={styles.aiToolBox}>
                    <label style={styles.label}>AI Job Circular Scraper</label>
                    <textarea 
                        style={styles.aiTextarea} 
                        placeholder="Paste Job Description / Circular Text..."
                        value={jobCircular}
                        onChange={(e) => setJobCircular(e.target.value)}
                    />
                    <button onClick={runAIJobAudit} style={styles.aiActionBtn} disabled={loading}>
                        {loading ? "Analyzing Intent..." : "✨ Match with AI"}
                    </button>
                    {aiAnalysis && (
                        <div style={styles.aiReport}>
                            <strong>ATS Score: {aiAnalysis.score}%</strong>
                            <p style={{fontSize:'10px', color:'#ef4444'}}>Missing: {aiAnalysis.missingKeywords.join(', ')}</p>
                        </div>
                    )}
                </div>

                <div style={styles.formScroll}>
                    {/* US STANDARD SECTIONS */}
                    <SectionWrapper title="Contact & Summary" onAdd={null}>
                        <input style={styles.input} placeholder="Full Name" value={cvData.name} onChange={e => setCvData({...cvData, name: e.target.value})} />
                        <input style={styles.input} placeholder="City, State" value={cvData.location} onChange={e => setCvData({...cvData, location: e.target.value})} />
                        <textarea style={styles.textarea} placeholder="Professional Summary (Focus on achievements)" value={cvData.summary} onChange={e => setCvData({...cvData, summary: e.target.value})} />
                    </SectionWrapper>

                    <SectionWrapper title="Industrial Experience" onAdd={() => addSectionItem('experience', {company:'', role:'', location:'', period:'', metrics:''})}>
                        {cvData.experience.map((exp, i) => (
                            <div key={i} style={styles.itemCard}>
                                <input style={styles.input} placeholder="Company" value={exp.company} onChange={e => updateField('experience', i, 'company', e.target.value)} />
                                <input style={styles.input} placeholder="Role" value={exp.role} onChange={e => updateField('experience', i, 'role', e.target.value)} />
                                <textarea style={styles.textarea} placeholder="Bullet points (Use STAR method: Action + Metric)" value={exp.metrics} onChange={e => updateField('experience', i, 'metrics', e.target.value)} />
                            </div>
                        ))}
                    </SectionWrapper>

                    <SectionWrapper title="Academic History" onAdd={() => addSectionItem('education', {degree:'', institute:'', year:'', gpa:''})}>
                        {cvData.education.map((edu, i) => (
                            <div key={i} style={styles.itemCard}>
                                <input style={styles.input} placeholder="Degree (e.g. B.S. in CS)" value={edu.degree} onChange={e => updateField('education', i, 'degree', e.target.value)} />
                                <input style={styles.input} placeholder="University" value={edu.institute} onChange={e => updateField('education', i, 'institute', e.target.value)} />
                            </div>
                        ))}
                    </SectionWrapper>
                </div>

                <div style={styles.actionFooter}>
                    <button style={styles.saveBtn}>Sync to Profile</button>
                    <button onClick={exportPDF} style={styles.pdfBtn}>Download PDF</button>
                </div>
            </aside>

            {/* PREVIEW PANEL (US STANDARDS) */}
            <main style={styles.previewPane}>
                <div id="resume-preview" style={{...styles.a4, fontFamily: template === 'modern' ? 'Inter, sans-serif' : 'Times New Roman'}}>
                    <div style={{textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px'}}>
                        <h1 style={{margin:0, fontSize:'28px', textTransform:'uppercase'}}>{cvData.name || "YOUR NAME"}</h1>
                        <p style={{fontSize:'12px', margin:'5px 0'}}>
                            {cvData.location} | {cvData.phone} | {cvData.email} | {cvData.linkedin}
                        </p>
                    </div>

                    <div style={styles.cvBody}>
                        <h3 style={styles.cvSectionTitle}>Professional Summary</h3>
                        <p style={styles.cvText}>{cvData.summary || "Strategically focused professional with expertise in..."}</p>

                        <h3 style={styles.cvSectionTitle}>Professional Experience</h3>
                        {cvData.experience.map((exp, i) => (
                            <div key={i} style={{marginBottom:'15px'}}>
                                <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold'}}>
                                    <span>{exp.company}</span>
                                    <span>{exp.period}</span>
                                </div>
                                <div style={{fontStyle:'italic', fontSize:'13px'}}>{exp.role} | {exp.location}</div>
                                <p style={{...styles.cvText, whiteSpace:'pre-line'}}>• {exp.metrics}</p>
                            </div>
                        ))}

                        <h3 style={styles.cvSectionTitle}>Education</h3>
                        {cvData.education.map((edu, i) => (
                            <div key={i} style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                                <span><strong>{edu.institute}</strong>, {edu.degree}</span>
                                <span>{edu.year}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

// Sub-component for UI Cleanliness
const SectionWrapper = ({ title, children, onAdd }) => (
    <div style={{marginBottom:'25px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
            <label style={styles.label}>{title}</label>
            {onAdd && <button onClick={onAdd} style={styles.addCircle}>+</button>}
        </div>
        {children}
    </div>
);

const styles = {
    container: { display: 'flex', height: '100vh', background: '#f1f5f9' },
    editorPane: { width: '420px', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '20px' },
    paneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    aiToolBox: { background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #3b82f6', marginBottom: '20px' },
    aiTextarea: { width: '100%', height: '70px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '10px', fontSize: '12px', marginBottom: '10px' },
    aiActionBtn: { width: '100%', background: '#3b82f6', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
    aiReport: { marginTop:'10px', padding:'10px', background:'#fff', borderRadius:'5px', border:'1px solid #3b82f6' },
    formScroll: { flex: 1, overflowY: 'auto', paddingRight: '10px' },
    label: { fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' },
    textarea: { width: '100%', height: '80px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' },
    itemCard: { background: '#f1f5f9', padding: '12px', borderRadius: '8px', marginBottom: '15px' },
    addCircle: { background: '#1e293b', color: '#fff', border: 'none', width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer' },
    miniBtn: { fontSize: '10px', padding: '4px 8px', cursor: 'pointer' },
    actionFooter: { display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' },
    saveBtn: { flex: 1, padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    pdfBtn: { flex: 1, padding: '12px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    previewPane: { flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', justifyContent: 'center', background: '#cbd5e1' },
    a4: { width: '210mm', minHeight: '297mm', background: '#fff', padding: '50px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' },
    cvSectionTitle: { borderBottom: '1px solid #000', paddingBottom: '3px', marginTop: '20px', marginBottom: '10px', fontSize: '16px', textTransform: 'uppercase' },
    cvText: { fontSize: '13px', lineHeight: '1.6', color: '#333' }
};