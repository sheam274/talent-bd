import React, { useState, useEffect } from 'react';

export default function LearningHub({ onStartCourse }) {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        // Fetch courses from your backend
        fetch('http://localhost:5000/api/courses')
            .then(res => res.json())
            .then(data => setCourses(Array.isArray(data) ? data : []))
            .catch(err => console.error("Error loading courses:", err));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>Professional Skill Verification</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {courses.length === 0 && <p>No courses available yet.</p>}
                {courses.map(course => {
                    // Extract YouTube ID for the thumbnail
                    const videoId = course.videoUrl?.includes('embed/') 
                        ? course.videoUrl.split('/embed/')[1] 
                        : (course.videoUrl?.includes('v=') ? course.videoUrl.split('v=')[1].split('&')[0] : null);
                    
                    const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://via.placeholder.com/300x180?text=No+Thumbnail';

                    return (
                        <div key={course._id} style={styles.card}>
                            <img src={thumb} alt={course.title} style={styles.image} />
                            <div style={styles.content}>
                                <span style={styles.tag}>{course.skillTag || 'Skill'}</span>
                                <h3 style={styles.title}>{course.title}</h3>
                                <button 
                                    onClick={() => onStartCourse(course)} 
                                    style={styles.btn}
                                >
                                    Start Course
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const styles = {
    card: { background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
    image: { width: '100%', height: '160px', objectFit: 'cover' },
    content: { padding: '15px' },
    tag: { fontSize: '10px', color: '#2563eb', fontWeight: 'bold', textTransform: 'uppercase' },
    title: { fontSize: '16px', margin: '10px 0', color: '#1e293b' },
    btn: { width: '100%', padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};