import React, { useState } from 'react';

export default function Footer({ setView, setCategoryFilter }) {
    // Helper component to handle hover effects for links
    const FooterLink = ({ onClick, children }) => {
        const [isHovered, setIsHovered] = useState(false);
        return (
            <span 
                onClick={onClick} 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    ...linkStyle,
                    color: isHovered ? '#fff' : '#94a3b8'
                }}
            >
                {children}
            </span>
        );
    };

    // FIXED: Function to handle category navigation from footer
    const handleCategoryClick = (category) => {
        if (setCategoryFilter) {
            setCategoryFilter(category);
        }
        setView('jobs');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer style={footerStyle}>
            <div style={containerStyle}>
                <div style={gridStyle}>
                    {/* Brand Section */}
                    <div style={brandSectionStyle}>
                        <h2 style={logoStyle}>Talent<span style={{color: '#2563eb'}}>BD</span></h2>
                        <p style={taglineStyle}>
                            The ultimate platform to Learn skills, earn XP, and get hired. 
                            Connecting talent with the best opportunities in Bangladesh.
                        </p>
                        <div style={socialLinksStyle}>
                            <div style={socialIconStyle}>FB</div>
                            <div style={socialIconStyle}>LI</div>
                            <div style={socialIconStyle}>TW</div>
                        </div>
                    </div>

                    {/* Quick Navigation */}
                    <div style={columnStyle}>
                        <h4 style={headingStyle}>Navigation</h4>
                        <FooterLink onClick={() => setView('home')}>Home</FooterLink>
                        <FooterLink onClick={() => setView('jobs')}>Browse Jobs</FooterLink>
                        <FooterLink onClick={() => setView('learning-hub')}>Learning Hub</FooterLink>
                        <FooterLink onClick={() => setView('cv-builder')}>CV Builder</FooterLink>
                    </div>

                    {/* Job Categories - Fixed to actually filter jobs */}
                    <div style={columnStyle}>
                        <h4 style={headingStyle}>Categories</h4>
                        <FooterLink onClick={() => handleCategoryClick('Development')}>Development</FooterLink>
                        <FooterLink onClick={() => handleCategoryClick('Design')}>Design</FooterLink>
                        <FooterLink onClick={() => handleCategoryClick('Marketing')}>Marketing</FooterLink>
                        <FooterLink onClick={() => handleCategoryClick('Other')}>General Circulars</FooterLink>
                    </div>

                    {/* Support */}
                    <div style={columnStyle}>
                        <h4 style={headingStyle}>Support</h4>
                        <FooterLink onClick={() => setView('help')}>Help Center</FooterLink>
                        <FooterLink onClick={() => setView('privacy')}>Privacy Policy</FooterLink>
                        <FooterLink onClick={() => setView('contact')}>Contact Us</FooterLink>
                    </div>
                </div>

                <div style={bottomBarStyle}>
                    <p>© 2026 TalentBD. Developed with ❤️ in Bangladesh.</p>
                </div>
            </div>
        </footer>
    );
}

// --- Footer Styling ---
const footerStyle = { 
    background: '#0f172a', 
    color: '#94a3b8', 
    padding: '60px 0 20px', 
    marginTop: 'auto', // Push footer to bottom of page
    width: '100%',
    borderTop: '4px solid #2563eb' // Matches primary brand color
};

const containerStyle = { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '0 20px',
    boxSizing: 'border-box'
};

const gridStyle = { 
    display: 'grid', 
    // FIXED: Better responsive grid behavior
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
    gap: '40px', 
    marginBottom: '40px' 
};

const brandSectionStyle = { minWidth: '250px' };
const logoStyle = { color: '#fff', fontSize: '24px', fontWeight: '900', marginBottom: '15px', letterSpacing: '-0.5px' };
const taglineStyle = { fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' };
const headingStyle = { color: '#fff', fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' };
const columnStyle = { display: 'flex', flexDirection: 'column', gap: '12px' };

const linkStyle = { 
    cursor: 'pointer', 
    fontSize: '14px', 
    transition: '0.2s ease-in-out',
    display: 'block'
};

const socialLinksStyle = { display: 'flex', gap: '12px' };
const socialIconStyle = { 
    background: '#1e293b', 
    width: '40px', 
    height: '40px', 
    borderRadius: '10px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '12px', 
    fontWeight: 'bold',
    color: '#fff', 
    cursor: 'pointer',
    transition: '0.3s'
};

const bottomBarStyle = { 
    borderTop: '1px solid #1e293b', 
    paddingTop: '20px', 
    textAlign: 'center', 
    fontSize: '12px',
    opacity: '0.8'
};