import { useState, useCallback } from 'react';

// This custom hook manages the last viewed photo in the gallery
// It saves the ID in sessionStorage so it persists between page views
export function useLastViewedPhoto() {
  const [lastViewedPhoto, setLastViewedPhotoState] = useState<number | null>(() => {
    // Initialize from sessionStorage when hook is first used
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('last-viewed-photo');
      if (saved) {
        return parseInt(saved, 10);
      }
    }
    return null;
  });

  // Update both state and sessionStorage when setting a new value
  const setLastViewedPhoto = useCallback((photoId: number | null) => {
    setLastViewedPhotoState(photoId);
    
    if (typeof window !== 'undefined') {
      if (photoId === null) {
        sessionStorage.removeItem('last-viewed-photo');
      } else {
        sessionStorage.setItem('last-viewed-photo', photoId.toString());
      }
    }
  }, []);

  return [lastViewedPhoto, setLastViewedPhoto] as const;
}
