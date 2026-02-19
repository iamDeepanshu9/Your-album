'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    const password = formData.get('password');

    // Simple env-based auth
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === ADMIN_PASSWORD) {
        (await cookies()).set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });
        redirect('/admin');
    } else {
        // For now just redirect back or throw, improving error handling would require useFormState
        return;
    }
}

export async function logout() {
    (await cookies()).delete('admin_session');
    redirect('/');
}
