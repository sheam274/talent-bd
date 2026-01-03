import React from 'react';
import { GIGS } from '../data';

export default function EarnPage({ user, setView }) {
    return (
        <div style={{maxWidth: '1000px', margin: '0 auto'}}>
            <h2>Gig Marketplace</h2>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                {GIGS.map(gig => {
                    const unlocked = user.skills.includes(gig.requiredSkill);
                    return (
                        <div key={gig.id} style={{padding:'20px', background:'#fff', border:'1px solid #eee', borderRadius:'10px'}}>
                            <div style={{float:'right', color:'green', fontWeight:'bold'}}>{gig.reward}</div>
                            <h3>{gig.title}</h3>
                            <p>{gig.description}</p>
                            <p><strong>Required Skill:</strong> {gig.requiredSkill}</p>
                            {unlocked ? 
                                <button style={{width:'100%', padding:'10px', background:'#2563eb', color:'#fff', border:'none', borderRadius:'5px'}}>Apply Now</button> :
                                <button onClick={()=>setView('learning')} style={{width:'100%', padding:'10px', background:'#f3f4f6', border:'none', borderRadius:'5px'}}>Learn {gig.requiredSkill} to Unlock</button>
                            }
                        </div>
                    );
                })}
            </div>
        </div>
    );
}