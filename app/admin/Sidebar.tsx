"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Video, 
  Network, 
  PhoneCall, 
  Settings, 
  BookOpen, 
  LogOut, 
  Box
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Mídias", href: "/admin/media", icon: Video },
    { name: "Centrais", href: "/admin/centers", icon: Network },
    { name: "Chamadas", href: "/admin/calls", icon: PhoneCall },
    { name: "Configurações", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-surface-solid)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      flexShrink: 0,
      height: '100vh',
      position: 'sticky',
      top: 0
    }}>
      {/* Brand Header */}
      <div style={{ padding: '0 1rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          width: 36, 
          height: 36, 
          background: 'var(--primary)', 
          borderRadius: 8, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#000'
        }}>
          <Box size={22} strokeWidth={2.5} />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          Simulate Call
        </h1>
      </div>

      {/* Main Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href}
              href={item.href} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-surface-hover)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.9rem' }}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Navigation */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <Link 
          href="/docs" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            transition: 'all 0.2s',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <BookOpen size={20} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.9rem' }}>API Docs</span>
        </Link>
        
        <Link 
          href="/login" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            transition: 'all 0.2s',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          onClick={() => {
            // Limpa o cookie de login no client (opcional, já que o back-end pode fazer o logout)
            document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          }}
        >
          <LogOut size={20} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.9rem' }}>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
