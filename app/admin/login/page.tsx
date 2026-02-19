
import styles from './login.module.css';
import { login } from '@/app/actions/auth';

export default function AdminLogin() {
    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <h1 className={styles.title}>Photographer Access</h1>
                <form action={login} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter Admin Password"
                            className={styles.input}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.submitBtn}>
                        Login to Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
}
