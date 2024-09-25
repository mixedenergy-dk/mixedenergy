// pages/admin/index.js

import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/admin/login'); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div>
      <h1>Welcome to the Admin Page</h1>
    </div>
  );
}
