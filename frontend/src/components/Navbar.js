import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Added missing import
import { 
    Menu, X, BookOpen, Briefcase, User, LogOut, 
    ChevronRight, Settings, Sparkles 
} from 'lucide-react';

const Navbar = ({ setView, user, handleLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { label: 'Find Jobs', icon: <Briefcase size={18}/>, view: 'jobs' },
        { label: 'Learning Hub', icon: <BookOpen size={18}/>, view: 'learning' },
        { label: 'CV Builder', icon: <Sparkles size={18}/>, view: 'cv-builder' },
    ];

    const handleNav = (view) => {
        if (typeof setView === 'function') {
            setView(view);
            setIsOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            console.error("setView prop is missing in Navbar!");
        }
    };

    return (
        <nav style={{
            ...navStyles.nav,
            backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : '#ffffff',
            backdropFilter: scrolled ? 'blur(12px)' : 'none',
            boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.08)' : '0 1px 0 rgba(0,0,0,0.05)',
        }}>
            <div style={navStyles.container}>
                {/* Logo */}
                <div style={navStyles.logo} onClick={() => handleNav('home')}>
                    <div style={navStyles.logoIcon}>T</div>
                    Talent<span style={{color: '#2563eb'}}>BD</span>
                </div>

                {/* Desktop Menu */}
                <div className="desktop-nav-wrapper" style={navStyles.desktopMenu}>
                    {navItems.map((item) => (
                        <button 
                            key={item.view} 
                            onClick={() => handleNav(item.view)} 
                            onMouseEnter={() => setHoveredItem(item.view)}
                            onMouseLeave={() => setHoveredItem(null)}
                            style={{
                                ...navStyles.link,
                                color: hoveredItem === item.view ? '#2563eb' : '#64748b'
                            }}
                        >
                            {item.label}
                            {hoveredItem === item.view && <div style={navStyles.underline} />}
                        </button>
                    ))}
                    
                    {user?.role === 'admin' && (
                        <button 
                            onClick={() => handleNav('admin')}
                            style={{...navStyles.link, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px'}}
                        >
                            <Settings size={16} /> Admin
                        </button>
                    )}
                    
                    <div style={navStyles.divider} />

                    {user ? (
                        <div style={navStyles.userGroup}>
                            <div style={navStyles.statsGroup}>
                                <span style={navStyles.pointsBadge}>{user.points || 0} XP</span>
                            </div>
                            {/* INTEGRATED: ChevronRight added to Profile button as requested */}
                            <button 
                                onClick={() => handleNav('profile')} 
                                style={navStyles.profileBtn}
                            >
                                <div style={navStyles.avatar}>
                                    {user.name ? user.name[0].toUpperCase() : 'U'}
                                </div>
                                <span className="nav-name-hide">{user.name?.split(' ')[0]}</span>
                                <ChevronRight size={14} style={{marginLeft: '4px', opacity: 0.7}} />
                            </button>
                            <button onClick={handleLogout} style={navStyles.logoutIconBtn} title="Logout">
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => handleNav('login')} style={navStyles.premiumBtn}>
                            Login
                        </button>
                    )}
                </div>

                {/* Mobile Toggle */}
                <div className="mobile-only-flex" style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                     {!isOpen && user && <span style={navStyles.pointsBadgeMobile}>{user.points || 0} XP</span>}
                    <button style={navStyles.mobileToggle} onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {isOpen && (
                <div style={navStyles.mobileMenu}>
                    {navItems.map((item) => (
                        <button key={item.view} onClick={() => handleNav(item.view)} style={navStyles.mobileLink}>
                            <span style={navStyles.mobileIconWrapper}>{item.icon}</span> 
                            {item.label}
                        </button>
                    ))}
                    {user?.role === 'admin' && (
                         <button onClick={() => handleNav('admin')} style={{...navStyles.mobileLink, color: '#f59e0b'}}>
                            <span style={{...navStyles.mobileIconWrapper, color: '#f59e0b'}}><Settings size={18} /></span> Admin Panel
                        </button>
                    )}
                    <div style={{margin: '10px 0', borderTop: '1px solid #f1f5f9'}} />
                    {user ? (
                        <>
                            <button onClick={() => handleNav('profile')} style={navStyles.mobileLink}>
                                <span style={navStyles.mobileIconWrapper}><User size={18} /></span> 
                                My Profile <ChevronRight size={14} style={{marginLeft: 'auto'}} />
                            </button>
                            <button onClick={handleLogout} style={{...navStyles.mobileLink, color: '#ef4444'}}>
                                <span style={{...navStyles.mobileIconWrapper, color: '#ef4444'}}><LogOut size={18} /></span> Logout
                            </button>
                        </>
                    ) : (
                        <button onClick={() => handleNav('login')} style={navStyles.mobilePremiumBtn}>Get Started</button>
                    )}
                </div>
            )}
        </nav>
    );
};

// --- Styles unchanged to preserve features ---
const navStyles = {
    nav: { position: 'fixed', top: 0, left: 0, right: 0, height: '70px', display: 'flex', alignItems: 'center', transition: 'all 0.3s ease', zIndex: 2000 },
    container: { width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    logo: { fontSize: '22px', fontWeight: '800', cursor: 'pointer', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.5px' },
    logoIcon: { background: '#2563eb', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' },
    desktopMenu: { display: 'flex', gap: '20px', alignItems: 'center' },
    link: { background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '14px', position: 'relative', padding: '8px 0', transition: 'color 0.2s ease', fontFamily: 'inherit' },
    underline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: '#2563eb', borderRadius: '2px' },
    divider: { width: '1px', height: '24px', background: '#e2e8f0', margin: '0 8px' },
    premiumBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' },
    userGroup: { display: 'flex', gap: '12px', alignItems: 'center' },
    statsGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
    pointsBadge: { background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', border: '1px solid #dbeafe' },
    pointsBadgeMobile: { background: '#eff6ff', color: '#2563eb', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' },
    profileBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: '#334155', transition: 'all 0.2s' },
    avatar: { width: '24px', height: '24px', background: '#2563eb', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' },
    logoutIconBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: '5px', transition: 'color 0.2s' },
    mobileToggle: { background: 'none', border: 'none', cursor: 'pointer', color: '#1e293b' },
    mobileMenu: { position: 'absolute', top: '75px', left: '15px', right: '15px', background: '#fff', borderRadius: '16px', display: 'flex', flexDirection: 'column', padding: '15px', gap: '8px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9' },
    mobileLink: { background: 'none', border: 'none', textAlign: 'left', padding: '12px', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '10px', color: '#475569', cursor: 'pointer' },
    mobileIconWrapper: { color: '#2563eb', display: 'flex' },
    mobilePremiumBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', marginTop: '10px' }
};

export default Navbar;