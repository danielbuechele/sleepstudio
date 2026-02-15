import { useEffect, useRef, type RefObject } from 'react';

export function useClickOutside(
  isOpen: boolean,
  onClose: () => void,
  ...refs: RefObject<HTMLElement | null>[]
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (refs.every(ref => !ref.current?.contains(target))) {
        onCloseRef.current();
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [isOpen, ...refs]); // eslint-disable-line react-hooks/exhaustive-deps
}
