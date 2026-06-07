'use server';

import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_BASE_URL = (process.env.DJANGO_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

// ! Only async function can be exported under SSR components
// export const AUTH_COOKIE_NAME = 'auth_token'; 
const AUTH_COOKIE_NAME = 'auth_token';

function buildRedirectUrl(key: 'notice' | 'error', message: string) {
  const params = new URLSearchParams({ [key]: message });
  return `/?${params.toString()}`;
}

function readFormValue(formData: FormData, fieldName: string) {
  return String(formData.get(fieldName) ?? '').trim();
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  for (const value of Object.values(payload as Record<string, unknown>)) {
    if (typeof value === 'string' && value.trim()) {
      return value;
    }

    if (Array.isArray(value)) {
      const firstMessage = value.find(
        (item): item is string =>
          typeof item === 'string' && item.trim().length > 0
      );

      if (firstMessage) {
        return firstMessage;
      }
    }

    if (value && typeof value === 'object') {
      const nestedMessage = extractErrorMessage(value, '');

      if (nestedMessage) {
        return nestedMessage;
      }
    }
  }

  return fallback;
}

async function postJson(path: string, body: Record<string, string>) {
  return fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
}

async function submitCredentials(formData: FormData) {
  const username = readFormValue(formData, 'username');
  const password = readFormValue(formData, 'password');

  if (!username || !password) {
    redirect(buildRedirectUrl('error', 'Username and password are required.'));
  }

  return { username, password };
}

export async function loginAction(formData: FormData) {
  const credentials = await submitCredentials(formData);
  const response = await postJson('/auth/token/login/', credentials);

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    redirect(buildRedirectUrl('error', extractErrorMessage(payload, 'Unable to log in with those credentials.')));
  }

  const payload = (await response.json()) as { auth_token?: string };

  if (!payload.auth_token) {
    redirect(buildRedirectUrl('error', 'Login succeeded, but no token was returned.'));
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, payload.auth_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(buildRedirectUrl('notice', 'Signed in.'));
}

export async function registerAction(formData: FormData) {
  const credentials = await submitCredentials(formData);
  const response = await postJson('/auth/users/', credentials);

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    redirect(buildRedirectUrl('error', extractErrorMessage(payload, 'Could not create the account.')));
  }

  redirect(buildRedirectUrl('notice', 'Account created. You can sign in now.'));
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    await fetch(`${API_BASE_URL}/auth/token/logout/`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
      },
      cache: 'no-store',
    }).catch(() => null);
  }

  cookieStore.delete(AUTH_COOKIE_NAME);
  redirect(buildRedirectUrl('notice', 'Signed out.'));
}