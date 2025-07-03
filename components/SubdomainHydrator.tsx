'use client';

import { useEffect } from 'react';
import { useSubdomainStore } from '@/store/subDomainStore';

export default function SubdomainHydrator({ host }: { host: string | null }) {
  const setSubdomain = useSubdomainStore((s) => s.setSubdomain);

  useEffect(() => {
    if (host) {
      const slug = host.split('.')[0]; // e.g., foodchowdemoindia
      setSubdomain(slug);
    }
  }, [host, setSubdomain]);

  return null;
}
