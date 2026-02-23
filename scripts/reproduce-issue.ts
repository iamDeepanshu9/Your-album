
import fs from 'fs';

async function extractPhotosFromAlbum(url: string) {
    console.log(`Extracting photos from: ${url}`);

    // Try without headers first, like curl
    try {
        const response = await fetch(url, {
            redirect: 'follow'
        });

        console.log(`Response status: ${response.status}`);
        console.log(`Final URL: ${response.url}`);
        const html = await response.text();
        console.log(`Fetched ${html.length} bytes`);

        fs.writeFileSync('debug_fetch.html', html);
        console.log('Saved to debug_fetch.html');

        // ... [rest of parsing logic omitted for brevity, just debugging fetch now]
        // But let's check for the callback just in case
        const regex = /AF_initDataCallback\s*\(\s*({[^<]+})\s*\);/g;
        const match = regex.exec(html);
        if (match) {
            console.log('Found AF_initDataCallback!');
        } else {
            console.log('Did NOT find AF_initDataCallback');
        }

    } catch (error) {
        console.error('Error extracting photos:', error);
    }
}

const url = 'https://photos.app.goo.gl/2gRwdcptGekZLu3Q7';
extractPhotosFromAlbum(url);
