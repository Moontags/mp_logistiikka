import Calculator from '@/components/Calculator';
import styles from './page.module.css';

export default function HinnastoPage() {
  return (
    <div className={styles.scroll}>
      <Calculator />
    </div>
  );
}
