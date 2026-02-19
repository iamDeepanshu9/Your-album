'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './AlbumView.module.css';
import Lightbox from './Lightbox';

// We need to infer the return type of getAlbum, but since it's a mock, we can define the interface here matching data.ts
interface Photo {
    id: string;
    url: string;
    width: number;
    height: number;
}

interface AlbumData {
    id: string;
    title: string;
    coverImage: string;
    date: string;
    location: string;
    photos: Photo[];
}

interface AlbumViewProps {
    album: AlbumData;
}

export default function AlbumView({ album }: AlbumViewProps) {
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [isFiltered, setIsFiltered] = useState(false);
    const [photos, setPhotos] = useState(album.photos);

    // AI State
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [showUploadModal, setShowUploadModal] = useState(false);

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
            setPhotos(album.photos);
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
            const img = document.createElement('img');
            img.src = imageUrl;
            await new Promise(r => img.onload = r);

            const userDescriptor = await ai.getFaceDescriptor(img);

            if (!userDescriptor) {
                alert('No face detected in your photo. Please try another one.');
                setIsProcessing(false);
                return;
            }

            // 2. Match against album photos
            const faceMatcher = new (await import('face-api.js')).FaceMatcher(userDescriptor, 0.6);
            const matchedPhotos: Photo[] = [];

            // Process in chunks or one by one
            const total = album.photos.length;

            // Limit for demo purposes if too many. In a real app this would happen on backend.
            // We act on the first 20 or all if less.
            const photosToProcess = album.photos;

            for (let i = 0; i < photosToProcess.length; i++) {
                const photo = photosToProcess[i];
                // In a real app we would have pre-computed descriptors. 
                // Here we compute on fly which is slow but demonstrates the tech.

                const descriptor = await ai.processImage(photo.url);

                if (descriptor) {
                    const match = faceMatcher.findBestMatch(descriptor);
                    if (match.label !== 'unknown') {
                        matchedPhotos.push(photo);
                    }
                }

                setProcessingProgress(Math.floor(((i + 1) / total) * 100));
            }

            if (matchedPhotos.length > 0) {
                setPhotos(matchedPhotos);
                setIsFiltered(true);
            } else {
                alert('No matching photos found in this album.');
                setPhotos(album.photos); // Reset
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
                <div className={styles.modalOverlay} onClick={() => setShowUploadModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setShowUploadModal(false)}>&times;</button>

                        <h2 className={styles.modalTitle}>Find My Photos 📸</h2>
                        <p className={styles.modalText}>
                            Upload a clear selfie, and our AI will magically find every photo of you in this album.
                        </p>

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
                </div>
            )}

            <div className={styles.hero}>
                <div className={styles.heroBg}>
                    <Image
                        src={album.coverImage}
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
