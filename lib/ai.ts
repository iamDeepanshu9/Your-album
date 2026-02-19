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

export async function getFaceDescriptor(imageElement: HTMLImageElement): Promise<Float32Array | undefined> {
    const detection = await faceapi.detectSingleFace(imageElement)
        .withFaceLandmarks()
        .withFaceDescriptor();

    return detection?.descriptor;
}

// Function to process a single image URL and return its descriptor
// This handles loading the image in memory
export async function processImage(url: string): Promise<Float32Array | undefined> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        img.onload = async () => {
            try {
                const descriptor = await getFaceDescriptor(img);
                resolve(descriptor);
            } catch (e) {
                console.error("Error processing image", url, e);
                resolve(undefined);
            }
        };
        img.onerror = (e) => {
            console.error("Error loading image", url, e);
            resolve(undefined);
        };
    });
}
