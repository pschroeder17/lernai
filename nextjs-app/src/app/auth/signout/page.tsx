'use client';

import { useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignOut() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If no session, redirect to home
    if (!session) {
      router.push('/');
      return;
    }

    // Perform sign out
    const performSignOut = async () => {
      await signOut({ callbackUrl: '/' });
    };

    performSignOut();
  }, [session, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Signing out...
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You are being signed out and redirected to the home page.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    </div>
  );
}