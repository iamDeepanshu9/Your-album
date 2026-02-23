
import fs from 'fs';

async function inspect(url: string) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const regex = /AF_initDataCallback\s*\(\s*({[^<]+})\s*\);/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            const jsonLike = match[1];
            if (jsonLike.includes('ds:1')) {
                const data = parseDataFromCallback(jsonLike);
                if (data && Array.isArray(data) && Array.isArray(data[1])) {
                    console.log(`Found ${data[1].length} items.`);
                    fs.writeFileSync('scripts/dump.json', JSON.stringify(data[1], null, 2));
                    console.log('Dumped to scripts/dump.json');
                }
            }
        }
    } catch (e) { console.error(e); }
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

inspect('https://photos.app.goo.gl/2gRwdcptGekZLu3Q7');
