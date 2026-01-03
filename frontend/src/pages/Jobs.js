import React, { useState } from 'react'; // Fixed: Added useState import
import { motion } from 'framer-motion'; // Fixed: Added motion import

const MOCK_JOBS = [
    { id: 1, title: "React Developer (Bug Fix)", reward: 150, skill: "React JS", type: "Gig" },
    { id: 2, title: "Logo Design Set", reward: 80, skill: "Graphic Design", type: "Task" },
    { id: 3, title: "Python Data Script", reward: 200, skill: "Python", type: "Project" },
    { id: 4, title: "Landing Page UI", reward: 120, skill: "Graphic Design", type: "Gig" }
];

export default function Jobs({ user, onAudit, setView }) {
    // Fixed: Hooks must be inside the function
    const [showSuccess, setShowSuccess] = useState(false);
    const [appliedJob, setAppliedJob] = useState(null);

    const handleApplyClick = (job) => {
        setAppliedJob(job);
        setShowSuccess(true);
        // This triggers the visual success state for your FYP
    };

    return (
        <div style={jobStyles.container}>
            <header style={{ marginBottom: '30px' }}>
                <h2 style={{ margin: 0 }}>Available Earning Opportunities</h2>
                <p style={{ color: '#64748b' }}>Apply for gigs that match your verified skill set.</p>
            </header>

            <div style={jobStyles.jobGrid}>
                {MOCK_JOBS.map((job) => {
                    const isLocked = !user?.skills?.includes(job.skill);

                    return (
                        <motion.div 
                            key={job.id} 
                            whileHover={{ y: -5 }} 
                            style={{
                                ...jobStyles.jobCard,
                                borderLeft: isLocked ? '5px solid #cbd5e1' : '5px solid #10b981',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={jobStyles.typeTag}>{job.type}</span>
                                    <h3 style={{ margin: '10px 0 5px 0' }}>{job.title}</h3>
                                    <p style={{ fontSize: '13px', color: '#64748b' }}>Required: <strong>{job.skill}</strong></p>
                                </div>
                                <div style={jobStyles.rewardBox}>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Payout</div>
                                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#10b981' }}>${job.reward}</div>
                                </div>
                            </div>

                            <div style={{ marginTop: '20px' }}>
                                {isLocked ? (
                                    <div style={jobStyles.lockedBox}>
                                        <p style={{ fontSize: '12px', margin: '0 0 10px 0' }}>🔒 You need the <strong>{job.skill}</strong> badge to unlock this payout.</p>
                                        <button onClick={() => setView('learning')} style={jobStyles.learnBtn}>Go to Learning Hub</button>
                                    </div>
                                ) : (
                                    <button onClick={() => handleApplyClick(job)} style={jobStyles.applyBtn}>Apply & Earn ${job.reward}</button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* SUCCESS POPUP MODAL */}
            {showSuccess && (
                <div style={popupStyles.overlay}>
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={popupStyles.modal}>
                        <div style={{ fontSize: '50px', marginBottom: '10px' }}>✅</div>
                        <h2 style={{ margin: '0 0 10px 0' }}>Application Sent!</h2>
                        <p style={{ color: '#475569', fontSize: '14px' }}>
                            Your <strong>Verified {appliedJob?.skill} Badge</strong> was attached to this application.
                        </p>
                        <div style={popupStyles.timeline}>
                            <div style={popupStyles.step}>📅 <strong>Sent:</strong> Today</div>
                            <div style={popupStyles.step}>🔍 <strong>Review:</strong> AI Matching in progress</div>
                            <div style={{...popupStyles.step, color: '#10b981'}}>💰 <strong>Payout:</strong> Within 48 Hours</div>
                        </div>
                        <button onClick={() => setShowSuccess(false)} style={jobStyles.applyBtn}>Got it!</button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

// --- ALL STYLES DEFINED HERE ---
const jobStyles = {
    container: { padding: '20px 0' },
    jobGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
    jobCard: { background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
    typeTag: { background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' },
    rewardBox: { textAlign: 'right', background: '#f0fdf4', padding: '10px', borderRadius: '8px' },
    applyBtn: { width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    learnBtn: { width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' },
    lockedBox: { background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px dashed #cbd5e1' }
};

const popupStyles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
    modal: { background: '#fff', padding: '30px', borderRadius: '20px', maxWidth: '400px', width: '90%', textAlign: 'center' },
    timeline: { textAlign: 'left', background: '#f8fafc', padding: '15px', borderRadius: '12px', margin: '20px 0' },
    step: { fontSize: '13px', marginBottom: '5px', display: 'block' }
};