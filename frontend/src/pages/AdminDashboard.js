import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Video, BrainCircuit, Save, DollarSign, X, Layout, Globe, Star } from 'lucide-react';

export default function AdminDashboard({ user }) {
    const [videoData, setVideoData] = useState({
        title: '',
        category: 'Development',
        skillTag: 'React',
        videoUrl: '',
        description: '',
        rewardXP: 100,      
        rewardWallet: 50,
        difficulty: 'Beginner' // SYNC: Added for better user filtering
    });

    const [quiz, setQuiz] = useState([{ question: '', options: ['', '', ''], correctAnswer: 0 }]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const categories = ['Development', 'Design', 'Management', 'AI & Data', 'Cyber Security'];
    const skills = ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'SQL', 'Figma', 'Next.js', 'Tailwind'];

    // --- Quiz Logic (Preserved) ---
    const addQuestion = () => setQuiz([...quiz, { question: '', options: ['', '', ''], correctAnswer: 0 }]);
    const removeQuestion = (index) => setQuiz(quiz.filter((_, i) => i !== index));
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

    // --- Submit Logic (Synced with Port 5000) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        const body = { ...videoData, quiz, role: user?.role || 'admin' };
        
        try {
            const res = await fetch('http://localhost:5000/api/courses/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok) {
                alert("🚀 Course Published! Synced with Learning Hub.");
                setVideoData({ title: '', category: 'Development', skillTag: 'React', videoUrl: '', description: '', rewardXP: 100, rewardWallet: 50, difficulty: 'Beginner' });
                setQuiz([{ question: '', options: ['', '', ''], correctAnswer: 0 }]);
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            alert("❌ Connection failed. Ensure Backend is running at 44°C on port 5000.");
        }
    };

    return (
        <div style={styles.container}>
            <div style={{...styles.formCard, padding: isMobile ? '20px' : '40px'}}>
                <header style={styles.header}>
                    <div style={styles.iconCircle}><Layout size={20} color="#fff" /></div>
                    <div>
                        <h2 style={styles.title}>Course Architect</h2>
                        <p style={styles.subtitle}>Deploy new skills to the Talent-BD marketplace</p>
                    </div>
                </header>

                <form onSubmit={handleSubmit}>
                    {/* Video Info Section */}
                    <div style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <Video size={18} /> <span>Video Content</span>
                        </div>
                        
                        <label style={styles.label}>Course Title</label>
                        <input style={styles.input} value={videoData.title} onChange={e => setVideoData({...videoData, title: e.target.value})} placeholder="e.g. Advanced Node.js for Professionals" required />

                        <div style={{...styles.flexRow, flexDirection: isMobile ? 'column' : 'row'}}>
                            <div style={{flex:1}}>
                                <label style={styles.label}>Category</label>
                                <select style={styles.input} value={videoData.category} onChange={e => setVideoData({...videoData, category: e.target.value})}>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div style={{flex:1}}>
                                <label style={styles.label}>Difficulty</label>
                                <select style={styles.input} value={videoData.difficulty} onChange={e => setVideoData({...videoData, difficulty: e.target.value})}>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Expert">Expert</option>
                                </select>
                            </div>
                        </div>

                        {/* REWARDS SYNC PANEL */}
                        <div style={styles.rewardPanel}>
                            <div style={{flex:1}}>
                                <label style={{...styles.label, color: '#059669'}}>Reward XP</label>
                                <div style={styles.inputWrapper}>
                                    <Star size={14} style={styles.innerIcon} />
                                    <input type="number" style={styles.innerInput} value={videoData.rewardXP} onChange={e => setVideoData({...videoData, rewardXP: e.target.value})} />
                                </div>
                            </div>
                            <div style={{flex:1}}>
                                <label style={{...styles.label, color: '#059669'}}>Wallet Reward (৳)</label>
                                <div style={styles.inputWrapper}>
                                    <DollarSign size={14} style={styles.innerIcon} />
                                    <input type="number" style={styles.innerInput} value={videoData.rewardWallet} onChange={e => setVideoData({...videoData, rewardWallet: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <label style={styles.label}>YouTube URL</label>
                        <input style={styles.input} placeholder="https://www.youtube.com/watch?v=..." value={videoData.videoUrl} onChange={e => setVideoData({...videoData, videoUrl: e.target.value})} required />
                        
                        <label style={styles.label}>Description</label>
                        <textarea style={styles.textarea} value={videoData.description} onChange={e => setVideoData({...videoData, description: e.target.value})} placeholder="Outline the learning objectives..." />
                    </div>

                    {/* Quiz Builder */}
                    <div style={styles.quizSection}>
                        <div style={styles.sectionHeader}>
                            <BrainCircuit size={18} /> <span>Certification Quiz</span>
                            <button type="button" onClick={addQuestion} style={styles.addBtn}><Plus size={14} /> Add</button>
                        </div>

                        {quiz.map((q, qIndex) => (
                            <div key={qIndex} style={styles.quizCard}>
                                <div style={styles.quizCardHeader}>
                                    <span style={styles.qNum}>Q{qIndex + 1}</span>
                                    <input 
                                        style={{...styles.input, marginBottom: 0, border: 'none', background: 'transparent', fontWeight: '600'}} 
                                        placeholder="Enter the question..." 
                                        value={q.question} 
                                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                        required
                                    />
                                    <button type="button" onClick={() => removeQuestion(qIndex)} style={styles.deleteBtn}><Trash2 size={16} /></button>
                                </div>
                                
                                <div style={{...styles.optionsGrid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr'}}>
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} style={styles.optionItem}>
                                            <input 
                                                type="radio" 
                                                name={`correct-${qIndex}`} 
                                                checked={q.correctAnswer === oIndex}
                                                onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                                style={styles.radio}
                                            />
                                            <input 
                                                style={styles.optionInput} 
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
                        <Save size={18} /> Deploy to Learning Hub
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: { padding: '40px 20px', background: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center' },
    formCard: { background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '900px', boxShadow: '0 20px 50px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' },
    header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' },
    iconCircle: { background: '#2563eb', padding: '12px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    title: { margin: 0, color: '#0f172a', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' },
    subtitle: { margin: '4px 0 0', color: '#64748b', fontSize: '14px' },
    section: { marginBottom: '40px' },
    sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' },
    label: { fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px' },
    input: { width: '100%', padding: '14px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', transition: '0.2s', outline: 'none' },
    textarea: { width: '100%', height: '100px', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '10px', fontSize: '14px', fontFamily: 'inherit', resize: 'none' },
    flexRow: { display: 'flex', gap: '20px' },
    rewardPanel: { display: 'flex', gap: '20px', background: '#f0fdf4', padding: '20px', borderRadius: '16px', marginBottom: '25px', border: '1px solid #dcfce7' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    innerIcon: { position: 'absolute', left: '12px', color: '#059669' },
    innerInput: { width: '100%', padding: '12px 12px 12px 35px', borderRadius: '10px', border: '1px solid #bbf7d0', fontSize: '14px', fontWeight: '600' },
    quizSection: { background: '#f8fafc', padding: '30px', borderRadius: '20px', border: '1px solid #f1f5f9' },
    quizCard: { background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' },
    quizCardHeader: { display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '15px' },
    qNum: { background: '#eff6ff', color: '#2563eb', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '800' },
    optionItem: { display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '8px 12px', borderRadius: '10px' },
    optionInput: { border: 'none', background: 'transparent', width: '100%', padding: '8px', fontSize: '14px' },
    radio: { width: '18px', height: '18px', cursor: 'pointer' },
    addBtn: { marginLeft: 'auto', background: '#2563eb', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' },
    deleteBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', transition: '0.2s' },
    submitBtn: { width: '100%', padding: '18px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', fontSize: '16px', marginTop: '30px', transition: '0.3s' },
    optionsGrid: { display: 'grid', gap: '12px' }
};