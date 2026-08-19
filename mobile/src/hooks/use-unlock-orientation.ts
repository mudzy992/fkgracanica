import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

export function useUnlockOrientation(): void {
  useEffect(() => {
    void ScreenOrientation.unlockAsync();
    return () => {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);
}
