'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p>Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  // Show dashboard content if authenticated
  if (session) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-4">Welcome, {session.user?.name}!</h1>
            <p className="text-gray-600">
              This is your learning dashboard. Here you can track your progress, find new topics to learn, and continue your learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
              <p className="text-gray-600 mb-4">
                You haven't started any topics yet. Choose a topic below to begin learning.
              </p>
              <div className="h-4 bg-gray-200 rounded-full">
                <div className="h-4 bg-indigo-600 rounded-full w-0"></div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
              <p className="text-gray-600">
                Based on your interests, we recommend these topics:
              </p>
              <ul className="mt-4 space-y-2">
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                  Introduction to Mathematics
                </li>
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                  Basic Programming Concepts
                </li>
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                  Science Fundamentals
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Explore Topics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-medium">Mathematics</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Algebra, Geometry, Calculus, and more
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-medium">Computer Science</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Programming, Algorithms, Data Structures
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-medium">Science</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Physics, Chemistry, Biology
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-medium">Languages</h3>
                <p className="text-sm text-gray-600 mt-1">
                  English, Spanish, German, French
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-medium">History</h3>
                <p className="text-sm text-gray-600 mt-1">
                  World History, Ancient Civilizations
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-medium">Arts</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Music, Drawing, Painting, Literature
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // This should not be reached due to the redirect in useEffect
  return null;
}