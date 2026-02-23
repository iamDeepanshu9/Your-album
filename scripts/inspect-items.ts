
import fs from 'fs';

async function inspect(url: string) {
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
                    console.log(`Found ${data[1].length} items.`);

                    data[1].forEach((item: any, i: number) => {
                        // Check for video indicators
                        // Often item[9] is a dictionary with media info
                        // item[1] is [url, w, h]

                        const isVideo = JSON.stringify(item).includes('video') ||
                            (item[15] && item[15]['76647426']); // 76647426 is a known video signature key in some versions

                        // Collect potentially interesting fields
                        const typeField = item.length > 6 ? item[6] : 'N/A';
                        // item[9] sometimes exists

                        if (isVideo || i < 5) {
                            console.log(`Item ${i} [Type: ${typeField}] IsVideo: ${isVideo}`);
                            // console.log(JSON.stringify(item).substring(0, 200));
                        }

                        const width = item[1][1];
                        const height = item[1][2];

                        // Another heuristic: video items often have a nested array with video types/url at specific index
                        // item[9] is often { '76647426': [ ... ] } for videos
                    });
                }
            }
        }
    } catch (e) {
        console.error(e);
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

const url = 'https://photos.app.goo.gl/2gRwdcptGekZLu3Q7';
inspect(url);
