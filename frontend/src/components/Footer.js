import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Ensure axios is installed for data sync

export default function Footer({ setView, setCategoryFilter }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [categories, setCategories] = useState([]); // SYNC: State for dynamic categories

    // 1. Sync Responsiveness for HP-840 and Mobile
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        
        // Fetch Dynamic Categories from Admin System
        const fetchCategories = async () => {
            try {
                // SYNC: Pulling categories specifically grouped for 'job'
                const res = await axios.get('/api/categories?group=job');
                setCategories(res.data);
            } catch (err) {
                console.error("Footer Sync Error:", err);
            }
        };

        fetchCategories();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const FooterLink = ({ onClick, children }) => {
        const [isHovered, setIsHovered] = useState(false);
        return (
            <span 
                onClick={onClick} 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    ...linkStyle,
                    color: isHovered ? '#3b82f6' : '#94a3b8',
                    transform: isHovered ? 'translateX(5px)' : 'translateX(0)'
                }}
            >
                {children}
            </span>
        );
    };

    const handleCategoryClick = (categoryName) => {
        if (setCategoryFilter) setCategoryFilter(categoryName);
        setView('jobs');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer style={footerStyle}>
            <div style={containerStyle}>
                <div style={{
                    ...gridStyle,
                    gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr'
                }}>
                    {/* Brand Section */}
                    <div style={brandSectionStyle}>
                        <h2 style={logoStyle}>Talent<span style={{color: '#2563eb'}}>BD</span></h2>
                        <p style={taglineStyle}>
                            Bangladesh's first gamified career ecosystem. Verify skills, 
                            earn marketplace rewards, and architect your future.
                        </p>
                        <div style={socialLinksStyle}>
                            <div title="Facebook" style={socialIconStyle}>FB</div>
                            <div title="LinkedIn" style={socialIconStyle}>LI</div>
                            <div title="GitHub" style={socialIconStyle}>GH</div>
                        </div>
                    </div>

                    {/* Quick Navigation */}
                    <div style={columnStyle}>
                        <h4 style={headingStyle}>Navigation</h4>
                        <FooterLink onClick={() => setView('home')}>Home</FooterLink>
                        <FooterLink onClick={() => setView('jobs')}>Browse Jobs</FooterLink>
                        <FooterLink onClick={() => setView('learning-hub')}>Learning Hub</FooterLink>
                        <FooterLink onClick={() => setView('cv-builder')}>CV Builder</FooterLink>
                        <FooterLink onClick={() => setView('ats-scanner')}>ATS Scanner</FooterLink>
                    </div>

                    {/* Dynamic Marketplace Categories (Synced with Admin) */}
                    <div style={columnStyle}>
                        <h4 style={headingStyle}>Marketplace</h4>
                        {categories.length > 0 ? (
                            categories.slice(0, 5).map(cat => (
                                <FooterLink key={cat._id} onClick={() => handleCategoryClick(cat.name)}>
                                    {cat.name}
                                </FooterLink>
                            ))
                        ) : (
                            <p style={{fontSize: '12px'}}>Syncing categories...</p>
                        )}
                        <FooterLink onClick={() => handleCategoryClick('All')}>All Gigs</FooterLink>
                    </div>

                    {/* Admin Feature: Quick Category Management Access */}
                    <div style={columnStyle}>
                        <h4 style={headingStyle}>Community</h4>
                        <FooterLink onClick={() => setView('profile')}>My Dashboard</FooterLink>
                        <FooterLink onClick={() => setView('leaderboard')}>Leaderboard</FooterLink>
                        {/* Option for admin to quickly manage categories */}
                        <FooterLink onClick={() => setView('admin-settings')}>Admin Settings</FooterLink>
                        <FooterLink onClick={() => setView('privacy')}>Privacy Policy</FooterLink>
                    </div>
                </div>

                <div style={bottomBarStyle}>
                    <p>© 2026 <strong>TalentBD</strong>. All Rights Reserved.</p>
                    <p style={{marginTop: '5px', fontSize: '10px', color: '#475569'}}>
                        Optimized for HP-840 G3 | System Temp: 44°C Safe
                    </p>
                </div>
            </div>
        </footer>
    );
}

// --- Styles remain exactly as provided in your prior prompt for consistency ---
const footerStyle = { background: '#020617', color: '#94a3b8', padding: '80px 0 30px', marginTop: 'auto', width: '100%', borderTop: '1px solid #1e293b' };
const containerStyle = { maxWidth: '1200px', margin: '0 auto', padding: '0 30px', boxSizing: 'border-box' };
const gridStyle = { display: 'grid', gap: '50px', marginBottom: '60px' };
const brandSectionStyle = { maxWidth: '350px' };
const logoStyle = { color: '#fff', fontSize: '28px', fontWeight: '900', marginBottom: '20px', letterSpacing: '-1px' };
const taglineStyle = { fontSize: '15px', lineHeight: '1.7', marginBottom: '25px', color: '#64748b' };
const headingStyle = { color: '#f8fafc', fontSize: '14px', fontWeight: '800', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '1.5px' };
const columnStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const linkStyle = { cursor: 'pointer', fontSize: '14px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'inline-block', fontWeight: '500' };
const socialLinksStyle = { display: 'flex', gap: '15px' };
const socialIconStyle = { background: '#0f172a', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: '#3b82f6', cursor: 'pointer', border: '1px solid #1e293b', transition: '0.3s' };
const bottomBarStyle = { borderTop: '1px solid #0f172a', paddingTop: '30px', textAlign: 'center', fontSize: '13px', color: '#64748b' };