
export interface GooglePhoto {
    id: string;
    url: string;
    width: number;
    height: number;
}

export async function extractPhotosFromAlbum(url: string): Promise<GooglePhoto[]> {
    console.log(`Extracting photos from: ${url}`);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch album: ${response.status}`);
        }

        const html = await response.text();

        // Find AF_initDataCallback
        const regex = /AF_initDataCallback\s*\(\s*({[^<]+})\s*\);/g;
        let match;

        while ((match = regex.exec(html)) !== null) {
            const jsonLike = match[1];

            // Check for key: 'ds:1' (or similar, sometimes it changes but usually ds:1 is the main one for public albums)
            // We can also check if the data contains the photos array structure.

            // Heuristic: check if data contains a large array with image URLs
            if (jsonLike.includes('ds:1')) {
                try {
                    const data = parseDataFromCallback(jsonLike);
                    if (data && Array.isArray(data)) {
                        // Usually data[1] is the array of photos
                        const photosArray = data[1];
                        if (Array.isArray(photosArray)) {
                            const photos = photosArray.map((item: any, index: number) => {
                                // item[0] = id
                                // item[1][0] = url

                                // Video filter: items with key '76647426' in metadata (index 9) are videos
                                // The dump shows item[9] is an object like { '15': ..., '76647426': [...] }
                                if (item[9] && item[9]['76647426']) {
                                    return null;
                                }

                                if (item && item[1] && Array.isArray(item[1])) {
                                    const url = item[1][0];
                                    const width = item[1][1];
                                    const height = item[1][2];
                                    const id = item[0];

                                    if (url) {
                                        return {
                                            id: id || `photo-${index}`,
                                            url: url,
                                            width: width,
                                            height: height
                                        };
                                    }
                                }
                                return null;
                            }).filter((p: any) => p !== null) as GooglePhoto[];

                            if (photos.length > 0) {
                                console.log(`Found ${photos.length} photos.`);
                                return photos;
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error parsing potential data block', e);
                }
            }
        }

        return [];

    } catch (error) {
        console.error('Error extracting photos:', error);
        return [];
    }
}

function parseDataFromCallback(jsonLike: string): any {
    const dataIndex = jsonLike.indexOf('data:');
    if (dataIndex === -1) return null;

    const start = dataIndex + 5;
    let bracketCount = 0;
    let end = -1;

    // Simple bracket counting to extract the JSON array
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
        return JSON.parse(dataString);
    }
    return null;
}
