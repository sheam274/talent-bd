import React, { useState } from 'react';

export default function Analyzer() {
    const [file, setFile] = useState(null);
    const [jobDesc, setJobDesc] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!file || !jobDesc) return alert("Please upload a resume and paste a job description.");
        setLoading(true);

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDesc);

        try {
            const res = await fetch('http://localhost:5000/api/analyze', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            setResult(data);
        } catch (err) { alert("Analysis failed."); }
        setLoading(false);
    };

    return (
        <div style={container}>
            <h2>AI Resume Analyzer</h2>
            <div style={grid}>
                <div style={card}>
                    <h4>1. Upload Resume (PDF)</h4>
                    <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={input} />
                    
                    <h4>2. Paste Job Description</h4>
                    <textarea 
                        style={textArea} 
                        placeholder="Paste the job requirements here..."
                        value={jobDesc}
                        onChange={e => setJobDesc(e.target.value)}
                    />
                    <button onClick={handleAnalyze} style={btn}>{loading ? 'Analyzing...' : 'Analyze Match Score'}</button>
                </div>

                <div style={card}>
                    <h4>Analysis Result</h4>
                    {result ? (
                        <div style={resContent}>
                            <h1 style={{color: result.score > 70 ? '#16a34a' : '#dc2626'}}>{result.score}% Match</h1>
                            <p><strong>Missing Skills:</strong> {result.missingSkills.join(', ') || 'None'}</p>
                            <p><strong>Matching Skills:</strong> {result.matchingSkills.join(', ')}</p>
                            <div style={suggestionBox}>{result.suggestion}</div>
                        </div>
                    ) : <p>Upload and paste data to see how well you match the job.</p>}
                </div>
            </div>
        </div>
    );
}

const container = { maxWidth: '1000px', margin: '0 auto' };
const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' };
const card = { background: '#fff', padding: '30px', borderRadius: '15px', border: '1px solid #e2e8f0' };
const input = { marginBottom: '20px' };
const textArea = { width: '100%', height: '200px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' };
const btn = { width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const resContent = { textAlign: 'center' };
const suggestionBox = { background: '#f8fafc', padding: '15px', borderRadius: '8px', marginTop: '20px', fontSize: '14px', borderLeft: '4px solid #2563eb' };