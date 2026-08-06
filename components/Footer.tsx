import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">
            MP<span className="dot">·</span>Logistiikka
          </span>
          <span className="footer-copy">
            © {new Date().getFullYear()} MP-Logistiikka · Y-tunnus: 3163260-9 · Kuljetukset Suomessa ja EU-alueella
          </span>
        </div>
        <div className="footer-links">
          <a href="tel:+358503547763">050 354 7763</a>
          <a href="mailto:info@mp-logistiikka.fi">info@mp-logistiikka.fi</a>
          <Link href="/sopimusehdot">Sopimusehdot</Link>
        </div>
      </div>
    </footer>
  );
}
