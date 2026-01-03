import React from 'react';

export default function UserProfile({ user, setView }) {
    if (!user) return <div style={{textAlign:'center', padding:'100px'}}>Please Login</div>;

    const cv = user.savedCV;

    return (
        <div style={{padding:'20px'}}>
            <h1 style={{fontWeight:900}}>My Career Dashboard</h1>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px', marginTop:'30px'}}>
                
                {/* CV STATUS CARD */}
                <div style={cardStyle}>
                    <div style={{display:'flex', gap:'20px', alignItems:'center', marginBottom:'20px'}}>
                        {cv?.profileImage ? (
                            <img src={cv.profileImage} alt="User" style={profileImgStyle} />
                        ) : (
                            <div style={{...profileImgStyle, background:'#eee'}} />
                        )}
                        <div>
                            <h3 style={{margin:0}}>{user.name}</h3>
                            <p style={{fontSize:'12px', color:'#64748b'}}>Member since 2025</p>
                        </div>
                    </div>
                    
                    <div style={cvStatusBox}>
                        <p><strong>Digital CV:</strong> {cv?.name ? '✅ Complete' : '❌ Not Created'}</p>
                        <button onClick={() => setView('cv-builder')} style={actionBtn}>Edit CV / Photo</button>
                    </div>
                </div>

                {/* SAVED JOBS CARD */}
                <div style={cardStyle}>
                    <h3>Saved Circulars</h3>
                    {user.bookmarks?.length > 0 ? user.bookmarks.map(j => (
                        <div key={j._id} style={itemStyle}>
                            <span>{j.title}</span>
                            <button onClick={() => setView('jobs')} style={viewBtn}>View</button>
                        </div>
                    )) : <p>No bookmarks yet.</p>}
                </div>

            </div>
        </div>
    );
}

const cardStyle = { background: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const profileImgStyle = { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563eb' };
const cvStatusBox = { background: '#f8fafc', padding: '15px', borderRadius: '10px', marginTop: '10px' };
const itemStyle = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' };
const actionBtn = { background: '#2563eb', color: '#fff', border: 'none', width:'100%', padding: '10px', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' };
const viewBtn = { background: '#eff6ff', color: '#2563eb', border: 'none', padding: '5px 12px', borderRadius: '5px', cursor: 'pointer' };