'use client';

import { useState, useEffect } from 'react';

function isEditableElement(el: Element | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable
  );
}

/**
 * Detects whether the mobile on-screen keyboard is likely open
 * (either an editable/contentEditable element is focused on < 1024px
 * or the visualViewport has shrunk significantly).
 */
export function useMobileKeyboardOpen(): boolean {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const update = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
        return;
      }

      const activeEditable = isEditableElement(document.activeElement);
      const vv = window.visualViewport;
      const viewportShrunk = vv ? window.innerHeight - vv.height > 140 : false;

      setIsOpen(activeEditable || viewportShrunk);
    };

    const handleFocusOut = () => {
      // Delay slightly so focus moving between two inputs doesn't flicker
      setTimeout(update, 60);
    };

    document.addEventListener('focusin', update);
    document.addEventListener('focusout', handleFocusOut);
    window.visualViewport?.addEventListener('resize', update);
    window.addEventListener('resize', update);

    update();

    return () => {
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', handleFocusOut);
      window.visualViewport?.removeEventListener('resize', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return isOpen;
}
