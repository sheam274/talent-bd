import React, { useState } from 'react';

export default function Login({ setUser, setView }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        
        // Mock Database Logic
        if (email === 'admin@talentbd.com' && password === 'admin123') {
            setUser({ email, role: 'admin', name: 'Site Administrator' });
            setView('admin');
        } else if (email !== '' && password !== '') {
            // Treat anyone else as a standard User
            setUser({ email, role: 'user', name: email.split('@')[0], savedJobs: [] });
            setView('profile');
        } else {
            alert('Please enter valid credentials');
        }
    };

    return (
        <div style={loginWrapper}>
            <div style={loginCard}>
                <h2 style={{textAlign:'center', marginBottom: '20px'}}>Sign In</h2>
                <p style={{textAlign:'center', color: '#64748b', fontSize:'14px', marginBottom:'20px'}}>
                    Admin: admin@talentbd.com / admin123 <br/>
                    User: Any other email/pass
                </p>
                <form onSubmit={handleLogin} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                    <input style={input} type="email" placeholder="Email Address" required onChange={(e) => setEmail(e.target.value)} />
                    <input style={input} type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" style={submitBtn}>Login to My Account</button>
                </form>
            </div>
        </div>
    );
}
const loginWrapper = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' };
const loginCard = { background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' };
const input = { padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' };
const submitBtn = { background: '#2563eb', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };