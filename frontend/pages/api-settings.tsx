import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ApiSettings() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings');
  }, [router]);

  return null;
} 