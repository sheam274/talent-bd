import React from 'react';

export default function Profile({ user }) {
    return (
        <div style={{maxWidth: '600px', margin: '0 auto', textAlign:'center'}}>
            <div style={{background:'#2563eb', padding:'40px', color:'#fff', borderRadius:'20px'}}>
                <h1>{user.name}</h1>
                <p>Experience: {user.points} XP</p>
            </div>
            <h3 style={{marginTop:'30px'}}>Verified Badges</h3>
            <div style={{display:'flex', justifyContent:'center', gap:'10px'}}>
                {user.skills.map((s, i) => (
                    <div key={i} style={{padding:'10px 20px', background:'#dcfce7', borderRadius:'10px', border:'1px solid #10b981'}}>🏅 {s}</div>
                ))}
            </div>
        </div>
    );
}