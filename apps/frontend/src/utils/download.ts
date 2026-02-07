'use client';

import { API_URL, API_ROUTES } from '@/config/api-routes';
import { getToken } from '@/utils/cookies';
import { fetchApi } from '@/utils/api-client';
import type { UserImportResult } from '@/types/user.type';

export async function downloadExport(
  endpoint: string,
  filename: string,
): Promise<void> {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    let message = 'Download failed';
    try {
      const data = JSON.parse(text);
      message = data.message || message;
    } catch {
      message = text || message;
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function uploadImport(file: File): Promise<UserImportResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !['csv', 'xlsx'].includes(extension)) {
    throw new Error('Only CSV and Excel files are allowed');
  }

  const { signedUrl, path } = await fetchApi<{
    signedUrl: string;
    path: string;
  }>(API_ROUTES.STORAGE.UPLOAD_URL({ extension, type: 'document' }));

  const contentType =
    extension === 'csv'
      ? 'text/csv'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  const uploadRes = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error('Failed to upload file');
  }

  return fetchApi<UserImportResult>(API_ROUTES.USERS.IMPORT, {
    method: 'POST',
    body: JSON.stringify({ path }),
  });
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
};

export async function uploadImage(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !IMAGE_EXTENSIONS.includes(extension)) {
    throw new Error('Only image files (jpg, png, gif, webp) are allowed');
  }

  const { signedUrl, path } = await fetchApi<{
    signedUrl: string;
    path: string;
  }>(API_ROUTES.STORAGE.UPLOAD_URL({ extension, type: 'image' }));

  const contentType = MIME_TYPES[extension];

  const uploadRes = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error('Failed to upload image');
  }

  return path;
}
