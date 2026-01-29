import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Calendar, DollarSign, Send, XCircle, CheckCircle } from 'lucide-react';

const API_BASE = "http://localhost:5000/api";

export default function AdminPostJob({ user, setView }) {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        category: '',
        location: 'Remote',
        salary: 'Negotiable',
        jobType: 'full-time', // Matches lowercase enum in Mongoose
        deadline: '',
        description: '',
        link: ''
    });

    const [categories, setCategories] = useState([]);
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);

    // Sync categories from taxonomy engine
    useEffect(() => {
        const fetchCats = async () => {
            try {
                // Fixed endpoint to match your optimized backend route
                const res = await axios.get(`${API_BASE}/categories?group=job`);
                // Check if response has .categories array or is the array itself
                const catList = res.data.categories || (Array.isArray(res.data) ? res.data : []);
                setCategories(catList);
            } catch (err) {
                console.error("❌ Failed to fetch job categories:", err);
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
            setStatus({ type: 'error', msg: 'Please select an Industry Sector.' });
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
            
            // Map the category string to the actual MongoDB Object ID
            const selectedCatDoc = categories.find(c => c.name === formData.category);
            
            const submissionData = {
                ...formData,
                categoryRef: selectedCatDoc?._id // Essential for relational integrity
            };

            const res = await axios.post(`${API_BASE}/jobs/create`, submissionData, config);

            if (res.data.success) {
                setStatus({ type: 'success', msg: 'Job Vacancy Deployed Successfully!' });
                // Reset form on success
                setTimeout(() => setView('jobs'), 1500);
            }
        } catch (err) {
            console.error("Submission Error:", err.response?.data);
            setStatus({ 
                type: 'error', 
                msg: err.response?.data?.message || "Deployment failed. Check admin permissions." 
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
                    <p style={styles.headerSubtitle}>TalentBD 2026 Recruitment Management</p>
                </header>

                {status.msg && (
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ 
                            ...styles.alert, 
                            backgroundColor: status.type === 'success' ? '#ecfdf5' : '#fef2f2',
                            border: `1px solid ${status.type === 'success' ? '#10b981' : '#ef4444'}`
                        }}
                    >
                        {status.type === 'success' ? <CheckCircle size={18} color="#059669" /> : <XCircle size={18} color="#dc2626" />}
                        <span style={{ color: status.type === 'success' ? '#065f46' : '#991b1b' }}>{status.msg}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} style={styles.formGrid}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Job Title</label>
                        <input name="title" value={formData.title} required style={styles.input} placeholder="e.g. Senior MERN Developer" onChange={handleChange} />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Company Name</label>
                        <input name="company" value={formData.company} required style={styles.input} placeholder="e.g. TalentBD Tech" onChange={handleChange} />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Industry Sector</label>
                        <select name="category" value={formData.category} required style={styles.input} onChange={handleChange}>
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Employment Type</label>
                        <select name="jobType" value={formData.jobType} style={styles.input} onChange={handleChange}>
                            <option value="full-time">Full-time</option>
                            <option value="part-time">Part-time</option>
                            <option value="contract">Contract</option>
                            <option value="internship">Internship</option>
                            <option value="freelance">Freelance</option>
                        </select>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}><MapPin size={14} /> Location</label>
                        <input name="location" value={formData.location} style={styles.input} placeholder="e.g. Remote or Dhaka" onChange={handleChange} />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}><Calendar size={14} /> Application Deadline</label>
                        <input type="date" name="deadline" value={formData.deadline} required style={styles.input} onChange={handleChange} />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}><DollarSign size={14} /> Salary Range</label>
                        <input name="salary" value={formData.salary} style={styles.input} placeholder="e.g. 80,000 - 120,000 BDT" onChange={handleChange} />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>External Apply Link</label>
                        <input name="link" value={formData.link} style={styles.input} placeholder="https://company.com/apply" onChange={handleChange} />
                    </div>

                    <div style={{ ...styles.inputGroup, gridColumn: '1 / span 2' }}>
                        <label style={styles.label}>Job Description</label>
                        <textarea name="description" value={formData.description} required style={{ ...styles.input, height: '120px', resize: 'none' }} placeholder="Specify requirements and responsibilities..." onChange={handleChange}></textarea>
                    </div>

                    <button type="submit" disabled={loading} style={{
                        ...styles.submitBtn,
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}>
                        {loading ? 'Processing...' : <><Send size={18} /> Deploy to Career Board</>}
                    </button>
                </form>
            </div>
        </motion.div>
    );
}

const styles = {
    container: { maxWidth: '850px', margin: '0 auto', padding: '40px 20px' },
    card: { background: '#fff', borderRadius: '28px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
    header: { textAlign: 'center', marginBottom: '30px' },
    iconCircle: { width: '56px', height: '56px', background: '#2563eb', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' },
    headerTitle: { fontSize: '22px', fontWeight: '800', margin: 0, color: '#1e293b', letterSpacing: '-0.5px' },
    headerSubtitle: { color: '#64748b', fontSize: '13px', marginTop: '4px', fontWeight: '500' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '12px', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { padding: '13px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', outline: 'none', transition: 'all 0.2s ease', color: '#1e293b' },
    alert: { gridColumn: '1 / span 2', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', fontSize: '14px', fontWeight: '700' },
    submitBtn: { gridColumn: '1 / span 2', background: '#2563eb', color: '#fff', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px', transition: 'transform 0.1s active' }
};