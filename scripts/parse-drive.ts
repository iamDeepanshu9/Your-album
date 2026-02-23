
import fs from 'fs';

function parseDataFromCallback(jsonLike: string): any {
    const dataIndex = jsonLike.indexOf('data:');
    if (dataIndex === -1) return null;
    const start = dataIndex + 5;
    let bracketCount = 0;
    for (let i = start; i < jsonLike.length; i++) {
        if (jsonLike[i] === '[') bracketCount++;
        else if (jsonLike[i] === ']') bracketCount--;
        if (bracketCount === 0 && i > start) {
            try {
                return JSON.parse(jsonLike.substring(start, i + 1));
            } catch (e) {
                return null;
            }
        }
    }
    return null;
}

function findUrls(obj: any, results: string[] = []): string[] {
    if (typeof obj === 'string') {
        if (obj.startsWith('https://') && (obj.includes('googleusercontent') || obj.includes('drive.google'))) {
            results.push(obj);
        }
    } else if (Array.isArray(obj)) {
        for (const item of obj) {
            findUrls(item, results);
        }
    } else if (obj !== null && typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
            findUrls(obj[key], results);
        }
    }
    return results;
}

const html = fs.readFileSync('scripts/debug_drive.html', 'utf-8');
const regex = /AF_initDataCallback\s*\(\s*({[^<]+})\s*\);/g;
let match;
let i = 0;

while ((match = regex.exec(html)) !== null) {
    const jsonLike = match[1];
    const data = parseDataFromCallback(jsonLike);
    if (data) {
        console.log(`\nCallback ${i}:`);
        const urls = findUrls(data);
        const uniqueUrls = [...new Set(urls)];
        console.log(`Found ${uniqueUrls.length} potential URLs`);
        if (uniqueUrls.length > 0 && uniqueUrls.length < 50) {
            console.log(uniqueUrls.slice(0, 5));
        } else if (uniqueUrls.length >= 50) {
            console.log('Many URLs found! First 5:');
            console.log(uniqueUrls.slice(0, 5));

            // It might be the main data block. Let's dump some structured data to understand it.
            fs.writeFileSync('scripts/debug_drive_data.json', JSON.stringify(data, null, 2));
            console.log('Dumped this callback data to debug_drive_data.json');
        }
    }
    i++;
}
