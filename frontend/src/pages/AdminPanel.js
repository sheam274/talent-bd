import React, { useState, useEffect } from 'react';

export default function AdminPanel() {
    const [tab, setTab] = useState('jobs');
    const [form, setForm] = useState({ title: '', company: '', location: '', category: 'IT', videoUrl: '', skillTag: '', description: '' });

    const handlePost = async (e) => {
        e.preventDefault();
        const endpoint = tab === 'jobs' ? 'job' : 'course';
        await fetch(`http://localhost:5000/api/admin/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });
        alert(`${tab} posted successfully!`);
        setForm({ title: '', company: '', location: '', category: 'IT', videoUrl: '', skillTag: '', description: '' });
    };

    return (
        <div style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #ddd' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => setTab('jobs')} style={{ padding: '10px', background: tab === 'jobs' ? '#2563eb' : '#eee', color: tab === 'jobs' ? '#fff' : '#000' }}>Jobs</button>
                <button onClick={() => setTab('courses')} style={{ padding: '10px', background: tab === 'courses' ? '#2563eb' : '#eee', color: tab === 'courses' ? '#fff' : '#000' }}>Courses</button>
            </div>

            <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                {tab === 'jobs' ? (
                    <>
                        <input placeholder="Company" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
                        <input placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                    </>
                ) : (
                    <>
                        <input placeholder="Skill Tag (e.g. Excel)" value={form.skillTag} onChange={e => setForm({...form, skillTag: e.target.value})} />
                        <input placeholder="YouTube Link" value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} />
                    </>
                )}
                <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                <button type="submit" style={{ background: '#10b981', color: '#fff', padding: '10px' }}>Post Now</button>
            </form>
        </div>
    );
}