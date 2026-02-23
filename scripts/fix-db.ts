
import fs from 'fs';
import path from 'path';

interface Album {
    id: string;
    title: string;
    coverImage: string;
    date: string;
    location: string;
    type: string;
    accessCode?: string;
    googlePhotosLink?: string;
    photos?: any[];
}

const DB_PATH = path.join(process.cwd(), 'db/albums.json');

async function extractPhotosFromAlbum(url: string) {
    console.log(`Extracting photos from: ${url}`);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const html = await response.text();

        const regex = /AF_initDataCallback\s*\(\s*({[^<]+})\s*\);/g;
        let match;

        while ((match = regex.exec(html)) !== null) {
            const jsonLike = match[1];
            if (jsonLike.includes('ds:1')) {
                const data = parseDataFromCallback(jsonLike);
                if (data && Array.isArray(data) && Array.isArray(data[1])) {
                    const photos = data[1].map((item: any) => {
                        // Video filter
                        if (item[9] && item[9]['76647426']) {
                            return null;
                        }

                        if (item && item[1] && Array.isArray(item[1])) {
                            return {
                                id: item[0],
                                url: item[1][0],
                                width: item[1][1],
                                height: item[1][2]
                            };
                        }
                        return null;
                    }).filter((p: any) => p !== null && p.url);

                    if (photos.length > 0) return photos;
                }
            }
        }
        return [];
    } catch (e) {
        console.error(e);
        return [];
    }
}

function parseDataFromCallback(jsonLike: string): any {
    const dataIndex = jsonLike.indexOf('data:');
    if (dataIndex === -1) return null;
    const start = dataIndex + 5;
    let bracketCount = 0;

    for (let i = start; i < jsonLike.length; i++) {
        if (jsonLike[i] === '[') bracketCount++;
        else if (jsonLike[i] === ']') bracketCount--;
        if (bracketCount === 0 && i > start) return JSON.parse(jsonLike.substring(start, i + 1));
    }
    return null;
}

async function fixAlbums() {
    if (!fs.existsSync(DB_PATH)) {
        console.error('DB file not found');
        return;
    }

    const albums: Album[] = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    let modified = false;

    for (const album of albums) {
        if (album.googlePhotosLink) {
            console.log(`Fixing/Updating album: ${album.id} ...`);
            // Clear existing photos to force re-fetch with new video filter
            album.photos = [];
            const photos = await extractPhotosFromAlbum(album.googlePhotosLink);
            if (photos.length > 0) {
                album.photos = photos;

                // Safe check for photos[0]
                const firstPhoto = photos[0];
                if (firstPhoto && firstPhoto.url) {
                    if (!album.coverImage || album.coverImage.includes('encrypted-tbn0') || album.coverImage.includes('picsum') || album.coverImage.includes('via.placeholder')) {
                        console.log('Updating cover image too...');
                        album.coverImage = firstPhoto.url;
                    }
                }

                modified = true;
                console.log(`Updated album ${album.id} with ${photos.length} photos.`);
            } else {
                console.log(`Failed to fetch photos for album ${album.id}`);
            }
        }
    }

    if (modified) {
        fs.writeFileSync(DB_PATH, JSON.stringify(albums, null, 2), 'utf-8');
        console.log('Database updated successfully.');
    } else {
        console.log('No albums needed fixing.');
    }
}

fixAlbums();
