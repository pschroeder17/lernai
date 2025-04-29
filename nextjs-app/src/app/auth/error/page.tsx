'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  let errorMessage = 'An error occurred during authentication.';

  // Map error codes to user-friendly messages
  if (error === 'CredentialsSignin') {
    errorMessage = 'Invalid email or password. Please try again.';
  } else if (error === 'OAuthAccountNotLinked') {
    errorMessage = 'This email is already associated with another account.';
  } else if (error === 'OAuthSignin') {
    errorMessage = 'Error signing in with the provider. Please try again.';
  } else if (error === 'OAuthCallback') {
    errorMessage = 'Error during the authentication callback. Please try again.';
  } else if (error === 'SessionRequired') {
    errorMessage = 'You must be signed in to access this page.';
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-red-600">
            Authentication Error
          </h2>
        </div>
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{errorMessage}</span>
        </div>
        
        <div className="flex flex-col space-y-4">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Sign In
          </Link>
          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}