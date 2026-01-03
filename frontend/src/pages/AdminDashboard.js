import React, { useState } from 'react';
import { Plus, Trash2, Video, BrainCircuit, Save, DollarSign } from 'lucide-react';

export default function AdminDashboard({ user }) {
    const [videoData, setVideoData] = useState({
        title: '',
        category: 'Development',
        skillTag: 'React',
        videoUrl: '',
        description: '',
        rewardXP: 100,      // Default XP reward
        rewardWallet: 50    // Default Cash reward ($)
    });

    // Integrated Quiz State
    const [quiz, setQuiz] = useState([{ question: '', options: ['', '', ''], correctAnswer: 0 }]);

    const categories = ['Development', 'Design', 'Management', 'AI & Data'];
    const skills = ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'SQL', 'Figma'];

    // --- Quiz Logic ---
    const addQuestion = () => {
        setQuiz([...quiz, { question: '', options: ['', '', ''], correctAnswer: 0 }]);
    };

    const removeQuestion = (index) => {
        const updatedQuiz = quiz.filter((_, i) => i !== index);
        setQuiz(updatedQuiz);
    };

    const updateQuestion = (index, field, value) => {
        const updatedQuiz = [...quiz];
        updatedQuiz[index][field] = value;
        setQuiz(updatedQuiz);
    };

    const updateOption = (qIndex, optIndex, value) => {
        const updatedQuiz = [...quiz];
        updatedQuiz[qIndex].options[optIndex] = value;
        setQuiz(updatedQuiz);
    };

    // --- Submit Logic ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // SYNC: Ensure role is passed so the backend allows the upload
        const body = { 
            ...videoData, 
            quiz,
            role: user?.role || 'admin' 
        };
        
        try {
            // FIXED: Path changed to match courses.js route
            const res = await fetch('http://localhost:5000/api/courses/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            
            const data = await res.json();

            if (res.ok) {
                alert("🚀 Course Published! It is now live in the Learning Hub.");
                // Reset Form
                setVideoData({ 
                    title: '', category: 'Development', skillTag: 'React', 
                    videoUrl: '', description: '', rewardXP: 100, rewardWallet: 50 
                });
                setQuiz([{ question: '', options: ['', '', ''], correctAnswer: 0 }]);
            } else {
                alert(`Error: ${data.error || 'Upload failed'}`);
            }
        } catch (error) {
            alert("Connection error. Is the server running on port 5000?");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formCard}>
                <header style={styles.header}>
                    <Video size={24} color="#3b82f6" />
                    <h2 style={{margin: 0, color: '#1e293b'}}>Course & Quiz Creator</h2>
                </header>

                <form onSubmit={handleSubmit}>
                    {/* Video Info Section */}
                    <div style={styles.section}>
                        <label style={styles.label}>Video Title</label>
                        <input style={styles.input} value={videoData.title} onChange={e => setVideoData({...videoData, title: e.target.value})} placeholder="e.g. Master React Hooks" required />

                        <div style={{display:'flex', gap:'15px', marginBottom: '15px'}}>
                            <div style={{flex:1}}>
                                <label style={styles.label}>Category</label>
                                <select style={styles.input} value={videoData.category} onChange={e => setVideoData({...videoData, category: e.target.value})}>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div style={{flex:1}}>
                                <label style={styles.label}>Primary Skill Tag</label>
                                <select style={styles.input} value={videoData.skillTag} onChange={e => setVideoData({...videoData, skillTag: e.target.value})}>
                                    {skills.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* REWARDS SYNC */}
                        <div style={{display:'flex', gap:'15px', background: '#f0fdf4', padding: '15px', borderRadius: '8px', marginBottom: '15px'}}>
                            <div style={{flex:1}}>
                                <label style={{...styles.label, color: '#166534'}}>XP Reward</label>
                                <input type="number" style={styles.input} value={videoData.rewardXP} onChange={e => setVideoData({...videoData, rewardXP: e.target.value})} />
                            </div>
                            <div style={{flex:1}}>
                                <label style={{...styles.label, color: '#166534'}}>Wallet Reward ($)</label>
                                <input type="number" style={styles.input} value={videoData.rewardWallet} onChange={e => setVideoData({...videoData, rewardWallet: e.target.value})} />
                            </div>
                        </div>

                        <label style={styles.label}>YouTube URL</label>
                        <input style={styles.input} placeholder="https://www.youtube.com/watch?v=..." value={videoData.videoUrl} onChange={e => setVideoData({...videoData, videoUrl: e.target.value})} required />
                        
                        <label style={styles.label}>Short Description</label>
                        <textarea style={styles.textarea} value={videoData.description} onChange={e => setVideoData({...videoData, description: e.target.value})} placeholder="What skills will they earn?" />
                    </div>

                    {/* Quiz Builder */}
                    <div style={{...styles.section, background: '#f8fafc', padding: '20px', borderRadius: '12px'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '15px'}}>
                            <h3 style={{margin: 0, fontSize: '16px', color: '#334155', display:'flex', alignItems:'center', gap: '8px'}}>
                                <BrainCircuit size={18} /> Certification Quiz
                            </h3>
                            <button type="button" onClick={addQuestion} style={styles.addBtn}><Plus size={16} /> Add Question</button>
                        </div>

                        {quiz.map((q, qIndex) => (
                            <div key={qIndex} style={styles.quizCard}>
                                <div style={{display:'flex', gap: '10px', marginBottom: '10px'}}>
                                    <input 
                                        style={{...styles.input, marginBottom: 0}} 
                                        placeholder={`Question ${qIndex + 1}`} 
                                        value={q.question} 
                                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                        required
                                    />
                                    <button type="button" onClick={() => removeQuestion(qIndex)} style={styles.deleteBtn}><Trash2 size={18} /></button>
                                </div>
                                
                                <div style={styles.optionsGrid}>
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} style={{display:'flex', alignItems:'center', gap: '8px'}}>
                                            <input 
                                                type="radio" 
                                                name={`correct-${qIndex}`} 
                                                checked={q.correctAnswer === oIndex}
                                                onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                            />
                                            <input 
                                                style={{...styles.input, marginBottom: 0, padding: '8px'}} 
                                                placeholder={`Option ${oIndex + 1}`} 
                                                value={opt}
                                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button type="submit" style={styles.submitBtn}>
                        <Save size={18} /> Publish to Learning Hub
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: { padding: '40px 20px', background: '#f1f5f9', minHeight: '100vh', display: 'flex', justifyContent: 'center' },
    formCard: { background: '#fff', padding: '30px', borderRadius: '15px', width: '100%', maxWidth: '800px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
    header: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' },
    section: { marginBottom: '30px' },
    label: { fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' },
    input: { width: '100%', padding: '12px', marginBottom: '5px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' },
    textarea: { width: '100%', height: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '10px', fontSize: '14px', fontFamily: 'inherit' },
    quizCard: { background: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '15px' },
    optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' },
    addBtn: { display: 'flex', alignItems: 'center', gap: '5px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
    deleteBtn: { background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', padding: '8px', borderRadius: '6px', cursor: 'pointer' },
    submitBtn: { width: '100%', padding: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '16px', marginTop: '20px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }
};