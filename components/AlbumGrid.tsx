import Link from 'next/link';
import styles from './AlbumGrid.module.css';
import Image from 'next/image';

interface Album {
    id: string;
    title: string;
    coverImage: string;
    date: string;
    type?: string;
    photos?: { url: string }[]; // Optional in case not populated
}

interface AlbumGridProps {
    albums: Album[];
}

export default function AlbumGrid({ albums }: AlbumGridProps) {
    return (
        <div className={styles.grid}>
            {albums.map((album) => (
                <Link key={album.id} href={`/albums/${album.id}`} className={styles.card}>
                    <div className={styles.imageWrapper}>
                        <Image
                            src={album.coverImage || album.photos?.[0]?.url || `https://picsum.photos/seed/${album.id}/800/600`}
                            alt={album.title}
                            fill
                            className={styles.image}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className={styles.tag}>{album.type || 'Album'}</div>
                    </div>
                    <div className={styles.overlay}>
                        <div className={styles.content}>
                            <h3 className={styles.title}>{album.title}</h3>
                            <p className={styles.date}>{album.date}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
