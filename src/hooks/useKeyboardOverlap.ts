import { useEffect, useState, type RefObject } from 'react';
import { Keyboard, Platform, type View } from 'react-native';

/**
 * Acilan klavyenin verilen gorunumun alt kismini kac piksel kapattigini dondurur.
 * Pencere klavyeyle birlikte kuculuyorsa (bazi Android ayarlari) sonuc 0 olur.
 */
export function useKeyboardOverlap(ref: RefObject<View | null>) {
  const [overlap, setOverlap] = useState(0);

  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', (e) => {
      ref.current?.measureInWindow((_x, y, _w, h) => {
        setOverlap(Math.max(0, y + h - e.endCoordinates.screenY));
      });
    });
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () =>
      setOverlap(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, [ref]);

  return overlap;
}
