import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    MapPin, Briefcase, Calendar, DollarSign, 
    ExternalLink, ChevronLeft, Building2, Clock 
} from 'lucide-react';

export default function JobDescription({ job, setView }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    // Update layout based on window size
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!job) return null;

    // Logic for 2026 Live Deadlines
    const deadlineDate = new Date(job.deadline);
    const isExpired = deadlineDate < new Date();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            style={styles.container}
        >
            {/* Header / Back Navigation */}
            <button onClick={() => setView('jobs')} style={styles.backBtn}>
                <ChevronLeft size={18} /> Back to Career Feed
            </button>

            <div style={{
                ...styles.layout,
                gridTemplateColumns: isMobile ? '1fr' : '1fr 350px'
            }}>
                {/* Main Content Area */}
                <div style={styles.main}>
                    <div style={styles.card}>
                        <div style={styles.header}>
                            <div style={styles.meta}>
                                <span style={{
                                    ...styles.badge, 
                                    backgroundColor: isExpired ? '#fee2e2' : '#dcfce7',
                                    color: isExpired ? '#dc2626' : '#16a34a'
                                }}>
                                    {isExpired ? 'Application Closed' : 'Active Opportunity'}
                                </span>
                                <span style={styles.typeBadge}>{job.jobType}</span>
                            </div>
                            <h1 style={styles.title}>{job.title}</h1>
                            <div style={styles.companyRow}>
                                <Building2 size={20} color="#64748b" />
                                <span style={styles.companyName}>{job.company}</span>
                            </div>
                        </div>

                        <hr style={styles.divider} />

                        <div style={styles.content}>
                            <h3 style={styles.sectionTitle}>Role Description</h3>
                            {/* whiteSpace: 'pre-line' ensures line breaks from the database render correctly */}
                            <p style={styles.descriptionText}>{job.description}</p>
                            
                            {job.requiredSkills && job.requiredSkills.length > 0 && (
                                <div style={{ marginTop: '35px' }}>
                                    <h3 style={styles.sectionTitle}>Required Expertise</h3>
                                    <div style={styles.skillsGrid}>
                                        {job.requiredSkills.map((skill, idx) => (
                                            <span key={idx} style={styles.skillTag}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <aside style={{
                    ...styles.sidebar,
                    marginTop: isMobile ? '20px' : '0'
                }}>
                    <div style={styles.sidebarCard}>
                        <h4 style={styles.sidebarTitle}>Position Summary</h4>
                        
                        <div style={styles.infoItem}>
                            <MapPin size={18} color="#2563eb" />
                            <div>
                                <small style={styles.infoLabel}>Location</small>
                                <p style={styles.infoValue}>
                                    {job.location} {job.isRemote && <span style={styles.remoteTag}>(Remote)</span>}
                                </p>
                            </div>
                        </div>

                        <div style={styles.infoItem}>
                            <DollarSign size={18} color="#2563eb" />
                            <div>
                                <small style={styles.infoLabel}>Remuneration</small>
                                <p style={styles.infoValue}>{job.salary}</p>
                            </div>
                        </div>

                        <div style={styles.infoItem}>
                            <Clock size={18} color="#2563eb" />
                            <div>
                                <small style={styles.infoLabel}>Experience Level</small>
                                <p style={styles.infoValue}>{job.experience || 'Entry Level'}</p>
                            </div>
                        </div>

                        <div style={styles.infoItem}>
                            <Calendar size={18} color="#2563eb" />
                            <div>
                                <small style={styles.infoLabel}>Application Deadline</small>
                                <p style={styles.infoValue}>{deadlineDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        <a 
                            href={job.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{
                                ...styles.applyBtn,
                                backgroundColor: isExpired ? '#94a3b8' : '#2563eb',
                                cursor: isExpired ? 'not-allowed' : 'pointer',
                                pointerEvents: isExpired ? 'none' : 'auto'
                            }}
                        >
                            {isExpired ? 'Applications Closed' : 'Apply for this Position'} 
                            {!isExpired && <ExternalLink size={18} />}
                        </a>
                        
                        {!isExpired && (
                            <p style={styles.secureNote}>🚀 TalentBD verified official vacancy.</p>
                        )}
                    </div>
                </aside>
            </div>
        </motion.div>
    );
}

const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
    backBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#64748b', fontWeight: '700', cursor: 'pointer', marginBottom: '20px', transition: '0.2s' },
    layout: { display: 'grid', gap: '30px' },
    main: { minWidth: 0 },
    card: { background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: 'clamp(20px, 5vw, 40px)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' },
    header: { marginBottom: '30px' },
    meta: { display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' },
    badge: { padding: '4px 12px', borderRadius: '50px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' },
    typeBadge: { background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '50px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' },
    title: { fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '900', color: '#0f172a', marginBottom: '10px', lineHeight: 1.2 },
    companyRow: { display: 'flex', alignItems: 'center', gap: '8px' },
    companyName: { fontSize: '18px', color: '#475569', fontWeight: '600' },
    divider: { border: 'none', height: '1px', background: '#f1f5f9', margin: '30px 0' },
    sectionTitle: { fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    descriptionText: { color: '#475569', lineHeight: '1.8', fontSize: '16px', whiteSpace: 'pre-line' },
    skillsGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
    skillTag: { background: '#eff6ff', border: '1px solid #dbeafe', color: '#2563eb', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: '700' },
    sidebarCard: { background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '30px', position: 'sticky', top: '100px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' },
    sidebarTitle: { fontSize: '16px', fontWeight: '900', color: '#0f172a', marginBottom: '25px', textTransform: 'uppercase' },
    infoItem: { display: 'flex', gap: '15px', marginBottom: '20px' },
    infoLabel: { color: '#94a3b8', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' },
    infoValue: { color: '#1e293b', fontSize: '14px', fontWeight: '700', margin: 0 },
    remoteTag: { color: '#2563eb', fontWeight: '800' },
    applyBtn: { marginTop: '20px', width: '100%', color: '#fff', border: 'none', padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textDecoration: 'none', transition: '0.3s' },
    secureNote: { textAlign: 'center', fontSize: '12px', color: '#64748b', marginTop: '15px', fontWeight: '600' }
};