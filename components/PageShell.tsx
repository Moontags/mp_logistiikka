import Nav from './Nav';
import Footer from './Footer';

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '64px', flex: 1 }}>{children}</main>
      <Footer />
    </>
  );
}
