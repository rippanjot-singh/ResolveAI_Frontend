import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    ChevronRight, ChevronLeft, ChevronsUpDown, SquareTerminal,
    Bot, BookOpen, Settings2, Moon, Sun, PanelLeftClose, PanelLeftOpen, LogOut, Settings,
    LayoutDashboard, FileText, Tag, Users, Mail,
} from 'lucide-react';
import constants from '../../assets/constants';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useSelector } from 'react-redux';

const PLATFORM_LINKS = [
    {
        title: 'Overview',
        icon: LayoutDashboard,
        path: '/dashboard',
    },
    {
        title: 'Studio',
        icon: SquareTerminal,
        path: '/dashboard/studio',
        children: [
            { title: 'Agents', path: '/dashboard/studio/agents' },
            { title: 'Analytics', path: '/dashboard/studio/analytics' },
            { title: 'Playground', path: '/dashboard/studio/playground' },
            { title: 'Chats', path: '/dashboard/studio/chats' },
        ]
    },
    {
        title: 'Forms',
        icon: FileText,
        path: '/dashboard/forms',
        children: [
            { title: 'All Forms', path: '/dashboard/forms' },
            { title: 'Results', path: '/dashboard/forms/results' },
        ]
    },
    {
        title: 'Tickets',
        icon: Tag,
        path: '/dashboard/tickets',
        children: [
            { title: 'All Tickets', path: '/dashboard/tickets' },
            { title: 'Focus Area', path: '/dashboard/tickets/focus-area' },
        ]
    },
    {
        title: 'Knowledge Base',
        icon: BookOpen,
        path: '/dashboard/knowledge',
    },
    {
        title: 'Leads',
        icon: Users,
        path: '/dashboard/leads',   
    },
    // {
    //     title: 'Emails',
    //     icon: Mail,
    //     path: '/dashboard/email',   
    // },
    {
        title: 'Settings',
        icon: Settings,
        path: '/dashboard/settings',
        children: [
            { title: 'Account Profile', path: '/dashboard/settings' },
            { title: 'Company Management', path: '/dashboard/settings/users', adminOnly: true },
            { title: 'Invite Member', path: '/dashboard/settings/invite' },
        ]
    },
];

