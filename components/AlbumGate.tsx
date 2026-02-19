'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AlbumGate.module.css';

interface AlbumGateProps {
    accessCode?: string;
    children: React.ReactNode;
}

export default function AlbumGate({ accessCode, children }: AlbumGateProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(!accessCode);
    const [inputCode, setInputCode] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputCode === accessCode) {
            setIsAuthenticated(true);
            setError(false);
        } else {
            setError(true);
        }
    };

    if (isAuthenticated) {
        return <>{children}</>;
    }


    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <span className={styles.icon}>🔒</span>
                <h2 className={styles.title}>Private Album</h2>
                <p className={styles.description}>Please enter the access code to view this album.</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="password"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder="ENTER CODE"
                        className={styles.input}
                        autoFocus
                    />
                    {error && <p className={styles.error}>Incorrect code. Please try again.</p>}
                    <button
                        type="submit"
                        className={styles.submitBtn}
                    >
                        Unlock Album
                    </button>
                </form>
            </div>
        </div>
    );
}
