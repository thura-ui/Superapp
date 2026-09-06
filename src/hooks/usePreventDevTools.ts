import { useEffect } from 'react';

export function usePreventDevTools() {
  useEffect(() => {
    // ၁။ Context Menu (Right-Click) ပိတ်ခြင်း
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // ၂။ DevTools ShortKeys (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U) များ ပိတ်ခြင်း
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
      }
    };

    // ၃။ DevTools ပွင့်နေပါက debugger ဖြင့် Freeze ဖြစ်အောင် သို့မဟုတ် console ရှင်းထုတ်အောင် တားဆီးခြင်း
    const interval = setInterval(() => {
      (function () {
        const start = performance.now();
        debugger; // DevTools ပွင့်နေပါက ဤနေရာတွင် ခေတ္တရပ်သွားမည်
        const end = performance.now();
        if (end - start > 100) {
          console.clear();
        }
      })();
    }, 1000);

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, []);
}