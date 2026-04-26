export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <span className="footer-logo">
          MP<span className="dot">·</span>Logistiikka
        </span>
        <span className="footer-copy">
          © {new Date().getFullYear()} MP-Logistiikka · Suomi · All rights reserved
        </span>
        <div className="footer-links">
          <a href="tel:+358503547763">050 354 7763</a>
          <a href="mailto:info@mplogistiikka.fi">info@mplogistiikka.fi</a>
        </div>
      </div>
    </footer>
  );
}
