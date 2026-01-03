import React, { useState } from 'react';

export default function VideoPlayer({ course, user, setUser, setView }) {
    const [quizStarted, setQuizStarted] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(null);

    if (!course) return <button onClick={() => setView('learning')}>Go Back</button>;

    const handleQuizSubmit = () => {
        let correct = 0;
        course.quiz.forEach((q, i) => { if (userAnswers[i] === q.correctAnswer) correct++; });
        const finalScore = (correct / course.quiz.length) * 100;
        setScore(finalScore);

        if (finalScore >= 70) {
            const isNew = !user.skills.includes(course.skillTag);
            setUser({
                ...user,
                skills: isNew ? [...user.skills, course.skillTag] : user.skills,
                points: isNew ? user.points + 100 : user.points
            });
        }
    };

    return (
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
            <iframe width="100%" height="450" src={course.videoUrl} frameBorder="0" allowFullScreen title="video"></iframe>
            <h2>{course.title}</h2>
            {!quizStarted ? (
                <button onClick={() => setQuizStarted(true)} style={styles.mainBtn}>Take Skill Quiz</button>
            ) : (
                <div style={styles.box}>
                    {score === null ? (
                        <>
                            {course.quiz.map((q, i) => (
                                <div key={i}>
                                    <p>{q.question}</p>
                                    {q.options.map((opt, oi) => (
                                        <label key={oi} style={{display:'block'}}><input type="radio" name="q" onChange={()=>setUserAnswers({...userAnswers, [i]:oi})}/> {opt}</label>
                                    ))}
                                </div>
                            ))}
                            <button onClick={handleQuizSubmit} style={styles.mainBtn}>Submit</button>
                        </>
                    ) : (
                        <div>
                            <h3>Score: {score}%</h3>
                            <button onClick={() => setView('learning')} style={styles.mainBtn}>Back to Courses</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
const styles = {
    mainBtn: { background: '#2563eb', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', marginTop: '10px', cursor: 'pointer' },
    box: { background: '#fff', padding: '20px', borderRadius: '10px', marginTop: '20px', border: '1px solid #eee' }
};