import React from 'react';

export default function Footer({ setView }) {
    return (
        <footer style={footerStyle}>
            <div style={container}>
                <div style={grid}>
                    {/* Brand Section */}
                    <div style={brandSection}>
                        <h2 style={logo}>TalentBD</h2>
                        <p style={tagline}>Connecting talent with the best opportunities in Bangladesh. Your career, our priority.</p>
                        <div style={socialLinks}>
                            <span style={socialIcon}>FB</span>
                            <span style={socialIcon}>LI</span>
                            <span style={socialIcon}>TW</span>
                        </div>
                    </div>

                    {/* Quick Navigation */}
                    <div style={column}>
                        <h4 style={heading}>Navigation</h4>
                        <span onClick={() => setView('home')} style={link}>Home</span>
                        <span onClick={() => setView('jobs')} style={link}>Browse Jobs</span>
                        <span onClick={() => setView('cv-builder')} style={link}>CV Builder</span>
                    </div>

                    {/* Job Categories */}
                    <div style={column}>
                        <h4 style={heading}>Categories</h4>
                        <span onClick={() => setView('jobs')} style={link}>Government</span>
                        <span onClick={() => setView('jobs')} style={link}>Non-Government</span>
                        <span onClick={() => setView('jobs')} style={link}>Daily Circulars</span>
                    </div>

                    {/* Support */}
                    <div style={column}>
                        <h4 style={heading}>Support</h4>
                        <span style={link}>Help Center</span>
                        <span style={link}>Privacy Policy</span>
                        <span style={link}>Contact Us</span>
                    </div>
                </div>

                <div style={bottomBar}>
                    <p>© 2025 TalentBD. Developed with ❤️ in Bangladesh.</p>
                </div>
            </div>
        </footer>
    );
}

// --- Footer Styling ---
const footerStyle = { background: '#0f172a', color: '#94a3b8', padding: '60px 0 20px', marginTop: 'auto' };
const container = { maxWidth: '1200px', margin: '0 auto', padding: '0 5%' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' };
const brandSection = { gridColumn: 'span 1', minWidth: '250px' };
const logo = { color: '#fff', fontSize: '24px', fontWeight: '900', marginBottom: '15px' };
const tagline = { fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' };
const heading = { color: '#fff', fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' };
const column = { display: 'flex', flexDirection: 'column', gap: '12px' };
const link = { cursor: 'pointer', fontSize: '14px', transition: '0.3s', ':hover': { color: '#fff' } };
const socialLinks = { display: 'flex', gap: '10px' };
const socialIcon = { background: '#1e293b', width: '35px', height: '35px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#fff', cursor: 'pointer' };
const bottomBar = { borderTop: '1px solid #1e293b', paddingTop: '20px', textAlign: 'center', fontSize: '12px' };