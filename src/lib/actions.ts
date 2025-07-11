
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const AUTH_COOKIE_NAME = 'auth_token';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function login(prevState: { error: string } | null, formData: FormData) {
  const username = formData.get('username');
  const password = formData.get('password');

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error('ADMIN_USERNAME or ADMIN_PASSWORD environment variables are not set.');
    return { error: 'Il server non è configurato correttamente per l\'autenticazione.' };
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const cookieStore = cookies();
    cookieStore.set(AUTH_COOKIE_NAME, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    return redirect('/admin');
  } else {
    return { error: 'Username o password non validi.' };
  }
}

export async function logout() {
  const cookieStore = cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  redirect('/admin/login');
}
