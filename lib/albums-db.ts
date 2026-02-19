import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db/albums.json');

export interface Album {
    id: string;
    title: string;
    coverImage: string;
    date: string;
    location: string;
    type: string;
    accessCode?: string;
    googlePhotosAlbumId?: string;
    photos?: any[];
}

// Ensure the db folder exists
const ensureDb = async () => {
    try {
        await fs.access(DB_PATH);
    } catch {
        // If file doesn't exist, create it with empty array
        await fs.writeFile(DB_PATH, '[]', 'utf-8');
    }
};

export const getAlbums = async (): Promise<Album[]> => {
    await ensureDb();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
};

export const getAlbumById = async (id: string): Promise<Album | null> => {
    const albums = await getAlbums();
    return albums.find((album) => album.id === id) || null;
};

export const saveAlbum = async (album: Album) => {
    const albums = await getAlbums();
    const index = albums.findIndex((a) => a.id === album.id);

    if (index >= 0) {
        albums[index] = album;
    } else {
        albums.push(album);
    }

    await fs.writeFile(DB_PATH, JSON.stringify(albums, null, 2), 'utf-8');
    return album;
};

const PHOTO_POOL = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    'https://images.unsplash.com/photo-1513207565459-d6f36b694f41',
    'https://images.unsplash.com/photo-1516483638261-f4dbaf036963',
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18',
    'https://images.unsplash.com/photo-1531545514256-b1400bc00f31',
    'https://images.unsplash.com/photo-1526047932273-341f2a7631f9',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6',
    'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65dcf8',
];

export const getAlbumWithPhotos = async (id: string) => {
    const album = await getAlbumById(id);
    if (!album) return null;

    // Use mock photos if no Google Photos integration yet.
    // In a real scenario, this is where we'd fetch from Google Photos if album.googlePhotosAlbumId exists.
    const photos = PHOTO_POOL.map((url, i) => ({
        id: `photo-${id}-${i}`,
        url: `${url}?auto=format&fit=crop&w=800&q=80`,
        width: 800,
        height: 1200,
    }));

    return { ...album, photos };
};

export const deleteAlbum = async (id: string) => {
    const albums = await getAlbums();
    const newAlbums = albums.filter(a => a.id !== id);
    await fs.writeFile(DB_PATH, JSON.stringify(newAlbums, null, 2), 'utf-8');
};
