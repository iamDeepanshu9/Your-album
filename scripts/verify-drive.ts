
import { extractPhotosFromDrive } from '../lib/google-drive.js';

async function verify() {
    const url = 'https://drive.google.com/drive/folders/1PH_M2f1fsJRyTWFc-i1sCBHWOjVmbNxx?usp=sharing';
    const photos = await extractPhotosFromDrive(url);
    console.log(`Verified ${photos.length} photos extracted.`);
    if (photos.length > 0) {
        console.log('First 2 photos:');
        console.log(photos.slice(0, 2));
    } else {
        console.log('Test failed: No photos returned.');
    }
}

verify();
