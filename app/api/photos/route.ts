import { NextRequest, NextResponse } from 'next/server';
import { getPhotos, refreshAccessToken } from '@/lib/google-photos';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    // In a real app, you would:
    // 1. Get the user's session
    // 2. Retrieve their stored refresh token from DB
    // 3. Refresh the access token
    // 4. Fetch photos

    // For this demo, we'll check for environment variables.
    // If not present, we return mock data or error.

    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!refreshToken) {
        return NextResponse.json(
            { error: 'Google Photos integration not configured' },
            { status: 503 }
        );
    }

    try {
        const { access_token } = await refreshAccessToken(refreshToken);
        if (!access_token) throw new Error('Failed to refresh token');

        const photosData = await getPhotos(access_token);

        // Transform Google Photos response to our app's Photo interface
        const photos = photosData.mediaItems?.map((item: any) => ({
            id: item.id,
            url: `${item.baseUrl}=w1200-h1200`, // Request specific size
            width: parseInt(item.mediaMetadata.width),
            height: parseInt(item.mediaMetadata.height),
        })) || [];

        return NextResponse.json({ photos });
    } catch (error: any) {
        console.error('Google Photos API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch photos' },
            { status: 500 }
        );
    }
}
