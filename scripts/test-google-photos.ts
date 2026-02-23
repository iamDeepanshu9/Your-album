
import fs from 'fs';

let content = fs.readFileSync('temp_google_photos.html', 'utf-8');

// Pattern to find `AF_initDataCallback` calls
// It looks like: AF_initDataCallback({key: 'ds:1', hash: '...', data: [...] ...
// We want to extract the `data` part.

const regex = /AF_initDataCallback\s*\(\s*({[^<]+})\s*\);/g;

let match;
while ((match = regex.exec(content)) !== null) {
    const jsonLike = match[1];

    // The 'data' field is what we want.
    // It's usually `data: [...]`
    // But since it's inside a function call, let's try to parse the `data` property.
    // The content inside `AF_initDataCallback` is valid JS object literal, but not strict JSON.
    // We can use `new Function` or regex to extract `data`.
    // Or just look for `data:` and try to find the balancing brackets.

    // Let's print the key first to see which one it is.
    const keyMatch = jsonLike.match(/key:\s*'([^']+)'/);
    const key = keyMatch ? keyMatch[1] : 'unknown';
    console.log('Found callback with key:', key);

    if (key === 'ds:1') {
        try {
            // This block contains the main data.
            // Extract the array from `data:`.
            // It starts after `data:`
            const dataIndex = jsonLike.indexOf('data:');
            if (dataIndex !== -1) {
                const start = dataIndex + 5; // length of 'data:'
                let bracketCount = 0;
                let end = -1;

                for (let i = start; i < jsonLike.length; i++) {
                    if (jsonLike[i] === '[') bracketCount++;
                    else if (jsonLike[i] === ']') bracketCount--;

                    if (bracketCount === 0 && i > start) {
                        end = i + 1;
                        break;
                    }
                }

                if (end !== -1) {
                    const dataString = jsonLike.substring(start, end);
                    const data = JSON.parse(dataString);

                    // Now traverse data to find photos.
                    // The structure varies, but usually it's nested arrays.
                    // Often data[1] is the array of photos.

                    // Let's inspect data[1]
                    const photos = data[1];
                    console.log('Number of items in potential photo array:', photos?.length);

                    if (Array.isArray(photos)) {
                        photos.forEach((item, index) => {
                            // item[0] is usually ID
                            // item[1] contains URL
                            // item[2] width
                            // item[3] height
                            const url = item[1]?.[0];
                            const width = item[1]?.[1];
                            const height = item[1]?.[2];

                            if (url && width && height) {
                                console.log(`Photo ${index}: ${url} (${width}x${height})`);
                            }
                        });
                    }
                }
            }

        } catch (e) {
            console.error('Error parsing data:', e);
        }
    }
}
