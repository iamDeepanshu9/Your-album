import { supabase, supabaseAdmin } from './supabase';

export interface Photo {
    id: string;
    url: string;
    width: number;
    height: number;
}

export interface Album {
    id: string;
    title: string;
    coverImage: string;
    date: string;
    location: string;
    type: string;
    accessCode?: string;
    googlePhotosLink?: string;
    photos?: Photo[];
}

export const getAlbums = async (): Promise<Album[]> => {
    const { data, error } = await supabase
        .from('albums')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching albums:', error);
        return [];
    }
    return data as Album[];
};

export const getAlbumById = async (id: string): Promise<Album | null> => {
    const { data, error } = await supabase
        .from('albums')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error(`Error fetching album ${id}:`, error);
        return null;
    }
    return data as Album | null;
};

export const saveAlbum = async (album: Album) => {
    const { data, error } = await supabaseAdmin
        .from('albums')
        .upsert(album, { onConflict: 'id' })
        .select()
        .single();

    if (error) {
        console.error('Error saving album:', error);
        throw new Error(error.message);
    }
    return data as Album;
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

    if (album.photos && album.photos.length > 0) {
        return album;
    }

    // Use mock photos if no photos found
    const photos = PHOTO_POOL.map((url, i) => ({
        id: `photo-${id}-${i}`,
        url: `${url}?auto=format&fit=crop&w=800&q=80`,
        width: 800,
        height: 1200,
    }));

    return { ...album, photos };
};

export const deleteAlbum = async (id: string) => {
    const { error } = await supabaseAdmin.from('albums').delete().eq('id', id);
    if (error) {
        console.error(`Error deleting album ${id}:`, error);
        throw new Error(error.message);
    }
};
