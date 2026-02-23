
import { extractPhotosFromAlbum } from '../lib/google-photos.js'; // Try with .js or .ts depending on config, but usually in ts-node context it might need full path or config. 
// Actually simplest is to use relative path with .ts if allowed or just rely on resolution.
// Let's try to just copy the function here for verification if imports fail, but better to fix imports.
// Let's try dynamic import?

async function run() {
    const { extractPhotosFromAlbum } = await import('../lib/google-photos');
    const url = 'https://photos.app.goo.gl/2gRwdcptGekZLu3Q7';

    console.log('Testing extractPhotosFromAlbum...');
    const photos = await extractPhotosFromAlbum(url);
    console.log(`Found ${photos.length} photos.`);
    if (photos.length > 0) {
        console.log('Sample:', photos[0]);
    } else {
        console.error('No photos found!');
        process.exit(1);
    }
}

run().catch(console.error);
