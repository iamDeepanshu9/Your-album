import { getAlbumWithPhotos } from '@/lib/albums-db';
import AlbumView from '@/components/AlbumView';
import AlbumGate from '@/components/AlbumGate';
import { notFound } from 'next/navigation';

interface PageProps {
    params: { id: string };
}

export default async function AlbumPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const album = await getAlbumWithPhotos(params.id);

    if (!album) {
        notFound();
    }

    return (
        <AlbumGate accessCode={album.accessCode}>
            <AlbumView album={album} />
        </AlbumGate>
    );
}
