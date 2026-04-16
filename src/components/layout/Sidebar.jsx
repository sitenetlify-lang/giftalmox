import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine,
  ArrowLeftRight, ClipboardCheck, FileBarChart, Bell, ShieldCog
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/products', icon: Package, label: 'Produtos' },
  { path: '/entries', icon: ArrowDownToLine, label: 'Entradas' },
  { path: '/exits', icon: ArrowUpFromLine, label: 'Saídas' },
  { path: '/movements', icon: ArrowLeftRight, label: 'Movimentações' },
  { path: '/inventory', icon: ClipboardCheck, label: 'Inventário' },
  { path: '/reports', icon: FileBarChart, label: 'Relatórios' },
  { path: '/alerts', icon: Bell, label: 'Alertas' },
];

export default function Sidebar() {
  const location = useLocation();
  const { settings } = useSettings();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col z-50">
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-sidebar-primary/10 -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-sidebar-primary/5 translate-y-6 -translate-x-6" />

        <div className="relative px-5 pt-6 pb-5 border-b border-sidebar-border">
          <div className="flex items-center justify-center">
            <div className="relative bg-white rounded-xl px-4 py-2.5 shadow-lg shadow-black/20 min-w-[170px]">
              <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-sidebar-primary" />
              <div className="flex items-center justify-center gap-3">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt={settings.system_name} className="h-9 w-auto object-contain max-w-[120px]" />
                ) : (
                  <div className="h-9 w-9 rounded-lg bg-sidebar-primary/10 flex items-center justify-center text-sidebar-primary font-bold">
                    {settings.system_name?.charAt(0)?.toUpperCase() || 'G'}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">{settings.system_name}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Almoxarifado</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-center">
            <div className="inline-flex items-center gap-1.5">
              <div className="h-px w-6 bg-sidebar-primary/40" />
              <p className="text-[9px] text-sidebar-foreground/40 tracking-[0.2em] uppercase font-medium">
                Gestão de Estoque
              </p>
              <div className="h-px w-6 bg-sidebar-primary/40" />
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <Icon className={cn('h-4.5 w-4.5', isActive && 'text-sidebar-primary')} />
              {label}
              {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200">
          <ShieldCog className="h-4.5 w-4.5" />
          Painel Admin
        </Link>
      </div>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <p className="text-[10px] text-sidebar-foreground/40 text-center">
          v2.0 — Vercel + Supabase
        </p>
      </div>
    </aside>
  );
}
