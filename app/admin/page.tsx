import { getAlbums } from '@/lib/albums-db';
import { createAlbum, removeAlbum } from '@/app/actions/albums';
import { logout } from '@/app/actions/auth';
import Link from 'next/link';
import Image from 'next/image';
import styles from './admin.module.css';

export default async function AdminDashboard() {
    const albums = await getAlbums();

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Dashboard</h1>
                    <div className={styles.actions}>
                        <Link href="/" className={`${styles.btn} ${styles.btnSecondary}`}>
                            View Site
                        </Link>
                        <form action={logout}>
                            <button className={`${styles.btn} ${styles.btnDestructive}`}>
                                Logout
                            </button>
                        </form>
                    </div>
                </div>

                <div className={styles.grid}>
                    {/* Create New Album */}
                    <div className={styles.card}>
                        <h2 className={styles.sectionTitle}>Create New Album</h2>
                        <form action={createAlbum} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Album Title</label>
                                <input name="title" required className={styles.input} placeholder="e.g. Sarah & James Wedding" />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Date</label>
                                    <input name="date" required className={styles.input} placeholder="Month DD, YYYY" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Location</label>
                                    <input name="location" required className={styles.input} placeholder="City, State" />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Cover Image URL</label>
                                <input name="coverImage" placeholder="https://..." className={styles.input} />
                                <p className={styles.helperText}>Use Unsplash or direct image links for now.</p>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Type</label>
                                <select name="type" className={styles.select}>
                                    <option value="wedding">Wedding</option>
                                    <option value="event">Event</option>
                                    <option value="portrait">Portrait</option>
                                    <option value="fashion">Fashion</option>
                                </select>
                            </div>

                            <div className={styles.sectionDivider}>
                                <h3 className={styles.subTitle}>Security & Integration</h3>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Access Code</label>
                                    <input name="accessCode" placeholder="Optional password" className={styles.input} />
                                </div>
                                <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                                    <label className={styles.label}>Google Photos or Drive Link</label>
                                    <input name="googlePhotosLink" placeholder="https://photos.app.goo.gl/... or https://drive.google.com/..." className={styles.input} />
                                </div>
                            </div>

                            <button type="submit" className={styles.createBtn}>
                                Create Album
                            </button>
                        </form>
                    </div>

                    {/* Existing Albums List */}
                    <div className={styles.albumListContainer}>
                        <h2 className={styles.sectionTitle}>Existing Albums ({albums.length})</h2>
                        <div className={styles.albumList}>
                            {albums.map((album) => (
                                <div key={album.id} className={styles.albumItem}>
                                    <div className={styles.albumThumb}>
                                        <Image
                                            src={album.coverImage || album.photos?.[0]?.url || `https://picsum.photos/seed/${album.id}/800/600`}
                                            alt={album.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className={styles.albumInfo}>
                                        <h3 className={styles.albumTitle}>{album.title}</h3>
                                        <div className={styles.albumMeta}>
                                            <span>{album.date}</span>
                                            <span>•</span>
                                            <span>{album.location}</span>
                                        </div>
                                        <div className={styles.badges}>
                                            {album.accessCode && <span className={`${styles.badge} ${styles.badgeLocked}`}>Locked</span>}
                                            {album.googlePhotosLink && <span className={styles.badge}>Linked</span>}
                                        </div>
                                    </div>
                                    <div className={styles.albumActions}>
                                        <Link href={`/albums/${album.id}`} className={`${styles.actionBtn} ${styles.viewBtn}`}>
                                            View
                                        </Link>
                                        <form action={removeAlbum}>
                                            <input type="hidden" name="id" value={album.id} />
                                            <button className={`${styles.actionBtn} ${styles.deleteBtn}`}>
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                            {albums.length === 0 && (
                                <p className={styles.emptyState}>No albums found. Use the form to create your first album.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
