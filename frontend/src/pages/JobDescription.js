import React from 'react';
import { motion } from 'framer-motion';
import { 
    MapPin, Briefcase, Calendar, DollarSign, 
    ExternalLink, ChevronLeft, Building2, Clock 
} from 'lucide-react';

export default function JobDescription({ job, setView }) {
    if (!job) return null;

    const isExpired = new Date(job.deadline) < new Date();

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

            <div style={styles.layout}>
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
                                    {isExpired ? 'Expired' : 'Currently Hiring'}
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
                            <p style={styles.descriptionText}>{job.description}</p>
                            
                            {job.requiredSkills && job.requiredSkills.length > 0 && (
                                <>
                                    <h3 style={styles.sectionTitle}>Required Expertise</h3>
                                    <div style={styles.skillsGrid}>
                                        {job.requiredSkills.map((skill, idx) => (
                                            <span key={idx} style={styles.skillTag}>{skill}</span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <aside style={styles.sidebar}>
                    <div style={styles.sidebarCard}>
                        <h4 style={styles.sidebarTitle}>Job Summary</h4>
                        
                        <div style={styles.infoItem}>
                            <MapPin size={18} color="#2563eb" />
                            <div>
                                <small style={styles.infoLabel}>Location</small>
                                <p style={styles.infoValue}>{job.location} {job.isRemote && '(Remote)'}</p>
                            </div>
                        </div>

                        <div style={styles.infoItem}>
                            <DollarSign size={18} color="#2563eb" />
                            <div>
                                <small style={styles.infoLabel}>Offered Salary</small>
                                <p style={styles.infoValue}>{job.salary}</p>
                            </div>
                        </div>

                        <div style={styles.infoItem}>
                            <Clock size={18} color="#2563eb" />
                            <div>
                                <small style={styles.infoLabel}>Experience</small>
                                <p style={styles.infoValue}>{job.experience || 'Not Specified'}</p>
                            </div>
                        </div>

                        <div style={styles.infoItem}>
                            <Calendar size={18} color="#2563eb" />
                            <div>
                                <small style={styles.infoLabel}>Deadline</small>
                                <p style={styles.infoValue}>{new Date(job.deadline).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <a 
                            href={job.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{
                                ...styles.applyBtn,
                                opacity: isExpired ? 0.6 : 1,
                                pointerEvents: isExpired ? 'none' : 'auto'
                            }}
                        >
                            Apply for this Position <ExternalLink size={18} />
                        </a>
                    </div>
                </aside>
            </div>
        </motion.div>
    );
}

const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
    backBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer', marginBottom: '20px' },
    layout: { display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' },
    main: { minWidth: 0 },
    card: { background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' },
    header: { marginBottom: '30px' },
    meta: { display: 'flex', gap: '10px', marginBottom: '15px' },
    badge: { padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' },
    typeBadge: { background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' },
    title: { fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' },
    companyRow: { display: 'flex', alignItems: 'center', gap: '8px' },
    companyName: { fontSize: '18px', color: '#475569', fontWeight: '600' },
    divider: { border: 'none', height: '1px', background: '#f1f5f9', margin: '30px 0' },
    sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '15px' },
    descriptionText: { color: '#475569', lineHeight: '1.8', fontSize: '16px', whiteSpace: 'pre-line' },
    skillsGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' },
    skillTag: { background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', padding: '6px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600' },
    sidebarCard: { background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '30px', position: 'sticky', top: '100px' },
    sidebarTitle: { fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '25px' },
    infoItem: { display: 'flex', gap: '15px', marginBottom: '20px' },
    infoLabel: { color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' },
    infoValue: { color: '#1e293b', fontSize: '14px', fontWeight: '700', margin: 0 },
    applyBtn: { marginTop: '20px', width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '800', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', textDecoration: 'none' }
};