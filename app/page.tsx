import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.overlay} />

      <div className={`${styles.content} glass-panel`}>
        <h1 className={styles.title}>
          Capturing Moments,<br />Creating Memories
        </h1>
        <p className={styles.subtitle}>
          Professional photography for weddings, events, and portraits.
        </p>

        <div className={styles.actions}>
          <a href="/albums" className="btn-primary">
            View Client Albums
          </a>
          <button className={styles.btnSecondary}>
            Contact Me
          </button>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, right: -1 }}>
        <Footer />
      </div>
    </main>
  );
}
