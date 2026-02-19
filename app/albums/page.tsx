import AlbumGrid from '@/components/AlbumGrid';
import { getAlbums } from '@/lib/albums-db';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function AlbumsPage() {
    const albums = await getAlbums();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Client Albums</h1>
                <p className={styles.subtitle}>Select an album to view photos and access AI features</p>
            </header>
            <AlbumGrid albums={albums} />
        </div>
    );
}
