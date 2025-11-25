import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Activity, TrendingUp, Zap, Calendar, RefreshCw, Settings as SettingsIcon, Menu, X, Wallet, Sparkles, Rocket } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'BrutusAI Pilot', icon: Rocket },
  { path: '/dashboard', label: 'Dashboard', icon: Activity },
  { path: '/trends', label: 'Trend Scout', icon: TrendingUp },
  { path: '/content', label: 'Content Engine', icon: Zap },
  { path: '/planner', label: 'Planer', icon: Calendar },
  { path: '/status', label: 'Status Monitor', icon: RefreshCw },
  { path: '/billing', label: 'Abrechnung', icon: Wallet },
  { path: '/settings', label: 'Einstellungen', icon: SettingsIcon }
];

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-slate-900/50 border-r border-slate-800/50 backdrop-blur-xl flex-col fixed h-screen z-40">
        {/* Logo */}
        <div className="h-16 border-b border-slate-800/50 flex items-center px-6 gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">BRUTUS AI</p>
            <p className="text-base font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Creator Hub</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `group flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                  }`
                }
              >
                <Icon size={20} className="group-hover:scale-110 transition-transform duration-300" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="px-4 py-6 border-t border-slate-800/50 bg-slate-900/30">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
              C
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-100 group-hover:text-purple-400 transition-colors">Creator</p>
              <p className="text-xs text-slate-400">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-sm border border-slate-700 text-white hover:border-blue-500 transition-all shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <aside className="lg:hidden fixed inset-0 z-40 bg-slate-900/98 backdrop-blur-xl">
          <div className="h-20 border-b border-slate-800/50 flex items-center px-6 gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">BRUTUS AI</p>
              <p className="text-base font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Creator Hub</p>
            </div>
          </div>
          <nav className="px-3 py-6 space-y-1.5 overflow-y-auto" style={{maxHeight: 'calc(100vh - 5rem)'}}>
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                    }`
                  }
                >
                  <Icon size={20} className="group-hover:scale-110 transition-transform duration-300" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen w-full lg:ml-64 xl:ml-72">
        {/* Top Bar */}
        <header className="h-16 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 lg:px-10 sticky top-0 z-30">
          <div className="lg:block hidden">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">BRUTUS AI</h1>
            <p className="text-xs text-slate-400">Dein Social Media Autopilot</p>
          </div>
          <div className="lg:hidden flex items-center gap-3 ml-14">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">BRUTUS AI</h1>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800 transition-all duration-300 group">
              <Activity size={18} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse shadow-lg shadow-green-500/50" />
            </button>
            <button className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/50 hover:bg-slate-800 transition-all duration-300 group">
              <SettingsIcon size={18} className="text-slate-400 group-hover:text-purple-400 transition-colors" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-10 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
