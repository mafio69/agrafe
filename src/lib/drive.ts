import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User } from './firebase';
import { GoogleAuthProvider } from 'firebase/auth';

// Add Google Drive scope
googleProvider.addScope('https://www.googleapis.com/auth/drive');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token might need re-fetching or prompt
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleDriveSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Nie udało się pobrać tokenu dostępu Google Drive');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Błąd logowania do Google Drive:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const googleDriveSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  createdTime?: string;
  size?: string;
}

/**
 * List files from user's Google Drive
 */
export const listDriveFiles = async (searchQuery?: string): Promise<DriveFile[]> => {
  const token = getDriveAccessToken();
  if (!token) throw new Error('Brak aktywnego połączenia z Google Drive. Zaloguj się najpierw.');

  let q = "trashed = false";
  if (searchQuery && searchQuery.trim()) {
    q += ` and name contains '${searchQuery.replace(/'/g, "\\'")}'`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,webViewLink,iconLink,createdTime,size)&pageSize=30&orderBy=createdTime%20desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Nie udało się pobrać plików z Google Drive.');
  }

  const data = await response.json();
  return data.files || [];
};

/**
 * Upload text/doc content to Google Drive
 */
export const uploadTextFileToDrive = async (
  fileName: string,
  content: string,
  mimeType: string = 'text/plain',
  folderId?: string
): Promise<DriveFile> => {
  const token = getDriveAccessToken();
  if (!token) throw new Error('Brak aktywnego połączenia z Google Drive.');

  const metadata: { name: string; mimeType: string; parents?: string[] } = {
    name: fileName,
    mimeType: mimeType
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: mimeType }));

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Nie udało się przesłać pliku do Google Drive.');
  }

  return await res.json();
};

/**
 * Read text file from Google Drive
 */
export const readDriveFileContent = async (fileId: string): Promise<string> => {
  const token = getDriveAccessToken();
  if (!token) throw new Error('Brak aktywnego połączenia z Google Drive.');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error('Nie udało się odczytać zawartości pliku z Google Drive.');
  }

  return await res.text();
};

/**
 * Delete file from Google Drive (with Mandatory User Confirmation in UI caller)
 */
export const deleteDriveFile = async (fileId: string): Promise<void> => {
  const token = getDriveAccessToken();
  if (!token) throw new Error('Brak aktywnego połączenia z Google Drive.');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Nie udało się usunąć pliku z Google Drive.');
  }
};
