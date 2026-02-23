import * as faceapi from 'face-api.js';

// We need to disable the env check for nodejs variables since we are running in browser
// face-api.js sometimes complains about this
if (typeof window !== 'undefined') {
    (faceapi as any).env.monkeyPatch({
        Canvas: HTMLCanvasElement,
        Image: HTMLImageElement,
        ImageData: ImageData,
        Video: HTMLVideoElement,
        createCanvasElement: () => document.createElement('canvas'),
        createImageElement: () => document.createElement('img')
    });
}

export async function loadModels() {
    try {
        const MODEL_URL = '/models';
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        console.log('Models loaded');
        return true;
    } catch (error) {
        console.error('Error loading models:', error);
        return false;
    }
}

export async function getFaceDescriptors(imageElement: HTMLImageElement): Promise<Float32Array[]> {
    const detections = await faceapi.detectAllFaces(imageElement)
        .withFaceLandmarks()
        .withFaceDescriptors();

    return detections.map(d => d.descriptor);
}

// Function to process a single image URL and return its descriptors
// This handles loading the image in memory
export async function processImage(url: string): Promise<Float32Array[]> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        // Use proxy to avoid CORS issues with Google Photos
        img.src = `/api/proxy-image?url=${encodeURIComponent(url)}`;
        img.onload = async () => {
            try {
                const descriptors = await getFaceDescriptors(img);
                resolve(descriptors);
            } catch (e) {
                console.error("Error processing image", url, e);
                resolve([]);
            }
        };
        img.onerror = (e) => {
            console.error("Error loading image", url, e);
            resolve([]);
        };
    });
}
