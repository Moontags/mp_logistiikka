'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Hinnasto', href: '/hinnasto' },
  { label: 'Palvelut', href: '/palvelut' },
  { label: 'Kuvat', href: '/kuvat' },
  { label: 'Yhteystiedot', href: '/yhteystiedot' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: scrolled ? 'rgba(17,17,17,0.95)' : 'rgba(17,17,17,0.7)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontWeight: 800,
            fontSize: '1.4rem',
            letterSpacing: '0.04em',
            color: 'var(--text)',
            textDecoration: 'none',
          }}
        >
          MP<span style={{ color: 'var(--orange)' }}>·</span>Logistiikka
        </Link>

        {/* Desktop links */}
        <ul
          style={{ gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}
          className="nav-links-desktop"
        >
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    color: active ? 'var(--text)' : 'var(--muted)',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-barlow)',
                    fontWeight: active ? 600 : 500,
                    fontSize: '0.95rem',
                    letterSpacing: '0.04em',
                    borderBottom: active ? '2px solid var(--orange)' : '2px solid transparent',
                    paddingBottom: '2px',
                    transition: 'color 0.2s',
                  }}
                  onMouseOver={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)')
                  }
                  onMouseOut={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      active ? 'var(--text)' : 'var(--muted)')
                  }
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* CTA desktop */}
        <Link
          href="/tilauslomake"
          className="nav-cta-desktop"
          style={{
            background: 'var(--orange)',
            color: '#fff',
            padding: '0.5rem 1.25rem',
            borderRadius: '4px',
            fontFamily: 'var(--font-barlow-condensed)',
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '0.05em',
            textDecoration: 'none',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.background = 'var(--orange-light)')
          }
          onMouseOut={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.background = 'var(--orange)')
          }
        >
          Tilaa kuljetus
        </Link>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="nav-hamburger"
          aria-label="Avaa valikko"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '10px',
            flexDirection: 'column',
            gap: '5px',
            minWidth: '44px',
            minHeight: '44px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ display: 'block', width: '24px', height: '2px', background: 'var(--text)', transition: 'transform 0.3s, opacity 0.3s', transformOrigin: 'center', transform: open ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ display: 'block', width: '24px', height: '2px', background: 'var(--text)', transition: 'opacity 0.3s', opacity: open ? 0 : 1 }} />
          <span style={{ display: 'block', width: '24px', height: '2px', background: 'var(--text)', transition: 'transform 0.3s, opacity 0.3s', transformOrigin: 'center', transform: open ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="nav-hamburger"
          style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '1rem 1.5rem 1.5rem', flexDirection: 'column' }}
        >
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {navLinks.map((link) => (
              <li key={link.href} style={{ borderBottom: '1px solid var(--border)' }}>
                <Link
                  href={link.href}
                  style={{
                    display: 'block',
                    padding: '0.875rem 0',
                    color: pathname === link.href ? 'var(--orange)' : 'var(--text)',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-barlow)',
                    fontWeight: 500,
                    fontSize: '1.05rem',
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li style={{ paddingTop: '1rem' }}>
              <Link
                href="/tilauslomake"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: 'var(--orange)',
                  color: '#fff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-barlow-condensed)',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  letterSpacing: '0.05em',
                  textDecoration: 'none',
                  minHeight: '44px',
                }}
              >
                Tilaa kuljetus
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
