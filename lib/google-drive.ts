import { GooglePhoto } from './google-photos';

export async function extractPhotosFromDrive(url: string): Promise<GooglePhoto[]> {
    console.log(`Extracting photos from Drive: ${url}`);

    try {
        const response = await fetch(url, { redirect: 'follow' });

        if (!response.ok) {
            throw new Error(`Failed to fetch Drive folder: ${response.status}`);
        }

        const html = await response.text();
        const regex = /window\['_DRIVE_ivd'\]\s*=\s*'([^']+)';/;
        const match = regex.exec(html);

        if (!match) {
            console.log('Could not find _DRIVE_ivd in Drive HTML');
            return [];
        }

        const rawString = match[1];

        // Use eval to evaluate the JS string literal which safely resolves \x and \u escapes
        const jsonString = eval("'" + rawString + "'");
        const data = JSON.parse(jsonString);

        if (Array.isArray(data) && Array.isArray(data[0])) {
            const files = data[0];

            const photos: GooglePhoto[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!Array.isArray(file)) continue;

                const fileId = file[0];
                const mimeType = file[3];

                // Only include images
                if (typeof mimeType === 'string' && mimeType.startsWith('image/')) {
                    // Drive returns various width/height data deeply nested, 
                    // but we can enforce a high-res preview size via the thumbnail endpoint.
                    const width = 4000;
                    const height = Math.floor(width * 0.66); // Approximate aspect ratio if actual not easily parseable

                    const directUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}-h${width}`;

                    photos.push({
                        id: fileId,
                        url: directUrl,
                        width: width,
                        height: height
                    });
                }
            }

            console.log(`Found ${photos.length} photos in Drive folder.`);
            return photos;
        }

        return [];

    } catch (error) {
        console.error('Error extracting photos from Drive:', error);
        return [];
    }
}
