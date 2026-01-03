import React, { useState } from 'react';

export default function AdminDashboard() {
    const [videoData, setVideoData] = useState({
        title: '',
        category: 'Development',
        skillTag: 'React',
        videoUrl: '',
        description: ''
    });

    const categories = ['Development', 'Design', 'Management', 'AI & Data'];
    const skills = ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'SQL', 'Figma'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('http://localhost:5000/api/admin/add-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(videoData)
        });
        if (res.ok) {
            alert("🚀 Video Synced to Learning Hub!");
            setVideoData({ ...videoData, title: '', videoUrl: '', description: '' });
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formCard}>
                <h2 style={{color: '#1e293b', marginBottom: '20px'}}>Skill Learning Manager</h2>
                <form onSubmit={handleSubmit}>
                    <label style={styles.label}>Video Title</label>
                    <input style={styles.input} value={videoData.title} onChange={e => setVideoData({...videoData, title: e.target.value})} required />

                    <div style={{display:'flex', gap:'15px'}}>
                        <div style={{flex:1}}>
                            <label style={styles.label}>Skill Category</label>
                            <select style={styles.input} value={videoData.category} onChange={e => setVideoData({...videoData, category: e.target.value})}>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div style={{flex:1}}>
                            <label style={styles.label}>AI Skill Tag</label>
                            <select style={styles.input} value={videoData.skillTag} onChange={e => setVideoData({...videoData, skillTag: e.target.value})}>
                                {skills.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <label style={styles.label}>YouTube URL</label>
                    <input style={styles.input} placeholder="https://www.youtube.com/watch?v=..." value={videoData.videoUrl} onChange={e => setVideoData({...videoData, videoUrl: e.target.value})} required />

                    <label style={styles.label}>Description</label>
                    <textarea style={styles.textarea} value={videoData.description} onChange={e => setVideoData({...videoData, description: e.target.value})} />

                    <button type="submit" style={styles.submitBtn}>Upload to TalentBD</button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: { padding: '50px', background: '#f1f5f9', minHeight: '100vh', display: 'flex', justifyContent: 'center' },
    formCard: { background: '#fff', padding: '40px', borderRadius: '15px', width: '100%', maxWidth: '600px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
    label: { fontSize: '12px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '5px' },
    input: { width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' },
    textarea: { width: '100%', height: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' },
    submitBtn: { width: '100%', padding: '15px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};
// Inside AdminDashboard.js - Add to the form
const [quiz, setQuiz] = useState([{ question: '', options: ['', '', ''], correctAnswer: 0 }]);

const addQuestion = () => {
    setQuiz([...quiz, { question: '', options: ['', '', ''], correctAnswer: 0 }]);
};

// Update your handleSubmit to include the quiz array
const handleSubmit = async (e) => {
    // ... previous logic
    const body = { ...videoData, quiz };
    const res = await fetch('http://localhost:5000/api/admin/add-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
};