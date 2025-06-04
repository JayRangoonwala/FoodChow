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
    <div className="fixed top-0 right-0 w-fit bg-gray-500 text-white px-4 py-3 shadow max-sm:text-xs z-50 max-lg:top-20 rounded-2xl text-center">
      ⚠️ Slow Internet Connection Detected.
      <button
        onClick={() => setShowPopup(false)}
        className="ml-4 px-2 py-1 max-sm:p-1 text-sm text-yellow-900 bg-yellow-200 rounded"
      >
        Dismiss
      </button>
    </div>
  );
}
