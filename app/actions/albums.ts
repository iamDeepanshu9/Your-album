'use server';

import { saveAlbum, deleteAlbum, Album } from '@/lib/albums-db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createAlbum(formData: FormData) {
    const id = formData.get('id') as string || Math.random().toString(36).substring(7);
    const title = formData.get('title') as string;
    const date = formData.get('date') as string;
    const location = formData.get('location') as string;
    const coverImage = formData.get('coverImage') as string;
    const type = formData.get('type') as string;
    const accessCode = formData.get('accessCode') as string;
    const googlePhotosLink = formData.get('googlePhotosLink') as string;

    let photos: any[] = [];
    if (googlePhotosLink) {
        try {
            if (googlePhotosLink.includes('drive.google.com')) {
                const { extractPhotosFromDrive } = await import('@/lib/google-drive');
                photos = await extractPhotosFromDrive(googlePhotosLink);
            } else {
                const { extractPhotosFromAlbum } = await import('@/lib/google-photos');
                photos = await extractPhotosFromAlbum(googlePhotosLink);
            }
        } catch (error) {
            console.error('Failed to extract photos:', error);
            // Continue creating album even if photo extraction fails, maybe add a warning later
        }
    }

    const album: Album = {
        id,
        title,
        date,
        location,
        coverImage: coverImage || (photos.length > 0 ? photos[0].url : 'https://picsum.photos/800/600'),
        type,
        accessCode,
        googlePhotosLink,
        photos
    };

    await saveAlbum(album);
    revalidatePath('/admin');
    revalidatePath('/albums');
    redirect('/admin');
}

export async function removeAlbum(formData: FormData) {
    const id = formData.get('id') as string;
    await deleteAlbum(id);
    revalidatePath('/admin');
    revalidatePath('/albums');
}
