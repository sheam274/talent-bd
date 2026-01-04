import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Sparkles, Download, Cloud, Plus, Trash2, Layout, X, GraduationCap, Award, Briefcase, Code, Camera, User, ExternalLink } from 'lucide-react';

export default function CVBuilder({ user, job, onClose }) {
    const [template, setTemplate] = useState('modern');
    const [jobCircular, setJobCircular] = useState(job ? `${job.title}\n${job.skill}` : '');
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const [cvData, setCvData] = useState({
        photo: null,
        name: user?.name || '', 
        email: user?.email || '', 
        phone: user?.phone || '', 
        linkedin: '', 
        location: user?.location || '', 
        summary: '',
        skills: [{ name: user?.skills?.[0] || '', level: 'Expert' }],
        experience: [{ company: '', role: '', period: '', metrics: '' }],
        education: [{ institute: '', degree: '', year: '', gpa: '' }],
        projects: [{ title: '', tech: '', description: '', link: '' }]
    });

    useEffect(() => {
        if (user) {
            setCvData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                ...(user.savedCV || {})
            }));
        }
        if (job) setJobCircular(`${job.title} - ${job.skill}`);
    }, [user, job]);

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCvData(prev => ({ ...prev, photo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const updateField = (section, index, field, value) => {
        const updated = [...cvData[section]];
        updated[index][field] = value;
        setCvData({ ...cvData, [section]: updated });
    };

    const addSectionItem = (section, schema) => {
        setCvData({ ...cvData, [section]: [...cvData[section], schema] });
    };

    const removeSectionItem = (section, index) => {
        const updated = cvData[section].filter((_, i) => i !== index);
        setCvData({ ...cvData, [section]: updated });
    };

    const exportPDF = () => {
        const input = document.getElementById('resume-preview');
        html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
            pdf.save(`CV_${cvData.name || 'Profile'}.pdf`);
        });
    };

    const saveCVToProfile = () => {
        localStorage.setItem(`cv_backup_${user?.email || 'guest'}`, JSON.stringify(cvData));
        alert("✅ Progress Saved (Projects included)!");
    };

    // Helper Component defined inside to avoid scope errors
    const SectionWrapper = ({ title, children, onAdd }) => (
        <div style={{marginBottom:'25px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                <label style={{fontSize: '11px', fontWeight: '900', color: '#64748b', textTransform:'uppercase'}}>{title}</label>
                {onAdd && <button onClick={onAdd} style={styles.addCircle}><Plus size={14}/></button>}
            </div>
            {children}
        </div>
    );

    return (
        <div style={styles.container}>
            {/* EDITOR PANEL */}
            <aside style={styles.editorPane}>
                <header style={styles.paneHeader}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <Layout color="#2563eb" size={24}/>
                        <h2 style={{margin:0, fontSize:'18px'}}>CV <span style={{color:'#2563eb'}}>Architect</span></h2>
                    </div>
                    {onClose && <button onClick={onClose} style={styles.closeBtn}><X size={18}/></button>}
                </header>

                {/* INTEGRATED AI SECTION */}
                <div style={{marginBottom: '20px', padding: '15px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                         <label style={{fontSize: '11px', fontWeight: '900', color: '#2563eb', textTransform: 'uppercase'}}>AI Assistant</label>
                         <button onClick={() => setTemplate('modern')} style={{fontSize: '10px', background: '#fff', border: '1px solid #dbeafe', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer'}}>Change Template</button>
                    </div>
                    {loading ? (
                        <p style={{fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <Sparkles size={14} className="animate-pulse" /> Analyzing {jobCircular}...
                        </p>
                    ) : (
                        <div style={{display: 'flex', alignItems: 'flex-start', gap: '8px'}}>
                            <Sparkles size={16} color="#eab308" style={{marginTop: '2px'}} />
                            <p style={{fontSize: '12px', color: '#1e40af', margin: 0}}>{aiAnalysis || "Ready to analyze your CV against the job circular."}</p>
                        </div>
                    )}
                </div>

                <div style={styles.formScroll}>
                    <SectionWrapper title="Profile Image">
                        <div style={styles.photoUploadZone} onClick={() => fileInputRef.current.click()}>
                            {cvData.photo ? (
                                <img src={cvData.photo} alt="Profile" style={styles.photoPreviewCircle} />
                            ) : (
                                <div style={styles.photoPlaceholder}>
                                    <Camera size={24} color="#94a3b8" />
                                    <span style={{fontSize:'12px', color:'#94a3b8'}}>Upload Photo</span>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handlePhotoUpload} />
                        </div>
                    </SectionWrapper>

                    <SectionWrapper title="Personal Identity">
                        <input style={styles.input} placeholder="Full Name" value={cvData.name} onChange={e => setCvData({...cvData, name: e.target.value})} />
                        <div style={{display:'flex', gap:'10px'}}>
                            <input style={styles.input} placeholder="Email" value={cvData.email} onChange={e => setCvData({...cvData, email: e.target.value})} />
                            <input style={styles.input} placeholder="Location" value={cvData.location} onChange={e => setCvData({...cvData, location: e.target.value})} />
                        </div>
                        <textarea style={styles.textarea} placeholder="Professional Summary..." value={cvData.summary} onChange={e => setCvData({...cvData, summary: e.target.value})} />
                    </SectionWrapper>

                    <SectionWrapper title="Project Showcase" onAdd={() => addSectionItem('projects', {title:'', tech:'', description:'', link:''})}>
                        {cvData.projects.map((proj, i) => (
                            <div key={i} style={styles.itemCard}>
                                <div style={{display:'flex', justifyContent:'space-between'}}>
                                    <input style={{...styles.input, fontWeight:'bold', border:'none'}} placeholder="Project Title" value={proj.title} onChange={e => updateField('projects', i, 'title', e.target.value)} />
                                    <button onClick={() => removeSectionItem('projects', i)} style={styles.delBtn}><Trash2 size={14}/></button>
                                </div>
                                <input style={styles.input} placeholder="Tech Stack (e.g. React, Node.js)" value={proj.tech} onChange={e => updateField('projects', i, 'tech', e.target.value)} />
                                <input style={styles.input} placeholder="Live Link / GitHub" value={proj.link} onChange={e => updateField('projects', i, 'link', e.target.value)} />
                                <textarea style={styles.textarea} placeholder="Project details..." value={proj.description} onChange={e => updateField('projects', i, 'description', e.target.value)} />
                            </div>
                        ))}
                    </SectionWrapper>

                    <SectionWrapper title="Academic Background" onAdd={() => addSectionItem('education', {institute:'', degree:'', year:'', gpa:''})}>
                        {cvData.education.map((edu, i) => (
                            <div key={i} style={styles.itemCard}>
                                <div style={{display:'flex', justifyContent:'space-between'}}>
                                    <input style={{...styles.input, fontWeight:'bold', border:'none'}} placeholder="University" value={edu.institute} onChange={e => updateField('education', i, 'institute', e.target.value)} />
                                    <button onClick={() => removeSectionItem('education', i)} style={styles.delBtn}><Trash2 size={14}/></button>
                                </div>
                                <input style={styles.input} placeholder="Degree" value={edu.degree} onChange={e => updateField('education', i, 'degree', e.target.value)} />
                                <input style={styles.input} placeholder="Year / GPA" value={edu.year} onChange={e => updateField('education', i, 'year', e.target.value)} />
                            </div>
                        ))}
                    </SectionWrapper>

                    <SectionWrapper title="Work Experience" onAdd={() => addSectionItem('experience', {company:'', role:'', period:'', metrics:''})}>
                        {cvData.experience.map((exp, i) => (
                            <div key={i} style={styles.itemCard}>
                                <div style={{display:'flex', justifyContent:'space-between'}}>
                                    <input style={{...styles.input, fontWeight:'bold', border:'none'}} placeholder="Company" value={exp.company} onChange={e => updateField('experience', i, 'company', e.target.value)} />
                                    <button onClick={() => removeSectionItem('experience', i)} style={styles.delBtn}><Trash2 size={14}/></button>
                                </div>
                                <input style={styles.input} placeholder="Job Role" value={exp.role} onChange={e => updateField('experience', i, 'role', e.target.value)} />
                                <textarea style={styles.textarea} placeholder="Achievements..." value={exp.metrics} onChange={e => updateField('experience', i, 'metrics', e.target.value)} />
                            </div>
                        ))}
                    </SectionWrapper>

                    <SectionWrapper title="Skills" onAdd={() => addSectionItem('skills', {name:'', level:'Expert'})}>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                            {cvData.skills.map((sk, i) => (
                                <div key={i} style={styles.skillInputWrapper}>
                                    <input style={{border:'none', background:'none', fontSize:'12px', width:'100%'}} placeholder="Skill" value={sk.name} onChange={e => updateField('skills', i, 'name', e.target.value)} />
                                    <button onClick={() => removeSectionItem('skills', i)} style={styles.delBtn}><X size={12}/></button>
                                </div>
                            ))}
                        </div>
                    </SectionWrapper>
                </div>

                <div style={styles.actionFooter}>
                    <button onClick={saveCVToProfile} style={styles.saveBtn}><Cloud size={18}/> Save</button>
                    <button onClick={exportPDF} style={styles.pdfBtn}><Download size={18}/> Export PDF</button>
                </div>
            </aside>

            {/* PREVIEW PANEL */}
            <main style={styles.previewPane}>
                <div id="resume-preview" style={styles.a4}>
                    <div style={styles.cvHeader}>
                        <div style={{display:'flex', alignItems:'center', gap:'25px'}}>
                            <div style={styles.previewPhotoWrapper}>
                                {cvData.photo ? <img src={cvData.photo} alt="Profile" style={styles.previewPhoto} /> : <User size={40} color="#cbd5e1" />}
                            </div>
                            <div style={{textAlign:'left'}}>
                                <h1 style={styles.cvName}>{cvData.name || "YOUR NAME"}</h1>
                                <p style={styles.cvContact}>{cvData.email} | {cvData.location} | {cvData.phone}</p>
                            </div>
                        </div>
                    </div>

                    <div style={styles.cvBodyGrid}>
                        <div style={{flex: 2}}>
                            <h3 style={styles.cvSectionTitle}><Briefcase size={14}/> Summary</h3>
                            <p style={styles.cvText}>{cvData.summary}</p>

                            <h3 style={styles.cvSectionTitle}><ExternalLink size={14}/> Key Projects</h3>
                            {cvData.projects.map((proj, i) => (
                                <div key={i} style={{marginBottom:'12px'}}>
                                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                                        <strong>{proj.title}</strong>
                                        <span style={{fontSize:'10px', color:'#2563eb'}}>{proj.tech}</span>
                                    </div>
                                    <p style={{...styles.cvText, margin:'2px 0'}}>{proj.description}</p>
                                </div>
                            ))}

                            <h3 style={styles.cvSectionTitle}><Award size={14}/> Work Experience</h3>
                            {cvData.experience.map((exp, i) => (
                                <div key={i} style={{marginBottom:'10px'}}>
                                    <strong>{exp.company}</strong> — <i>{exp.role}</i>
                                    <p style={styles.cvText}>{exp.metrics}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{flex: 1, paddingLeft:'20px', borderLeft:'1px solid #f1f5f9'}}>
                            <h3 style={styles.cvSectionTitle}><GraduationCap size={16}/> Education</h3>
                            {cvData.education.map((edu, i) => (
                                <div key={i} style={{marginBottom:'12px'}}>
                                    <div style={{fontWeight:'bold', fontSize:'12px'}}>{edu.institute}</div>
                                    <div style={{fontSize:'11px'}}>{edu.degree}</div>
                                    <div style={{fontSize:'10px', color:'#64748b'}}>{edu.year}</div>
                                </div>
                            ))}

                            <h3 style={styles.cvSectionTitle}><Code size={14}/> Core Skills</h3>
                            <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                                {cvData.skills.map((sk, i) => (
                                    <span key={i} style={styles.skillTag}>{sk.name}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

const styles = {
    container: { display: 'flex', height: '100vh', background: '#f1f5f9', overflow:'hidden' },
    editorPane: { width: '450px', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '20px' },
    paneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    formScroll: { flex: 1, overflowY: 'auto', paddingRight:'10px' },
    photoUploadZone: { width: '80px', height: '80px', borderRadius: '12px', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', background: '#f8fafc' },
    photoPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
    photoPreviewCircle: { width: '100%', height: '100%', objectFit: 'cover' },
    previewPhotoWrapper: { width: '90px', height: '90px', borderRadius: '10px', background: '#f8fafc', border: '2px solid #2563eb', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    previewPhoto: { width: '100%', height: '100%', objectFit: 'cover' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' },
    textarea: { width: '100%', height: '70px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box', marginBottom:'10px' },
    itemCard: { padding: '15px', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '15px', background:'#fcfdfe' },
    skillInputWrapper: { display:'flex', gap:'5px', alignItems:'center', background:'#f8fafc', padding:'5px', borderRadius:'8px', border:'1px solid #e2e8f0' },
    delBtn: { background:'none', border:'none', color:'#ef4444', cursor:'pointer' },
    addCircle: { background: '#2563eb', color: '#fff', border: 'none', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer' },
    actionFooter: { display: 'flex', gap: '10px', paddingTop: '20px', borderTop:'1px solid #eee' },
    saveBtn: { flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #2563eb', color: '#2563eb', background: '#fff', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', fontWeight:'bold' },
    pdfBtn: { flex: 1, padding: '12px', borderRadius: '10px', border: 'none', color: '#fff', background: '#2563eb', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', fontWeight:'bold' },
    previewPane: { flex: 1, padding: '40px', overflowY: 'auto', background: '#334155', display: 'flex', justifyContent: 'center' },
    a4: { width: '210mm', minHeight: '297mm', background: '#fff', padding: '15mm', boxShadow: '0 0 40px rgba(0,0,0,0.5)', boxSizing:'border-box' },
    cvHeader: { borderBottom: '2px solid #2563eb', paddingBottom: '15px', marginBottom: '15px' },
    cvName: { margin: 0, fontSize: '26px', fontWeight: '900', color:'#1e293b' },
    cvContact: { color: '#64748b', fontSize: '11px', marginTop:'5px' },
    cvBodyGrid: { display: 'flex', gap: '20px' },
    cvSectionTitle: { fontSize:'12px', fontWeight:'900', borderBottom:'1px solid #e2e8f0', paddingBottom:'4px', marginTop:'18px', marginBottom:'8px', textTransform:'uppercase', color:'#2563eb', display:'flex', alignItems:'center', gap:'6px' },
    cvText: { fontSize: '12px', lineHeight: '1.5', color:'#475569' },
    skillTag: { background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', color: '#334155', border: '1px solid #e2e8f0' }
};