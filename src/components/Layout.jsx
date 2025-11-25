import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Activity, TrendingUp, Zap, Calendar, RefreshCw, Settings as SettingsIcon, LogOut, Bell, User, Wallet } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: Activity },
  { path: '/trends', label: 'Trend Scout', icon: TrendingUp },
  { path: '/content', label: 'Content Engine', icon: Zap },
  { path: '/planner', label: 'Planer', icon: Calendar },
  { path: '/status', label: 'Status Monitor', icon: RefreshCw },
  { path: '/billing', label: 'Abrechnung', icon: Wallet },
  { path: '/settings', label: 'Einstellungen', icon: SettingsIcon }
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-slate-950/95 border-r border-slate-800 flex-col">
        {/* Logo */}
        <div className="h-16 border-b border-slate-800 flex items-center px-6 gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-900 font-bold">
            A
          </div>
          <div>
            <p className="text-sm text-slate-400">AutoSocial</p>
            <p className="text-lg font-semibold text-slate-100">Creator Hub</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 w-full px-3 py-2 rounded-xl transition text-sm font-medium ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/50'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="px-4 py-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-cyan-500 flex items-center justify-center text-slate-900 font-semibold">
              C
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-100">Creator</p>
              <p className="text-xs text-slate-400">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur flex items-center justify-between px-4 sm:px-6 lg:px-10">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-100">AutoSocial</h1>
            <p className="text-xs text-slate-400">Alles auf einen Blick, in Echtzeit.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl border border-slate-700 hover:border-cyan-400 transition">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-400" />
            </button>
            <button className="relative p-2 rounded-xl border border-slate-700 hover:border-cyan-400 transition">
              <User size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-6 bg-slate-950">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
