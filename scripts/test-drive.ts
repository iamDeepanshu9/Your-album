
import fs from 'fs';

async function testDrive(url: string) {
    console.log(`Extracting from: ${url}`);
    try {
        const response = await fetch(url, { redirect: 'follow' });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const html = await response.text();

        console.log(`Fetched ${html.length} bytes`);
        fs.writeFileSync('scripts/debug_drive.html', html);
        console.log('Saved to debug_drive.html');

        // Let's see if we can find any image URLs
        const regex = /AF_initDataCallback\s*\(\s*({[^<]+})\s*\);/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            console.log('Found AF_initDataCallback');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

const url = 'https://drive.google.com/drive/folders/1PH_M2f1fsJRyTWFc-i1sCBHWOjVmbNxx?usp=sharing';
testDrive(url);
