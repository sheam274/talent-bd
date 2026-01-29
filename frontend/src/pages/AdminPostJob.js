import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Calendar, DollarSign, XCircle, CheckCircle } from 'lucide-react';

// Dynamic API detection for 2026 Environment
const API_BASE = window.location.hostname === 'localhost' 
    ? "http://localhost:5000/api" 
    : "https://talent-bd-backend.onrender.com/api";

export default function AdminPostJob({ user, setView }) {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        category: '',
        location: 'Remote',
        salary: 'Negotiable',
        jobType: 'full-time',
        deadline: '',
        description: '',
        link: ''
    });

    const [categories, setCategories] = useState([]);
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);

    // --- 1. SYNC CATEGORIES FROM BACKEND ---
    useEffect(() => {
        const fetchCats = async () => {
            try {
                // Fetching specifically the 'job' group sectors
                const res = await axios.get(`${API_BASE}/categories?group=job`);
                
                // Extracting the array correctly from your standard response pattern
                const catList = res.data.categories || (Array.isArray(res.data) ? res.data : []);
                setCategories(catList);
            } catch (err) {
                console.error("❌ Taxonomy Engine Offline:", err);
                setStatus({ type: 'error', msg: 'Could not load Industry Sectors. Please check backend.' });
            }
        };
        fetchCats();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.category) {
            setStatus({ type: 'error', msg: 'Please select an Industry Sector to continue.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', msg: '' });

        try {
            const config = { 
                headers: { 
                    Authorization: `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                } 
            };
            
            // RELATIONAL LINKING: Map the selected string name back to its MongoDB ObjectID
            const selectedCatDoc = categories.find(c => c.name === formData.category);
            
            const submissionData = {
                ...formData,
                categoryRef: selectedCatDoc?._id, // This enables advanced filtering
                isActive: true
            };

            // Using the /admin/jobs route to trigger isAdmin middleware checks
            const res = await axios.post(`${API_BASE}/admin/jobs`, submissionData, config);

            if (res.data.success) {
                setStatus({ type: 'success', msg: '🚀 Vacancy successfully deployed to TalentBD board!' });
                // Redirect to job feed after success
                setTimeout(() => setView('jobs'), 2000);
            }
        } catch (err) {
            setStatus({ 
                type: 'error', 
                msg: err.response?.data?.message || "Deployment failed. Check all required fields." 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            style={styles.container}
        >
            <div style={styles.card}>
                <header style={styles.header}>
                    <div style={styles.iconCircle}><Briefcase color="#fff" /></div>
                    <h2 style={styles.headerTitle}>Post Official Vacancy</h2>
                    <p style={styles.headerSubtitle}>TalentBD Recruitment Management</p>
                </header>

                {status.msg && (
                    <div style={{ 
                        ...styles.alert, 
                        backgroundColor: status.type === 'success' ? '#ecfdf5' : '#fef2f2',
                        border: `1px solid ${status.type === 'success' ? '#10b981' : '#ef4444'}`
                    }}>
                        {status.type === 'success' ? <CheckCircle size={18} color="#059669" /> : <XCircle size={18} color="#dc2626" />}
                        <span style={{ color: status.type === 'success' ? '#065f46' : '#991b1b', fontWeight: '600' }}>
                            {status.msg}
                        </span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.formGrid}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Job Title</label>
                        <input name="title" value={formData.title} required style={styles.input} placeholder="e.g. Senior Node.js Developer" onChange={handleChange} />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Company Name</label>
                        <input name="company" value={formData.company} required style={styles.input} placeholder="Company Name Ltd." onChange={handleChange} />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Industry Sector</label>
                        <select 
                            name="category" 
                            value={formData.category} 
                            required 
                            style={styles.select} 
                            onChange={handleChange}
                        >
                            <option value="">-- Select Sector --</option>
                            {categories.length > 0 ? (
                                categories.map(cat => (
                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                ))
                            ) : (
                                <option disabled>No Sectors Found (Syncing...)</option>
                            )}
                        </select>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Employment Type</label>
                        <select name="jobType" value={formData.jobType} style={styles.select} onChange={handleChange}>
                            <option value="full-time">Full-time</option>
                            <option value="part-time">Part-time</option>
                            <option value="contract">Contract</option>
                            <option value="internship">Internship</option>
                            <option value="freelance">Freelance</option>
                        </select>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}><MapPin size={14} /> Location</label>
                        <input name="location" value={formData.location} style={styles.input} placeholder="e.g. Dhaka (Remote)" onChange={handleChange} />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}><Calendar size={14} /> Application Deadline</label>
                        <input type="date" name="deadline" value={formData.deadline} required style={styles.input} onChange={handleChange} />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}><DollarSign size={14} /> Salary Scale</label>
                        <input name="salary" value={formData.salary} style={styles.input} placeholder="e.g. 100k - 150k BDT" onChange={handleChange} />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Official Apply Link</label>
                        <input name="link" value={formData.link} style={styles.input} placeholder="https://careers.company.com/..." onChange={handleChange} />
                    </div>

                    <div style={{ ...styles.inputGroup, gridColumn: '1 / span 2' }}>
                        <label style={styles.label}>Job Description & Requirements</label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            required 
                            style={{ ...styles.input, height: '150px', resize: 'none' }} 
                            placeholder="Paste the full job responsibilities and technical requirements here..."
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" disabled={loading} style={{
                        ...styles.submitBtn,
                        backgroundColor: loading ? '#94a3b8' : '#2563eb'
                    }}>
                        {loading ? 'Deploying to TalentBD...' : 'Publish Vacancy Now'}
                    </button>
                </form>
            </div>
        </motion.div>
    );
}

const styles = {
    container: { maxWidth: '850px', margin: '0 auto', padding: '40px 20px' },
    card: { background: '#fff', borderRadius: '32px', padding: 'clamp(20px, 5vw, 40px)', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
    header: { textAlign: 'center', marginBottom: '35px' },
    iconCircle: { width: '50px', height: '50px', background: '#2563eb', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' },
    headerTitle: { fontSize: '22px', fontWeight: '900', margin: 0, color: '#0f172a' },
    headerSubtitle: { color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' },
    input: { padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', outline: 'none', transition: '0.2s', fontWeight: '600' },
    select: { padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', outline: 'none', appearance: 'none', fontWeight: '600' },
    alert: { gridColumn: '1 / -1', padding: '14px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' },
    submitBtn: { gridColumn: '1 / -1', color: '#fff', padding: '18px', borderRadius: '16px', border: 'none', fontWeight: '900', fontSize: '16px', cursor: 'pointer', transition: '0.3s', marginTop: '10px' }
};