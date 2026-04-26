'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

const galleryItems = [
  { src: '/images/paku1.png', alt: 'Kuljetusauto edestä' },
  { src: '/images/paku2.png', alt: 'Kuljetusauto takaa' },
  { src: '/images/paku5.png', alt: 'Kuljetusauto sivulta' },
  { src: '/images/mp1.jpeg', alt: 'Moottoripyörä lastattuna kyytiin' },
  { src: '/images/ford.png', alt: 'Ford Transit kuljetusauto' },
  { src: '/images/ramppi.jpeg', alt: 'Ajorampit lastauksen aikana' },
  { src: '/images/sidonta.jpg', alt: 'Sidontaliinat kiinnitettynä' },
  { src: '/images/tavaratila.jpeg', alt: 'Tavaratila' },
  { src: '/images/teline.jpeg', alt: 'Kuljetusteline' },
  { src: '/images/teline2.jpeg', alt: 'Kuljetusteline 2' },
];

const total = galleryItems.length;

export default function Gallery() {
  const [index, setIndex] = useState(0);
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const update = () => setCols(window.innerWidth >= 768 ? 3 : 1);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  const visibleItems = Array.from({ length: cols }, (_, i) => galleryItems[(index + i) % total]);

  return (
    <section
      id="kuvat"
      style={{ background: 'transparent', padding: '5rem 1.5rem', borderTop: '1px solid var(--border)' }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontFamily: 'var(--font-barlow)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '0.5rem' }}>
            Kuvagalleria
          </p>
          <h2 style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', textTransform: 'uppercase', letterSpacing: '-0.01em', margin: 0 }}>
            Palvelukuvia 
          </h2>
        </div>

        {/* Carousel */}
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: '1rem',
            }}
          >
            {visibleItems.map((item, i) => (
              <div
                key={`${index}-${i}`}
                style={{
                  position: 'relative',
                  aspectRatio: '4/3',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem' }}>
            <button onClick={prev} aria-label="Edellinen" style={btnStyle}>←</button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {galleryItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Kuva ${i + 1}`}
                  style={{
                    width: i === index ? '20px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: i === index ? 'var(--orange)' : 'rgba(255,255,255,0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'width 0.2s, background 0.2s',
                  }}
                />
              ))}
            </div>

            <button onClick={next} aria-label="Seuraava" style={btnStyle}>→</button>
          </div>
        </div>
      </div>
    </section>
  );
}

const btnStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: '4px',
  color: 'var(--text)',
  width: '40px',
  height: '40px',
  cursor: 'pointer',
  fontSize: '1.1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'border-color 0.2s, color 0.2s',
  flexShrink: 0,
};
