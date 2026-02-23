
import fs from 'fs';

const scriptContent = fs.readFileSync('scripts/debug_drive_largest_script.js', 'utf-8');

const regex = /window\['_DRIVE_ivd'\]\s*=\s*'([^']+)';/;
const match = regex.exec(scriptContent);

if (match) {
    const rawString = match[1];

    try {
        // Use eval to evaluate the JS string literal which resolves \x and \u escapes
        const jsonString = eval("'" + rawString + "'");
        const data = JSON.parse(jsonString);
        console.log('Successfully parsed _DRIVE_ivd');

        let fileCount = 0;
        if (Array.isArray(data) && Array.isArray(data[0])) {
            const files = data[0];
            console.log(`Found ${files.length} items`);

            files.slice(0, 5).forEach((file: any, index: number) => {
                const fileId = file[0];
                const name = file[2];
                const mimeType = file[3];
                console.log(`File ${index}: ID=${fileId}, Name=${name}, Mime=${mimeType}`);

                // Construct a direct thumbnail URL which usually doesn't require auth
                // if the folder is publicly shared.
                const directUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w4000-h4000`;
                console.log(`  Preview URL: ${directUrl}`);
            });
            fileCount = files.length;
        }

    } catch (e) {
        console.error('Failed to parse JSON:', e);
    }
} else {
    console.log('Could not find _DRIVE_ivd assignment');
}