const SideNav = () => {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidenav_collapsed');
        return saved === 'true';
    });
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return document.documentElement.classList.contains('dark');
    });
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const [openMenus, setOpenMenus] = useState(() => {
        const saved = localStorage.getItem('sidenav_open_menus');
        if (saved) return JSON.parse(saved);
        return { Studio: true }; // Default open Studio
    });

    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Responsive Handling
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1280) {
                setIsCollapsed(true);
            }
        };
        
        handleResize(); // Check on mount
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle click outside for profile dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Persist SideNav State
    useEffect(() => {
        localStorage.setItem('sidenav_collapsed', isCollapsed);
    }, [isCollapsed]);

    // Persist Open Menus
    useEffect(() => {
        localStorage.setItem('sidenav_open_menus', JSON.stringify(openMenus));
    }, [openMenus]);

    // Apply & Persist Theme
    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.remove('dark');
            setIsDark(false);
        } else {
            root.classList.add('dark');
            setIsDark(true);
        }
    };

    const toggleMenu = (menuTitle) => {
        if (isCollapsed) {
            setIsCollapsed(false);
            setOpenMenus(prev => ({
                ...prev,
                [menuTitle]: true // Always open the clicked menu when expanding
            }));
            return;
        }
        setOpenMenus(prev => ({
            ...prev,
            [menuTitle]: !prev[menuTitle]
        }));
    };

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <>
            {/* Overlay for mobile when expanded */}
            {isMobile && !isCollapsed && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300" 
                    onClick={() => setIsCollapsed(true)}
                />
            )}

            <aside className={`
                ${isMobile && !isCollapsed ? 'fixed inset-y-0 left-0 z-50' : 'relative'} 
                flex flex-col h-screen bg-background border-r border-border transition-all duration-300 
                ${isCollapsed ? 'w-16' : 'w-64'}
            `}>

            {/* Header */}
            <div className="h-16 flex items-center justify-between pl-5 px-3 border-b border-border transition-colors relative">
                <div className={`flex items-center ${isCollapsed ? 'w-full justify-center' : 'gap-3'} overflow-hidden`}>
                    <img src={constants.logo} alt="" className='w-4.5' />
                    {!isCollapsed && (
                        <div className="flex flex-col cursor-pointer">
                            <span className="text-sm font-semibold truncate text-foreground leading-tight">{user?.companyId?.name}</span>
                            <span className="text-xs text-foreground/60 truncate leading-tight">{user?.role}</span>
                        </div>
                    )}
                </div>

                {!isCollapsed && (
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={toggleTheme}
                            className="p-1.5 rounded-full hover:bg-surface text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
                            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDark ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                    </div>
                )}
            </div>

            {/* Floating Collapse/Expand Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 bg-background border border-border text-foreground/70 hover:text-foreground p-1 rounded-full z-50 cursor-pointer transition-colors"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Main Nav */}
            <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-6">

                {/* Platform Section */}
                <div>
                    {!isCollapsed && <h3 className="px-2 text-xs font-medium text-foreground/50 mb-2">Platform</h3>}

                    <nav className="flex flex-col gap-1">
                        {PLATFORM_LINKS.map((item) => {
                            const Icon = item.icon;
                            const hasChildren = !!item.children;
                            const isOpen = openMenus[item.title];

                            if (hasChildren) {
                                const isActiveMenu = location.pathname.startsWith(item.path);

                                return (
                                    <div key={item.title}>
                                        <button
                                            onClick={() => toggleMenu(item.title)}
                                            className={`w-full flex items-center justify-between px-2 py-2 rounded transition-colors ${isActiveMenu ? 'bg-surface text-foreground font-medium' : 'text-foreground hover:bg-surface'}`}
                                            title={item.title}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon size={18} className="shrink-0" />
                                                {!isCollapsed && <span className="text-sm">{item.title}</span>}
                                            </div>
                                            {!isCollapsed && (
                                                <ChevronRight size={16} className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                                            )}
                                        </button>

                                        {!isCollapsed && isOpen && (
                                            <div className="ml-4 pl-4 mt-1 border-l border-border/50 flex flex-col gap-1">
                                                {item.children
                                                    .filter(child => !child.adminOnly || user?.role === 'admin')
                                                    .map((child) => (
                                                        <NavLink
                                                            key={child.title}
                                                            to={child.path}
                                                            end={child.path === item.path}
                                                            className={({ isActive }) =>
                                                                `px-2 py-1.5 text-sm rounded transition-colors ${isActive ? 'bg-surface text-foreground font-medium' : 'text-foreground/90 hover:text-foreground hover:bg-surface'}`
                                                            }
                                                        >
                                                            {child.title}
                                                        </NavLink>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <NavLink
                                    key={item.title}
                                    to={item.path}
                                    end={item.path === '/dashboard'}
                                    title={item.title}
                                    onClick={() => isCollapsed && setIsCollapsed(false)}
                                    className={({ isActive }) =>
                                        `w-full flex items-center justify-between px-2 py-2 rounded transition-colors ${isActive ? 'bg-surface text-foreground font-medium' : 'text-foreground hover:bg-surface'}`
                                    }
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={18} className="shrink-0" />
                                        {!isCollapsed && <span className="text-sm">{item.title}</span>}
                                    </div>
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Footer / Controls */}
            <div className="border-t border-border p-3 flex flex-col gap-2 relative" ref={profileRef}>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                    <div className={`absolute bottom-full left-3 bg-background border border-border rounded shadow-md py-1 mb-2 z-50 ${isCollapsed ? 'w-48' : 'w-[calc(100%-24px)]'}`}>
                        {/* <button
                            onClick={() => {
                                setIsProfileOpen(false);
                                navigate('/dashboard/settings');
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-surface transition-colors text-left cursor-pointer"
                        >
                            <Settings size={16} />
                            Settings
                        </button>
                        <div className="h-px bg-border my-1 w-full" /> */}
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                )}

                {/* User Profile */}
                <div
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center ${isCollapsed ? 'justify-center py-2' : 'justify-between p-2'} rounded hover:bg-surface cursor-pointer transition-colors ${isProfileOpen ? 'bg-surface' : ''}`}
                >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} overflow-hidden`}>
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white shrink-0">
                            <span className="text-xs font-bold">{user?.name ? user.name.substring(0, 2).toUpperCase() : 'AI'}</span>
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold truncate text-foreground leading-tight">{user?.name || 'shadcn'}</span>
                                <span className="text-xs text-foreground/60 truncate leading-tight">{user?.email || 'm@example.com'}</span>
                            </div>
                        )}
                    </div>
                    {!isCollapsed && <ChevronsUpDown size={16} className="text-foreground/50 shrink-0" />}
                </div>

            </div>
        </aside>
        </>
    );
};

export default SideNav;
