import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/photoslibrary.readonly'];

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000/api/auth/callback'
);

export const getAuthUrl = () => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
};

export const setCredentials = async (code: string) => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
};

export const refreshAccessToken = async (refreshToken: string) => {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
};

export const getPhotos = async (accessToken: string, albumId?: string) => {
    // Note: The official googleapis library doesn't strictly support Photos Library API v1 directly 
    // in the same way as others, sometimes raw requests are needed or specific libraries.
    // For simplicity/demo we'll use raw fetch with the token, which is often standard for Photos API.

    const url = albumId
        ? 'https://photoslibrary.googleapis.com/v1/mediaItems:search'
        : 'https://photoslibrary.googleapis.com/v1/mediaItems';

    const body = albumId ? JSON.stringify({ albumId, pageSize: 50 }) : undefined;
    const method = albumId ? 'POST' : 'GET';

    const response = await fetch(url, {
        method,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body,
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch photos: ${response.statusText}`);
    }

    return response.json();
};
