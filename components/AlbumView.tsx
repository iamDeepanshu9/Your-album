'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './AlbumView.module.css';
import Lightbox from './Lightbox';
import { Album, Photo } from '@/lib/albums-db';

interface AlbumViewProps {
    album: Album;
}

export default function AlbumView({ album }: AlbumViewProps) {
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [isFiltered, setIsFiltered] = useState(false);
    const [photos, setPhotos] = useState<Photo[]>(album.photos || []);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // AI State
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [detectedFaceUrl, setDetectedFaceUrl] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);

    const startCamera = async () => {
        setShowCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please allow permissions or use file upload.");
            setShowCamera(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            streamRef.current = null;
        }
        setShowCamera(false);
    };

    const captureSelfie = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
                        handleFileUpload({ target: { files: [file] } } as any);
                    }
                }, 'image/jpeg');
            }
            stopCamera();
        }
    };

    // Load models on mount
    useEffect(() => {
        import('@/lib/ai').then(async (ai) => {
            await ai.loadModels();
        });
    }, []);

    const handlePhotoClick = (index: number) => {
        setSelectedPhotoIndex(index);
    };

    const closeLightbox = () => {
        setSelectedPhotoIndex(null);
    };

    const nextPhoto = () => {
        if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
            setSelectedPhotoIndex(selectedPhotoIndex + 1);
        }
    };

    const prevPhoto = () => {
        if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
            setSelectedPhotoIndex(selectedPhotoIndex - 1);
        }
    };

    const toggleFilter = () => {
        if (isFiltered) {
            setIsFiltered(false);
            setPhotos(album.photos || []);
            setDetectedFaceUrl(null);
        } else {
            setShowUploadModal(true);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setShowUploadModal(false);
        setProcessingProgress(0);

        try {
            const ai = await import('@/lib/ai');

            // 1. Get descriptor for uploaded file
            const imageUrl = URL.createObjectURL(file);
            setDetectedFaceUrl(imageUrl);
            const img = document.createElement('img');
            img.src = imageUrl;
            await new Promise(r => img.onload = r);

            const userDescriptors = await ai.getFaceDescriptors(img);

            if (!userDescriptors || userDescriptors.length === 0) {
                alert('No face detected in your photo. Please try another one.');
                setIsProcessing(false);
                setDetectedFaceUrl(null);
                return;
            }

            const userDescriptor = userDescriptors[0];

            // 2. Match against album photos
            const faceMatcher = new (await import('face-api.js')).FaceMatcher(userDescriptor, 0.6);
            const matchedPhotos: Photo[] = [];

            const photosToProcess = album.photos || [];
            const total = photosToProcess.length;

            const CHUNK_SIZE = 5;
            let processed = 0;

            for (let i = 0; i < photosToProcess.length; i += CHUNK_SIZE) {
                const chunk = photosToProcess.slice(i, i + CHUNK_SIZE);

                const results = await Promise.all(
                    chunk.map(async (photo) => {
                        const descriptors = await ai.processImage(photo.url);

                        let isMatch = false;
                        if (descriptors && descriptors.length > 0) {
                            for (const d of descriptors) {
                                const match = faceMatcher.findBestMatch(d);
                                if (match.label !== 'unknown') {
                                    isMatch = true;
                                    break;
                                }
                            }
                        }
                        return { photo, isMatch };
                    })
                );

                results.forEach(({ photo, isMatch }) => {
                    if (isMatch) {
                        matchedPhotos.push(photo);
                    }
                });

                processed += chunk.length;
                setProcessingProgress(Math.floor((processed / total) * 100));
            }

            if (matchedPhotos.length > 0) {
                setPhotos(matchedPhotos);
                setIsFiltered(true);
            } else {
                alert('No matching photos found in this album.');
                setPhotos(album.photos || []); // Reset
                setDetectedFaceUrl(null);
            }

        } catch (error) {
            console.error("AI functionality error", error);
            alert('Something went wrong with the AI processing.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={styles.container}>
            {isProcessing && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.scanningContainer}>
                            <div className={styles.scanIcon}>
                                <span style={{ fontSize: '40px' }}>👤</span>
                            </div>
                            <div className={styles.scanLine} />
                        </div>
                        <h3 className={styles.modalTitle}>Analyzing Photos...</h3>
                        <p className={styles.modalText}>Scanning album for your face matches. This happens securely on your device.</p>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${processingProgress}%` }} />
                        </div>
                        <p className={styles.progressText}>{processingProgress}% Complete</p>
                    </div>
                </div>
            )}

            {showUploadModal && (
                <div className={styles.modalOverlay} onClick={() => {
                    setShowUploadModal(false);
                    stopCamera();
                }}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => {
                            setShowUploadModal(false);
                            stopCamera();
                        }}>&times;</button>

                        <h2 className={styles.modalTitle}>Find My Photos 📸</h2>
                        <p className={styles.modalText}>
                            Take a selfie or upload a clear photo, and our AI will magically find every photo of you in this album.
                        </p>

                        {!showCamera ? (
                            <div className={styles.uploadOptions}>
                                <button className={styles.cameraBtn} onClick={startCamera}>
                                    <span className={styles.iconLarge}>📷</span>
                                    <div className={styles.uploadText}>Take Selfie</div>
                                </button>
                                <div className={styles.orText}>- OR -</div>
                                <label className={styles.uploadLabel}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className={styles.hiddenInput}
                                        style={{ display: 'none' }}
                                    />
                                    <span className={styles.iconLarge}>📤</span>
                                    <div className={styles.uploadText}>Click to Upload Selfie</div>
                                    <div className={styles.uploadSubtext}>JPG or PNG</div>
                                </label>
                            </div>
                        ) : (
                            <div className={styles.cameraContainer}>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={styles.videoPreview}
                                />
                                <div className={styles.cameraActions}>
                                    <button className={styles.captureBtn} onClick={captureSelfie}>Capture</button>
                                    <button className={styles.cancelCameraBtn} onClick={stopCamera}>Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={styles.hero}>
                <div className={styles.heroBg}>
                    <Image
                        src={album.coverImage || album.photos?.[0]?.url || `https://picsum.photos/seed/${album.id}/800/600`}
                        alt={album.title}
                        fill
                        className={styles.heroImage}
                        priority
                    />
                </div>

                <div className={styles.heroContent}>
                    <div>
                        <h1 className={styles.title}>{album.title}</h1>
                        <div className={styles.meta}>
                            <span>{album.date}</span>
                            <span>•</span>
                            <span>{album.location}</span>
                            <span>•</span>
                            <span>{photos.length} Photos</span>
                        </div>
                    </div>

                    <div className={styles.filterSection}>
                        {isFiltered && detectedFaceUrl && (
                            <div className={styles.detectedFaceThumb}>
                                <Image
                                    src={detectedFaceUrl}
                                    alt="Detected face"
                                    width={40}
                                    height={40}
                                    className={styles.thumbImage}
                                />
                            </div>
                        )}
                        <button className={styles.filterBtn} onClick={toggleFilter}>
                            {isFiltered ? (
                                <>
                                    <span>✖</span> Reset Filter
                                </>
                            ) : (
                                <>
                                    <span>✨</span> Find My Photos
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.photoGrid}>
                    {photos.map((photo, index) => (
                        <div
                            key={photo.id}
                            className={styles.photoCard}
                            onClick={() => handlePhotoClick(index)}
                        >
                            <Image
                                src={photo.url}
                                alt={`Photo ${index + 1}`}
                                fill
                                className={styles.photoImg}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {selectedPhotoIndex !== null && (
                <Lightbox
                    photo={photos[selectedPhotoIndex]}
                    onClose={closeLightbox}
                    onNext={selectedPhotoIndex < photos.length - 1 ? nextPhoto : undefined}
                    onPrev={selectedPhotoIndex > 0 ? prevPhoto : undefined}
                />
            )}
        </div>
    );
}
