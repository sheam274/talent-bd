import React, { useState, useEffect } from 'react';
import { 
    Menu, X, BookOpen, Briefcase, User, LogOut, 
    ChevronRight, Settings, Sparkles, Wallet 
} from 'lucide-react';

const Navbar = ({ setView, user, handleLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // SYNC: Handle Screen Resize for Responsive Logic
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        const handleScroll = () => setScrolled(window.scrollY > 20);
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const navItems = [
        { label: 'Find Jobs', icon: <Briefcase size={18}/>, view: 'jobs' },
        { label: 'Learning Hub', icon: <BookOpen size={18}/>, view: 'learning' },
        { label: 'CV Builder', icon: <Sparkles size={18}/>, view: 'cv-builder' },
        { label: 'ATS Scanner', icon: <Settings size={18}/>, view: 'ats-scanner' }, // SYNC: Added for quick access
    ];

    const handleNav = (view) => {
        if (typeof setView === 'function') {
            setView(view);
            setIsOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <nav style={{
            ...navStyles.nav,
            backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.85)' : '#ffffff',
            backdropFilter: scrolled ? 'blur(16px)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid #f1f5f9',
            boxShadow: scrolled ? '0 10px 15px -3px rgba(0, 0, 0, 0.05)' : 'none',
        }}>
            <div style={navStyles.container}>
                {/* Logo Section */}
                <div style={navStyles.logo} onClick={() => handleNav('home')}>
                    <div style={navStyles.logoIcon}>T</div>
                    <span style={{display: isMobile && user ? 'none' : 'block'}}>
                        Talent<span style={{color: '#2563eb'}}>BD</span>
                    </span>
                </div>

                {/* Desktop Navigation */}
                {!isMobile && (
                    <div style={navStyles.desktopMenu}>
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
                                {(hoveredItem === item.view || item.view === 'current') && <div style={navStyles.underline} />}
                            </button>
                        ))}
                        
                        {user?.role === 'admin' && (
                            <button onClick={() => handleNav('admin')} style={navStyles.adminLink}>
                                <Settings size={16} /> Admin
                            </button>
                        )}
                    </div>
                )}

                {/* Action Group (Points & Profile) */}
                <div style={navStyles.actionGroup}>
                    {user ? (
                        <div style={navStyles.userGroup}>
                            {/* SYNC: Wallet Balance (Shows real money earned from Quizzes) */}
                            <div style={navStyles.walletBadge} title="Wallet Balance">
                                <Wallet size={14} />
                                <span>৳{user.walletBalance || 0}</span>
                            </div>

                            {!isMobile && (
                                <div style={navStyles.pointsBadge}>
                                    {user.points || 0} XP
                                </div>
                            )}

                            <button onClick={() => handleNav('profile')} style={navStyles.profileBtn}>
                                <div style={navStyles.avatar}>
                                    {user.name ? user.name[0].toUpperCase() : 'U'}
                                </div>
                                {!isMobile && <span style={{maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{user.name?.split(' ')[0]}</span>}
                                <ChevronRight size={14} style={{opacity: 0.5}} />
                            </button>

                            {!isMobile && (
                                <button onClick={handleLogout} style={navStyles.logoutIconBtn}>
                                    <LogOut size={18} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <button onClick={() => handleNav('login')} style={navStyles.premiumBtn}>
                            Login
                        </button>
                    )}

                    {isMobile && (
                        <button style={navStyles.mobileToggle} onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Dropdown (Responsive & Synced) */}
            {isOpen && isMobile && (
                <div style={navStyles.mobileMenu}>
                    {navItems.map((item) => (
                        <button key={item.view} onClick={() => handleNav(item.view)} style={navStyles.mobileLink}>
                            <span style={navStyles.mobileIconWrapper}>{item.icon}</span> 
                            {item.label}
                        </button>
                    ))}
                    {user ? (
                        <>
                            <div style={navStyles.mobileDivider} />
                            <button onClick={() => handleNav('profile')} style={navStyles.mobileLink}>
                                <span style={navStyles.mobileIconWrapper}><User size={18} /></span> Profile Settings
                            </button>
                            <button onClick={handleLogout} style={{...navStyles.mobileLink, color: '#ef4444'}}>
                                <span style={{...navStyles.mobileIconWrapper, color: '#ef4444'}}><LogOut size={18} /></span> Logout
                            </button>
                        </>
                    ) : (
                        <button onClick={() => handleNav('login')} style={navStyles.mobilePremiumBtn}>Join Now</button>
                    )}
                </div>
            )}
        </nav>
    );
};

// --- Exceptional Styles (HP-840 Optimized) ---
const navStyles = {
    nav: { position: 'fixed', top: 0, left: 0, right: 0, height: '72px', display: 'flex', alignItems: 'center', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 2000 },
    container: { width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    logo: { fontSize: '24px', fontWeight: '900', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.8px' },
    logoIcon: { background: '#2563eb', color: '#fff', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' },
    desktopMenu: { display: 'flex', gap: '28px', alignItems: 'center' },
    link: { background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '15px', position: 'relative', padding: '10px 0', transition: 'all 0.2s', fontFamily: 'inherit' },
    underline: { position: 'absolute', bottom: '-4px', left: '0', right: '0', height: '3px', background: '#2563eb', borderRadius: '10px' },
    adminLink: { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
    actionGroup: { display: 'flex', gap: '16px', alignItems: 'center' },
    userGroup: { display: 'flex', gap: '12px', alignItems: 'center' },
    walletBadge: { background: '#f0fdf4', color: '#16a34a', padding: '6px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', border: '1px solid #dcfce7', display: 'flex', alignItems: 'center', gap: '6px' },
    pointsBadge: { background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', border: '1px solid #dbeafe' },
    profileBtn: { display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#1e293b', transition: 'all 0.2s shadow' },
    avatar: { width: '28px', height: '28px', background: '#2563eb', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' },
    premiumBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '15px', transition: 'transform 0.2s' },
    logoutIconBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px' },
    mobileToggle: { background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '10px', cursor: 'pointer' },
    mobileMenu: { position: 'absolute', top: '80px', left: '20px', right: '20px', background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(20px)', borderRadius: '24px', display: 'flex', flexDirection: 'column', padding: '20px', gap: '10px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', border: '1px solid #f1f5f9' },
    mobileLink: { background: 'none', border: 'none', textAlign: 'left', padding: '16px', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '14px', borderRadius: '14px', color: '#334155' },
    mobileIconWrapper: { color: '#2563eb' },
    mobileDivider: { height: '1px', background: '#f1f5f9', margin: '10px 0' },
    mobilePremiumBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '16px', borderRadius: '16px', fontWeight: '800', fontSize: '16px' }
};

export default Navbar;