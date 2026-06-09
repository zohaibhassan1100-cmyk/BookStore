// src/layouts/AppShell.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  )},
  { to: '/books', label: 'Books', icon: (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  )},
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 h-16 border-b border-surface-100 flex-shrink-0 ${collapsed ? 'justify-center px-3' : ''}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
          </svg>
        </div>
        {!collapsed && <span className="font-bold text-ink text-[15px] tracking-tight">BookStore<span className="text-brand-500">Pro</span></span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className={`text-[10px] font-bold text-ink/30 uppercase tracking-widest mb-3 ${collapsed ? 'text-center' : 'px-2'}`}>
          {collapsed ? '·' : 'Menu'}
        </p>
        {NAV.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
               ${isActive
                 ? 'bg-brand-50 text-brand-600 shadow-sm'
                 : 'text-ink/50 hover:bg-surface-50 hover:text-ink'
               } ${collapsed ? 'justify-center' : ''}`
            }>
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-brand-500' : ''}>{icon}</span>
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className={`border-t border-surface-100 p-3 flex-shrink-0`}>
        <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-surface-50 transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-ink truncate">{user?.name}</p>
              <p className="text-[10px] text-ink/40 capitalize">{user?.role}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} title="Logout"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-ink/30 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          )}
        </div>
        {!collapsed && (
          <button onClick={() => setCollapsed(true)}
            className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] text-ink/30 hover:text-ink/60 hover:bg-surface-50 transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M11 19l-7-7 7-7M18 19l-7-7 7-7"/>
            </svg>
            Collapse
          </button>
        )}
        {collapsed && (
          <button onClick={() => setCollapsed(false)}
            className="w-full mt-1 flex items-center justify-center py-1.5 rounded-lg text-[10px] text-ink/30 hover:text-ink/60 hover:bg-surface-50 transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M13 5l7 7-7 7M6 5l7 7-7 7"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-surface-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-surface-200 flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-[64px]' : 'w-[220px]'}`}>
        <SidebarContent/>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)}/>
          <aside className="relative z-50 w-[220px] bg-white h-full border-r border-surface-200">
            <SidebarContent/>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-surface-200 flex items-center px-6 gap-4 flex-shrink-0">
          <button className="md:hidden btn-ghost btn-icon" onClick={() => setMobileOpen(true)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <div className="flex-1"/>

          <div className="flex items-center gap-2">
            <span className="badge-green text-[11px] px-2 py-0.5">● Live</span>
            <div className="w-px h-5 bg-surface-200"/>
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-ink leading-none">{user?.name}</p>
                <p className="text-[10px] text-ink/40 capitalize mt-0.5">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet/>
        </main>
      </div>
    </div>
  );
}
