'use client';

import { useEffect, useState } from 'react';

export default function SlowConnectionPopup() {

  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any)['mozConnection'] || (navigator as any)['webkitConnection'];

    if (!connection) return;

    const checkConnection = () => {
      const slowTypes = ['slow-2g', '2g'];
      if (slowTypes.includes(connection.effectiveType) || connection.downlink < 0.5) {
        setShowPopup(true);
      } else {
        setShowPopup(false);
      }
    };

    checkConnection();
    connection.addEventListener('change', checkConnection);

    return () => {
      connection.removeEventListener('change', checkConnection);
    };
  }, []);

  if (!showPopup) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 w-[95vw] max-w-lg bg-gray-400 border border-yellow-300 text-yellow-900 px-4 py-3 shadow-lg z-50 rounded-2xl flex items-center gap-3">
      <span className="text-2xl max-sm:text-lg">⚠️</span>
      <span className="flex-1 text-sm sm:text-base font-medium">
        Slow Internet Connection Detected.
      </span>
      <button
        onClick={() => setShowPopup(false)}
        className="ml-2 px-3 py-1 text-xs sm:text-sm font-semibold bg-yellow-200 hover:bg-yellow-300 text-yellow-900 rounded-lg shadow transition"
      >
        Dismiss
      </button>
    </div>
  );
}
