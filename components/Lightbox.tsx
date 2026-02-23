'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from './Lightbox.module.css';

interface Photo {
    id: string;
    url: string;
    width: number;
    height: number;
}

interface LightboxProps {
    photo: Photo;
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
}

export default function Lightbox({ photo, onClose, onNext, onPrev }: LightboxProps) {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight' && onNext) onNext();
        if (e.key === 'ArrowLeft' && onPrev) onPrev();
    }, [onClose, onNext, onPrev]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [handleKeyDown]);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <button className={styles.closeBtn} onClick={onClose}>&times;</button>

            <button className={styles.contactBtn} onClick={(e) => {
                e.stopPropagation();
                window.open(`mailto:deepanshu@example.com?subject=Inquiry about photo ${photo.id}&body=Hi, I am interested in this photo: ${photo.url}`, '_blank');
            }}>
                Contact Me
            </button>

            {onPrev && (
                <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={(e) => {
                    e.stopPropagation();
                    onPrev();
                }}>
                    &#8249;
                </button>
            )}

            <div className={styles.imageContainer} onClick={(e) => e.stopPropagation()}>
                <Image
                    src={photo.url}
                    alt="Full screen photo"
                    fill
                    className={styles.image}
                    sizes="90vw"
                    priority
                />
            </div>

            {onNext && (
                <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                }}>
                    &#8250;
                </button>
            )}
        </div>
    );
}
