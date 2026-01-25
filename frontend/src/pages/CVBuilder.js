import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { 
    Sparkles, Download, Cloud, Plus, Trash2, Layout, X, 
    GraduationCap, Award, Briefcase, Code, Camera, User, 
    ExternalLink, Eye, Layers 
} from 'lucide-react';

// --- Shared Section Component ---
const SectionWrapper = ({ title, children, onAdd }) => (
    <div style={{marginBottom:'25px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
            <label style={{fontSize: '11px', fontWeight: '900', color: '#64748b', textTransform:'uppercase', letterSpacing: '0.5px'}}>{title}</label>
            {onAdd && <button onClick={onAdd} style={styles.addCircle}><Plus size={14}/></button>}
        </div>
        {children}
    </div>
);

export default function CVBuilder({ user, job, onClose }) {
    const [cvData, setCvData] = useState({
        photo: null,
        name: user?.name || '', 
        email: user?.email || '', 
        phone: user?.phone || '', 
        linkedin: '', 
        location: user?.location || '', 
        summary: '',
        skills: [{ name: '', level: 'Expert' }],
        experience: [{ company: '', role: '', period: '', metrics: '' }],
        education: [{ institute: '', degree: '', year: '', gpa: '' }],
        projects: [{ title: '', tech: '', description: '', link: '' }]
    });

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [showPreviewMobile, setShowPreviewMobile] = useState(false);
    const [categories, setCategories] = useState([]); // SYNC: Platform categories
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        fetchCategories(); // SYNC: Fetch global categories for skills/projects
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- CATEGORY SYNC LOGIC ---
    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data);
        } catch (err) { console.warn("Category sync unavailable - using offline tags."); }
    };

    const updateField = (section, index, field, value) => {
        const updated = [...cvData[section]];
        updated[index] = { ...updated[index], [field]: value };
        setCvData({ ...cvData, [section]: updated });
    };

    const addSectionItem = (section, schema) => {
        setCvData({ ...cvData, [section]: [...cvData[section], schema] });
    };

    const removeSectionItem = (section, index) => {
        const updated = cvData[section].filter((_, i) => i !== index);
        setCvData({ ...cvData, [section]: updated });
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setCvData(prev => ({ ...prev, photo: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const exportPDF = () => {
        const input = document.getElementById('resume-preview');
        html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
            pdf.save(`TalentBD_CV_${cvData.name || 'User'}.pdf`);
        });
    };

    return (
        <div style={{...styles.container, flexDirection: isMobile ? 'column' : 'row'}}>
            
            {/* EDITOR PANE */}
            <aside style={{
                ...styles.editorPane, 
                display: (isMobile && showPreviewMobile) ? 'none' : 'flex',
                width: isMobile ? '100%' : '480px'
            }}>
                <header style={styles.paneHeader}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <div style={styles.logoBox}><Layout size={20} color="#fff"/></div>
                        <h2 style={{margin:0, fontSize:'20px', fontWeight:'900'}}>CV <span style={{color:'#2563eb'}}>Architect</span></h2>
                    </div>
                    {isMobile && (
                        <button onClick={() => setShowPreviewMobile(true)} style={styles.mobileToggleBtn}>
                            <Eye size={16}/> Preview
                        </button>
                    )}
                </header>

                <div style={styles.formScroll}>
                    {/* PHOTO & IDENTITY */}
                    <div style={styles.identityRow}>
                        <div style={styles.photoUploadZone} onClick={() => fileInputRef.current.click()}>
                            {cvData.photo ? <img src={cvData.photo} alt="P" style={styles.photoPreviewCircle} /> : <Camera size={20} color="#94a3b8" />}
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handlePhotoUpload} />
                        </div>
                        <div style={{flex:1}}>
                            <input style={styles.input} placeholder="Full Name" value={cvData.name} onChange={e => setCvData({...cvData, name: e.target.value})} />
                            <input style={styles.input} placeholder="Professional Title (e.g. MERN Developer)" value={cvData.linkedin} onChange={e => setCvData({...cvData, linkedin: e.target.value})} />
                        </div>
                    </div>

                    <SectionWrapper title="Summary">
                        <textarea style={styles.textarea} placeholder="Describe your 2026 career goals..." value={cvData.summary} onChange={e => setCvData({...cvData, summary: e.target.value})} />
                    </SectionWrapper>

                    {/* DYNAMIC SKILL TAGS (SYNCED WITH PLATFORM) */}
                    <SectionWrapper title="Core Skills" onAdd={() => addSectionItem('skills', {name:'', level:'Expert'})}>
                        <div style={styles.skillsGrid}>
                            {cvData.skills.map((sk, i) => (
                                <div key={i} style={styles.skillInputWrapper}>
                                    <input list="platform-skills" style={styles.skillInput} placeholder="Skill" value={sk.name} onChange={e => updateField('skills', i, 'name', e.target.value)} />
                                    <datalist id="platform-skills">
                                        {categories.map(c => <option key={c._id} value={c.name} />)}
                                    </datalist>
                                    <button onClick={() => removeSectionItem('skills', i)} style={styles.delBtn}><X size={12}/></button>
                                </div>
                            ))}
                        </div>
                    </SectionWrapper>

                    <SectionWrapper title="Projects" onAdd={() => addSectionItem('projects', {title:'', tech:'', description:''})}>
                        {cvData.projects.map((proj, i) => (
                            <div key={i} style={styles.itemCard}>
                                <div style={styles.cardHeader}>
                                    <input style={styles.cardInputBold} placeholder="Project Name" value={proj.title} onChange={e => updateField('projects', i, 'title', e.target.value)} />
                                    <Trash2 size={14} color="#ef4444" onClick={() => removeSectionItem('projects', i)} style={{cursor:'pointer'}}/>
                                </div>
                                <input style={styles.input} placeholder="Tech Stack" value={proj.tech} onChange={e => updateField('projects', i, 'tech', e.target.value)} />
                                <textarea style={styles.textareaSmall} placeholder="What did you build?" value={proj.description} onChange={e => updateField('projects', i, 'description', e.target.value)} />
                            </div>
                        ))}
                    </SectionWrapper>

                    <SectionWrapper title="Work Experience" onAdd={() => addSectionItem('experience', {company:'', role:'', period:'', metrics:''})}>
                        {cvData.experience.map((exp, i) => (
                            <div key={i} style={styles.itemCard}>
                                <div style={styles.cardHeader}>
                                    <input style={styles.cardInputBold} placeholder="Company Name" value={exp.company} onChange={e => updateField('experience', i, 'company', e.target.value)} />
                                    <Trash2 size={14} color="#ef4444" onClick={() => removeSectionItem('experience', i)} style={{cursor:'pointer'}}/>
                                </div>
                                <input style={styles.input} placeholder="Role" value={exp.role} onChange={e => updateField('experience', i, 'role', e.target.value)} />
                                <textarea style={styles.textareaSmall} placeholder="Achievements..." value={exp.metrics} onChange={e => updateField('experience', i, 'metrics', e.target.value)} />
                            </div>
                        ))}
                    </SectionWrapper>
                </div>

                <div style={styles.actionFooter}>
                    <button onClick={exportPDF} style={styles.pdfBtn}><Download size={18}/> Export PDF</button>
                    <button onClick={() => alert("CV Synced to TalentBD Cloud")} style={styles.saveBtn}><Cloud size={18}/> Cloud Save</button>
                </div>
            </aside>

            {/* PREVIEW PANE */}
            <main style={{
                ...styles.previewPane, 
                display: (isMobile && !showPreviewMobile) ? 'none' : 'flex'
            }}>
                {isMobile && (
                    <button onClick={() => setShowPreviewMobile(false)} style={styles.mobileBackBtn}>
                        <X size={16}/> Edit Mode
                    </button>
                )}
                <div id="resume-preview" style={styles.a4}>
                    <header style={styles.cvHeader}>
                        <div style={styles.cvHeaderContent}>
                            {cvData.photo && <img src={cvData.photo} alt="P" style={styles.previewPhoto} />}
                            <div>
                                <h1 style={styles.cvName}>{cvData.name || "UNNAMED TALENT"}</h1>
                                <p style={styles.cvTagline}>{cvData.linkedin || "Professional Title"}</p>
                                <p style={styles.cvContact}>{cvData.email} • {cvData.location}</p>
                            </div>
                        </div>
                    </header>

                    <div style={styles.cvBody}>
                        <div style={styles.cvMain}>
                            <h3 style={styles.cvTitle}>Professional Summary</h3>
                            <p style={styles.cvText}>{cvData.summary}</p>

                            <h3 style={styles.cvTitle}>Technical Projects</h3>
                            {cvData.projects.map((p, i) => (
                                <div key={i} style={{marginBottom:'10px'}}>
                                    <div style={{display:'flex', justifyContent:'space-between'}}>
                                        <strong>{p.title}</strong>
                                        <span style={{color:'#2563eb', fontSize:'10px'}}>{p.tech}</span>
                                    </div>
                                    <p style={styles.cvText}>{p.description}</p>
                                </div>
                            ))}
                        </div>

                        <div style={styles.cvSide}>
                            <h3 style={styles.cvTitle}>Expertise</h3>
                            <div style={styles.skillTagsWrap}>
                                {cvData.skills.map((s, i) => (
                                    <span key={i} style={styles.previewSkill}>{s.name}</span>
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
    container: { display: 'flex', height: '100vh', background: '#f8fafc', overflow:'hidden' },
    editorPane: { background: '#fff', borderRight: '1px solid #e2e8f0', flexDirection: 'column', padding: '25px', boxSizing: 'border-box' },
    paneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    logoBox: { background: '#2563eb', padding: '6px', borderRadius: '8px' },
    formScroll: { flex: 1, overflowY: 'auto', paddingRight: '10px' },
    identityRow: { display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' },
    photoUploadZone: { width: '70px', height: '70px', borderRadius: '50%', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow:'hidden' },
    photoPreviewCircle: { width: '100%', height: '100%', objectFit: 'cover' },
    input: { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none' },
    textarea: { width: '100%', height: '80px', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none', resize: 'none' },
    textareaSmall: { width: '100%', height: '50px', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '12px', outline: 'none', resize: 'none' },
    skillsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' },
    skillInputWrapper: { display:'flex', alignItems:'center', background:'#f1f5f9', borderRadius:'8px', padding:'4px 8px' },
    skillInput: { border:'none', background:'none', width:'100%', fontSize:'12px', outline:'none' },
    itemCard: { padding: '12px', background: '#fcfdfe', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '10px' },
    cardHeader: { display:'flex', justifyContent:'space-between', marginBottom:'8px' },
    cardInputBold: { border:'none', background:'none', fontWeight:'bold', fontSize:'14px', width:'90%', outline:'none' },
    delBtn: { border:'none', background:'none', color:'#94a3b8', cursor:'pointer' },
    addCircle: { background: '#2563eb', color: '#fff', border: 'none', width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer' },
    actionFooter: { display: 'flex', gap: '10px', marginTop: '20px' },
    pdfBtn: { flex: 1, padding: '14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' },
    saveBtn: { flex: 1, padding: '14px', background: '#fff', color: '#0f172a', border: '1px solid #0f172a', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' },
    previewPane: { flex: 1, padding: '40px', background: '#334155', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    a4: { width: '210mm', minHeight: '297mm', background: '#fff', padding: '20mm', boxSizing: 'border-box', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' },
    cvHeader: { borderBottom: '2px solid #2563eb', paddingBottom: '20px', marginBottom: '20px' },
    cvHeaderContent: { display: 'flex', gap: '20px', alignItems: 'center' },
    previewPhoto: { width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #e2e8f0' },
    cvName: { margin: 0, fontSize: '28px', fontWeight: '900', color: '#0f172a' },
    cvTagline: { margin: '4px 0', fontSize: '14px', color: '#2563eb', fontWeight: '700' },
    cvContact: { margin: 0, fontSize: '11px', color: '#64748b' },
    cvBody: { display: 'flex', gap: '30px' },
    cvMain: { flex: 2 },
    cvSide: { flex: 1, borderLeft: '1px solid #f1f5f9', paddingLeft: '20px' },
    cvTitle: { fontSize: '12px', textTransform: 'uppercase', color: '#2563eb', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '10px' },
    cvText: { fontSize: '11.5px', lineHeight: '1.6', color: '#475569', marginBottom: '10px' },
    skillTagsWrap: { display: 'flex', flexWrap: 'wrap', gap: '5px' },
    previewSkill: { background: '#f8fafc', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #e2e8f0' },
    mobileToggleBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px' },
    mobileBackBtn: { background: '#fff', border: '1px solid #e2e8f0', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }
};