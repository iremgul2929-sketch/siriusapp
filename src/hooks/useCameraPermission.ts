import { useEffect, useState } from 'react';
import { Camera } from 'expo-camera';

export function useCameraPermission() {
  const [granted, setGranted] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setGranted(status === 'granted');
    })();
  }, []);

  return granted;
}
