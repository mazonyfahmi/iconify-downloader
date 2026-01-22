import React from 'react';
import { Search, Download, Settings, Box } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode; currentView: string; onViewChange: (view: string) => void }> = ({ children, currentView, onViewChange }) => {
    const navItems = [
        { id: 'search', icon: Search, label: 'Search' },
        { id: 'collection', icon: Box, label: 'Collection' },
        { id: 'download', icon: Download, label: 'Downloads' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="flex flex-col h-screen bg-base-100 font-sans select-none" data-theme="light">
            {/* Draggable Title Bar & Top Nav */}
            <div className="navbar bg-base-100 min-h-[3.5rem] border-b border-base-200 gap-2 shrink-0 z-50">
                {/* Drag Area Overlay */}
                <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

                {/* Brand */}
                <div className="flex-1 z-10 pl-2">
                    <a className="btn btn-ghost normal-case text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent gap-2">
                        <span className="text-2xl">⚡</span>
                        Iconify
                    </a>
                </div>

                {/* Top Actions (optional, currently empty or window controls could go here) */}
                <div className="flex-none z-10">
                    {/* Add global actions here if needed */}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 pb-20 scrollbar-hide">
                {children}
            </main>

            {/* Bottom Navigation */}
            <div className="btm-nav btm-nav-md bg-base-100/90 backdrop-blur border-t border-base-200 z-50">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        className={`${currentView === item.id ? 'active text-primary bg-primary/10' : 'text-base-content/50 hover:text-base-content'} transition-all`}
                        onClick={() => onViewChange(item.id)}
                    >
                        <item.icon size={20} className={currentView === item.id ? "fill-current" : ""} />
                        <span className="btm-nav-label text-xs font-medium">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
