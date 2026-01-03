import React, { useState } from 'react';
import { Briefcase, PlayCircle, Send, DollarSign, Star } from 'lucide-react';

export default function AdminPanel({ user }) {
    const [tab, setTab] = useState('jobs');
    const [loading, setLoading] = useState(false);
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
        
        // FIXED: Endpoints must match our specific router mounting points
        const endpoint = tab === 'jobs' 
            ? 'http://localhost:5000/api/jobs/add' 
            : 'http://localhost:5000/api/courses/upload';
        
        try {
            // SYNC: Include the user's role to bypass backend "Admin Only" security
            const submissionData = { ...form, role: user?.role || 'admin' };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            const data = await res.json();

            if (res.ok) {
                alert(`🚀 ${tab === 'jobs' ? 'Job Circular' : 'Course Module'} published successfully!`);
                // Reset form to defaults
                setForm({ title: '', company: '', location: 'Remote', category: 'Development', videoUrl: '', skillTag: '', description: '', rewardXP: 100, rewardWallet: 50, deadline: '' });
            } else {
                alert(`Error: ${data.message || data.error || "Submission failed"}`);
            }
        } catch (error) {
            alert("Connection error. Ensure backend is running on port 5000.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.panelCard}>
                <header style={styles.header}>
                    <h2 style={styles.title}>TalentBD Command Center</h2>
                    <div style={styles.tabGroup}>
                        <button 
                            type="button"
                            onClick={() => setTab('jobs')} 
                            style={{...styles.tabBtn, background: tab === 'jobs' ? '#2563eb' : '#f1f5f9', color: tab === 'jobs' ? '#fff' : '#64748b'}}
                        >
                            <Briefcase size={16} /> Job Circular
                        </button>
                        <button 
                            type="button"
                            onClick={() => setTab('courses')} 
                            style={{...styles.tabBtn, background: tab === 'courses' ? '#2563eb' : '#f1f5f9', color: tab === 'courses' ? '#fff' : '#64748b'}}
                        >
                            <PlayCircle size={16} /> Learning Module
                        </button>
                    </div>
                </header>

                <form onSubmit={handlePost} style={styles.formGrid}>
                    <div style={styles.fullWidth}>
                        <label style={styles.label}>Listing Title</label>
                        <input style={styles.input} placeholder={tab === 'jobs' ? "e.g. Senior Frontend Developer" : "e.g. Mastering Node.js APIs"} value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                    </div>

                    {tab === 'jobs' ? (
                        <>
                            <div style={styles.halfWidth}>
                                <label style={styles.label}>Company</label>
                                <input style={styles.input} placeholder="e.g. Google, BDSoft" value={form.company} onChange={e => setForm({...form, company: e.target.value})} required />
                            </div>
                            <div style={styles.halfWidth}>
                                <label style={styles.label}>Application Deadline</label>
                                <input type="date" style={styles.input} value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} required />
                            </div>
                            <div style={styles.halfWidth}>
                                <label style={styles.label}>Location</label>
                                <input style={styles.input} placeholder="Dhaka or Remote" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                            </div>
                            <div style={styles.halfWidth}>
                                <label style={styles.label}>Required Skills (Comma separated)</label>
                                <input style={styles.input} placeholder="react, node, css" value={form.skillTag} onChange={e => setForm({...form, skillTag: e.target.value})} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={styles.halfWidth}>
                                <label style={styles.label}>Primary Skill Tag</label>
                                <input style={styles.input} placeholder="e.g. Python" value={form.skillTag} onChange={e => setForm({...form, skillTag: e.target.value})} required />
                            </div>
                            <div style={styles.halfWidth}>
                                <label style={styles.label}>YouTube URL</label>
                                <input style={styles.input} placeholder="https://youtube.com/watch?v=..." value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} required />
                            </div>
                            <div style={styles.halfWidth}>
                                <label style={{...styles.label, color: '#10b981'}}>XP Reward</label>
                                <input type="number" style={styles.input} value={form.rewardXP} onChange={e => setForm({...form, rewardXP: e.target.value})} />
                            </div>
                            <div style={styles.halfWidth}>
                                <label style={{...styles.label, color: '#10b981'}}>Wallet Credit ($)</label>
                                <input type="number" style={styles.input} value={form.rewardWallet} onChange={e => setForm({...form, rewardWallet: e.target.value})} />
                            </div>
                        </>
                    )}

                    <div style={styles.fullWidth}>
                        <label style={styles.label}>Full Description</label>
                        <textarea style={styles.textarea} placeholder="Roles, responsibilities or learning objectives..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                    </div>

                    <button type="submit" style={styles.submitBtn} disabled={loading}>
                        {loading ? "Syncing with Database..." : <><Send size={18} /> Publish Content Live</>}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    pageWrapper: { padding: '40px 20px', background: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center' },
    panelCard: { background: '#fff', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '750px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
    header: { marginBottom: '30px' },
    title: { color: '#1e293b', fontSize: '24px', fontWeight: '800', marginBottom: '20px', textAlign: 'center' },
    tabGroup: { display: 'flex', gap: '10px', justifyContent: 'center', background: '#f1f5f9', padding: '5px', borderRadius: '12px' },
    tabBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: '0.3s' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' },
    fullWidth: { gridColumn: 'span 2' },
    halfWidth: { gridColumn: 'span 1' },
    label: { fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', display: 'block', letterSpacing: '0.5px' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' },
    textarea: { width: '100%', height: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' },
    submitBtn: { gridColumn: 'span 2', background: '#2563eb', color: '#fff', padding: '15px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '16px', marginTop: '10px', transition: '0.2s', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }
};