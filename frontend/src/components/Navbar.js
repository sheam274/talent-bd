import React, { useState, useEffect } from 'react';
import { 
    Menu, X, BookOpen, Briefcase, User, LogOut, 
    ChevronRight, Settings, Sparkles, Wallet, LayoutGrid 
} from 'lucide-react';

const Navbar = ({ setView, user, handleLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

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
        { label: 'ATS Scanner', icon: <Settings size={18}/>, view: 'ats-scanner' },
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
            backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.9)' : '#ffffff',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid #f1f5f9',
        }}>
            <div style={navStyles.container}>
                {/* Logo Section */}
                <div style={navStyles.logo} onClick={() => handleNav('home')}>
                    <div style={navStyles.logoIcon}>T</div>
                    <span style={{display: isMobile && user ? 'none' : 'block'}}>
                        Talent<span style={{color: '#2563eb'}}>BD</span>
                    </span>
                </div>

                {/* Desktop Menu + Admin Category Access */}
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
                                {(hoveredItem === item.view) && <div style={navStyles.underline} />}
                            </button>
                        ))}
                        
                        {/* ADMIN ONLY: Category Management Toggle */}
                        {user?.role === 'admin' && (
                            <button 
                                onClick={() => handleNav('admin-categories')} 
                                style={navStyles.adminCategoryBtn}
                                title="Manage Job & Learning Categories"
                            >
                                <LayoutGrid size={16} />
                                Categories
                            </button>
                        )}
                    </div>
                )}

                <div style={navStyles.actionGroup}>
                    {user ? (
                        <div style={navStyles.userGroup}>
                            <div style={navStyles.walletBadge}>
                                <Wallet size={14} />
                                <span>৳{user.walletBalance || 0}</span>
                            </div>

                            <button onClick={() => handleNav('profile')} style={navStyles.profileBtn}>
                                <div style={navStyles.avatar}>
                                    {user.name ? user.name[0].toUpperCase() : 'U'}
                                </div>
                                {!isMobile && <span style={navStyles.userName}>{user.name?.split(' ')[0]}</span>}
                                <ChevronRight size={14} />
                            </button>

                            {!isMobile && (
                                <button onClick={handleLogout} style={navStyles.logoutIconBtn}>
                                    <LogOut size={18} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <button onClick={() => handleNav('login')} style={navStyles.loginBtn}>Login</button>
                    )}

                    {isMobile && (
                        <button style={navStyles.mobileToggle} onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Dropdown - Optimized for Touch */}
            {isOpen && isMobile && (
                <div style={navStyles.mobileMenu}>
                    {navItems.map((item) => (
                        <button key={item.view} onClick={() => handleNav(item.view)} style={navStyles.mobileLink}>
                            <span style={navStyles.mobileIconWrapper}>{item.icon}</span> 
                            {item.label}
                        </button>
                    ))}
                    
                    {user?.role === 'admin' && (
                        <button onClick={() => handleNav('admin-categories')} style={{...navStyles.mobileLink, color: '#8b5cf6'}}>
                            <span style={{...navStyles.mobileIconWrapper, color: '#8b5cf6'}}><LayoutGrid size={18} /></span>
                            Manage Categories
                        </button>
                    )}

                    {user ? (
                        <>
                            <div style={navStyles.mobileDivider} />
                            <button onClick={() => handleNav('profile')} style={navStyles.mobileLink}>
                                <span style={navStyles.mobileIconWrapper}><User size={18} /></span> My Profile
                            </button>
                            <button onClick={handleLogout} style={{...navStyles.mobileLink, color: '#ef4444'}}>
                                <span style={{...navStyles.mobileIconWrapper, color: '#ef4444'}}><LogOut size={18} /></span> Logout
                            </button>
                        </>
                    ) : (
                        <button onClick={() => handleNav('login')} style={navStyles.mobileJoinBtn}>Join Platform</button>
                    )}
                </div>
            )}
        </nav>
    );
};

// --- Synced Styles (Preserving all original spacing) ---
const navStyles = {
    nav: { position: 'fixed', top: 0, left: 0, right: 0, height: '72px', display: 'flex', alignItems: 'center', transition: 'all 0.3s ease', zIndex: 2000 },
    container: { width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    logo: { fontSize: '24px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
    logoIcon: { background: '#2563eb', color: '#fff', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    desktopMenu: { display: 'flex', gap: '24px', alignItems: 'center' },
    link: { background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '15px', position: 'relative', padding: '10px 0' },
    underline: { position: 'absolute', bottom: '-2px', left: '0', right: '0', height: '3px', background: '#2563eb', borderRadius: '10px' },
    
    // ADMIN SYNC STYLE
    adminCategoryBtn: { background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
    
    actionGroup: { display: 'flex', gap: '12px', alignItems: 'center' },
    userGroup: { display: 'flex', gap: '10px', alignItems: 'center' },
    walletBadge: { background: '#f0fdf4', color: '#16a34a', padding: '6px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', border: '1px solid #dcfce7', display: 'flex', alignItems: 'center', gap: '6px' },
    profileBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' },
    avatar: { width: '26px', height: '26px', background: '#2563eb', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' },
    userName: { maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px' },
    loginBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' },
    logoutIconBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' },
    mobileToggle: { background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '10px', cursor: 'pointer' },
    mobileMenu: { position: 'absolute', top: '80px', left: '15px', right: '15px', background: '#fff', borderRadius: '20px', display: 'flex', flexDirection: 'column', padding: '15px', gap: '8px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9' },
    mobileLink: { background: 'none', border: 'none', textAlign: 'left', padding: '14px', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px', color: '#334155' },
    mobileIconWrapper: { color: '#2563eb' },
    mobileDivider: { height: '1px', background: '#f1f5f9', margin: '5px 0' },
    mobileJoinBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700' }
};

export default Navbar;