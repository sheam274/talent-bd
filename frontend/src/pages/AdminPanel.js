import React, { useState, useEffect } from 'react';
import { Briefcase, PlayCircle, Send, DollarSign, Star, Zap, Globe, Clock, ShieldCheck } from 'lucide-react';

export default function AdminPanel({ user }) {
    const [tab, setTab] = useState('jobs');
    const [loading, setLoading] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    
    // Track responsiveness for HP-840 vs Mobile
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    const [form, setForm] = useState({ 
        title: '', 
        company: '', 
        location: 'Remote', 
        category: 'Development', 
        videoUrl: '', 
        skillTag: '', 
        description: '',
        rewardXP: 100,
        rewardWallet: 50,
        deadline: ''
    });

    const handlePost = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const endpoint = tab === 'jobs' 
            ? 'http://localhost:5000/api/jobs/add' 
            : 'http://localhost:5000/api/courses/upload';
        
        try {
            const submissionData = { ...form, role: user?.role || 'admin' };
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            const data = await res.json();
            if (res.ok) {
                alert(`🚀 SUCCESS: ${tab === 'jobs' ? 'Job Circular' : 'Course Module'} is now LIVE!`);
                setForm({ title: '', company: '', location: 'Remote', category: 'Development', videoUrl: '', skillTag: '', description: '', rewardXP: 100, rewardWallet: 50, deadline: '' });
            } else {
                alert(`Error: ${data.message || data.error || "Submission failed"}`);
            }
        } catch (error) {
            alert("Connection error. Ensure backend is running on port 5000 at 44°C.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={{...styles.panelCard, width: isMobile ? '95%' : '100%'}}>
                <header style={styles.header}>
                    <div style={styles.badge}><ShieldCheck size={12} /> Admin Mode</div>
                    <h2 style={styles.title}>Talent<span style={{color: '#2563eb'}}>BD</span> Command Center</h2>
                    <p style={styles.subtitle}>Deploy high-value content to the Bangladeshi Talent ecosystem</p>
                    
                    <div style={styles.tabGroup}>
                        <button 
                            type="button"
                            onClick={() => setTab('jobs')} 
                            style={{...styles.tabBtn, background: tab === 'jobs' ? '#2563eb' : 'transparent', color: tab === 'jobs' ? '#fff' : '#64748b'}}
                        >
                            <Briefcase size={16} /> Job Post
                        </button>
                        <button 
                            type="button"
                            onClick={() => setTab('courses')} 
                            style={{...styles.tabBtn, background: tab === 'courses' ? '#2563eb' : 'transparent', color: tab === 'courses' ? '#fff' : '#64748b'}}
                        >
                            <PlayCircle size={16} /> Course Post
                        </button>
                    </div>
                </header>

                <form onSubmit={handlePost} style={{
                    ...styles.formGrid, 
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)'
                }}>
                    <div style={styles.fullWidth}>
                        <label style={styles.label}>Listing Title</label>
                        <div style={styles.inputWrapper}>
                            <Zap size={16} style={styles.innerIcon} />
                            <input style={styles.inputWithIcon} placeholder={tab === 'jobs' ? "e.g. Senior MERN Stack Developer" : "e.g. Advanced Python Certification"} value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                        </div>
                    </div>

                    {tab === 'jobs' ? (
                        <>
                            <div style={isMobile ? styles.fullWidth : styles.halfWidth}>
                                <label style={styles.label}>Company Name</label>
                                <input style={styles.input} placeholder="e.g. Pathao, Tiger IT" value={form.company} onChange={e => setForm({...form, company: e.target.value})} required />
                            </div>
                            <div style={isMobile ? styles.fullWidth : styles.halfWidth}>
                                <label style={styles.label}>Deadline</label>
                                <div style={styles.inputWrapper}>
                                    <Clock size={16} style={styles.innerIcon} />
                                    <input type="date" style={styles.inputWithIcon} value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} required />
                                </div>
                            </div>
                            <div style={isMobile ? styles.fullWidth : styles.halfWidth}>
                                <label style={styles.label}>Work Location</label>
                                <div style={styles.inputWrapper}>
                                    <Globe size={16} style={styles.innerIcon} />
                                    <input style={styles.inputWithIcon} placeholder="e.g. Banani, Dhaka / Remote" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                                </div>
                            </div>
                            <div style={isMobile ? styles.fullWidth : styles.halfWidth}>
                                <label style={styles.label}>Required Skills (Tags)</label>
                                <input style={styles.input} placeholder="react, node, mongodb" value={form.skillTag} onChange={e => setForm({...form, skillTag: e.target.value})} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={isMobile ? styles.fullWidth : styles.halfWidth}>
                                <label style={styles.label}>Skill Badge Category</label>
                                <select style={styles.input} value={form.skillTag} onChange={e => setForm({...form, skillTag: e.target.value})} required>
                                    <option value="">Select Category</option>
                                    <option value="frontend">Frontend</option>
                                    <option value="backend">Backend</option>
                                    <option value="design">Graphic Design</option>
                                    <option value="marketing">Digital Marketing</option>
                                </select>
                            </div>
                            <div style={isMobile ? styles.fullWidth : styles.halfWidth}>
                                <label style={styles.label}>YouTube URL</label>
                                <input style={styles.input} placeholder="https://youtube.com/watch?v=..." value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} required />
                            </div>
                            <div style={isMobile ? styles.fullWidth : styles.halfWidth}>
                                <label style={{...styles.label, color: '#059669'}}>Certification XP</label>
                                <div style={styles.inputWrapper}>
                                    <Star size={16} style={{...styles.innerIcon, color: '#059669'}} />
                                    <input type="number" style={styles.inputWithIcon} value={form.rewardXP} onChange={e => setForm({...form, rewardXP: e.target.value})} />
                                </div>
                            </div>
                            <div style={isMobile ? styles.fullWidth : styles.halfWidth}>
                                <label style={{...styles.label, color: '#059669'}}>Wallet Credit (৳)</label>
                                <div style={styles.inputWrapper}>
                                    <DollarSign size={16} style={{...styles.innerIcon, color: '#059669'}} />
                                    <input type="number" style={styles.inputWithIcon} value={form.rewardWallet} onChange={e => setForm({...form, rewardWallet: e.target.value})} />
                                </div>
                            </div>
                        </>
                    )}

                    <div style={styles.fullWidth}>
                        <label style={styles.label}>Listing Details & Requirements</label>
                        <textarea style={styles.textarea} placeholder="Describe the opportunity or the learning path..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                    </div>

                    <button type="submit" style={styles.submitBtn} disabled={loading}>
                        {loading ? "SYNCING CLOUD..." : <><Send size={18} /> DEPLOY CONTENT</>}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    pageWrapper: { padding: '60px 20px', background: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' },
    panelCard: { background: '#fff', padding: '40px', borderRadius: '24px', maxWidth: '850px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
    header: { marginBottom: '35px', textAlign: 'center' },
    badge: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef2f2', color: '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '15px' },
    title: { color: '#0f172a', fontSize: '28px', fontWeight: '900', marginBottom: '10px', letterSpacing: '-0.5px' },
    subtitle: { color: '#64748b', fontSize: '14px', marginBottom: '30px' },
    tabGroup: { display: 'flex', gap: '8px', justifyContent: 'center', background: '#f1f5f9', padding: '6px', borderRadius: '16px', maxWidth: '350px', margin: '0 auto' },
    tabBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '13px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
    formGrid: { display: 'grid', gap: '20px' },
    fullWidth: { gridColumn: 'span 2' },
    halfWidth: { gridColumn: 'span 1' },
    label: { fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '1px' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    innerIcon: { position: 'absolute', left: '14px', color: '#94a3b8' },
    inputWithIcon: { width: '100%', padding: '14px 14px 14px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', background: '#fcfdfe', outline: 'none', transition: 'border 0.2s' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', background: '#fcfdfe', outline: 'none' },
    textarea: { width: '100%', height: '140px', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', background: '#fcfdfe', outline: 'none', fontFamily: 'inherit', resize: 'none' },
    submitBtn: { gridColumn: 'span 2', background: '#0f172a', color: '#fff', padding: '18px', borderRadius: '16px', border: 'none', fontWeight: '900', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', fontSize: '15px', marginTop: '20px', transition: 'all 0.3s', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
};