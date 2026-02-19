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
    const googlePhotosAlbumId = formData.get('googlePhotosAlbumId') as string;

    const album: Album = {
        id,
        title,
        date,
        location,
        coverImage: coverImage || 'https://picsum.photos/800/600',
        type,
        accessCode,
        googlePhotosAlbumId
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
