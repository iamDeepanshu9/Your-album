
import fs from 'fs';

const html = fs.readFileSync('scripts/debug_drive.html', 'utf-8');

// The folder contains files. Let's see if there are any identifiers or file types mentioned
const matches = html.match(/"([^"]+\.(?:jpg|jpeg|png|mp4|mov|gif))"/gi);

if (matches) {
    const unique = [...new Set(matches)];
    console.log(`Found ${unique.length} potential file names:`);
    console.log(unique.slice(0, 20));
} else {
    console.log('No obvious filenames found in quotes.');
}

// Let's also check for common Drive file metadata structures like "mimeType":"image/jpeg"
const mimeMatches = html.match(/"mimeType":"([^"]+)"/g);
if (mimeMatches) {
    console.log('Found mimeTypes:', [...new Set(mimeMatches)]);
} else {
    // maybe it's represented differently
    console.log('No mimeType properties found directly.');
}

// Drive often passes a big chunk of JSON to a variable like `window._DRIVE_v2_res` or `window['_START_TIME']` or inside script tags.
const scriptTags = html.match(/<script.*?>(.*?)<\/script>/gs);
if (scriptTags) {
    console.log(`Found ${scriptTags.length} script tags.`);
    let maxLen = 0;
    let maxIdx = -1;
    scriptTags.forEach((tag, i) => {
        if (tag.length > maxLen) {
            maxLen = tag.length;
            maxIdx = i;
        }
    });
    console.log(`Largest script tag is ${maxIdx} with length ${maxLen}.`);
    // Dump largest script tag
    if (maxIdx >= 0) {
        fs.writeFileSync('scripts/debug_drive_largest_script.js', scriptTags[maxIdx]);
    }
}
