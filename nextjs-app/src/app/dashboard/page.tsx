'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Topic {
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subtopics: string[];
}

interface LearningProgress {
  _id: string;
  userId: string;
  topicId: {
    _id: string;
    name: string;
    category: string;
    difficulty: string;
  };
  knowledgeLevel: number;
  completedExercises: {
    exerciseId: string;
    score: number;
    completedAt: Date;
  }[];
  isCompleted: boolean;
}

interface CategoryInfo {
  name: string;
  description: string;
  path: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State for data
  const [userProgress, setUserProgress] = useState<LearningProgress[]>([]);
  const [recommendedTopics, setRecommendedTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's learning progress
  useEffect(() => {
    async function fetchUserData() {
      if (status === 'authenticated' && session) {
        setIsLoading(true);
        try {
          // Fetch user's learning progress
          const progressRes = await fetch('/api/learning/progress');
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            setUserProgress(progressData.progress || []);
          }

          // Fetch recommended topics (easy difficulty for new users)
          const topicsRes = await fetch('/api/topics?difficulty=Easy');
          if (topicsRes.ok) {
            const topicsData = await topicsRes.json();
            setRecommendedTopics(topicsData.topics || []);
          }

          // Fetch all topics to extract categories
          const allTopicsRes = await fetch('/api/topics');
          if (allTopicsRes.ok) {
            const allTopicsData = await allTopicsRes.json();
            const allTopics = allTopicsData.topics || [];
            
            // Extract unique categories
            const uniqueCategories: string[] = [...new Set<string>(allTopics.map((topic: Topic) => topic.category))];
            
            // Create category info objects
            const categoryInfos: CategoryInfo[] = uniqueCategories.map((category) => {
              // Create a description based on topics in this category
              const topicsInCategory = allTopics.filter((t: Topic) => t.category === category);
              const topicNames = topicsInCategory.slice(0, 3).map((t: Topic) => t.name);
              
              return {
                name: category,
                description: topicNames.join(', ') + (topicsInCategory.length > 3 ? ', and more' : ''),
                path: `/topics?category=${category}`
              };
            });
            
            setCategories(categoryInfos);
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchUserData();
  }, [status, session]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p>Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  // Calculate progress percentage
  const calculateProgress = () => {
    if (userProgress.length === 0) return 0;
    
    const completedTopics = userProgress.filter(p => p.isCompleted).length;
    return Math.round((completedTopics / userProgress.length) * 100);
  };

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
              {userProgress.length > 0 ? (
                <>
                  <p className="text-gray-600 mb-4">
                    You've started {userProgress.length} topic(s) and completed {userProgress.filter(p => p.isCompleted).length}.
                  </p>
                  <div className="h-4 bg-gray-200 rounded-full">
                    <div
                      className="h-4 bg-indigo-600 rounded-full"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Recently accessed:</h3>
                    <ul className="space-y-2">
                      {userProgress.slice(0, 3).map(progress => (
                        <li
                          key={progress._id}
                          className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => router.push(`/topics/${progress.topicId.category}/${progress.topicId._id}`)}
                        >
                          {progress.topicId.name}
                          {progress.isCompleted && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Completed
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    You haven't started any topics yet. Choose a topic below to begin learning.
                  </p>
                  <div className="h-4 bg-gray-200 rounded-full">
                    <div className="h-4 bg-indigo-600 rounded-full w-0"></div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
              <p className="text-gray-600">
                Based on your interests, we recommend these topics:
              </p>
              <ul className="mt-4 space-y-2">
                {recommendedTopics.length > 0 ? (
                  recommendedTopics.slice(0, 3).map(topic => (
                    <li
                      key={topic._id}
                      className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => router.push(`/topics/${topic.category}/${topic._id}`)}
                    >
                      {topic.name}
                    </li>
                  ))
                ) : (
                  <li className="p-2">Loading recommendations...</li>
                )}
              </ul>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Explore Topics
              <button
                className="ml-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                onClick={() => router.push('/topics')}
              >
                View All Topics →
              </button>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(category.path)}
                  >
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {category.description}
                    </p>
                  </div>
                ))
              ) : (
                // Fallback to hardcoded categories if API fails
                <>
                  <div
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push('/topics?category=mathematics')}
                  >
                    <h3 className="font-medium">Mathematics</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Algebra, Geometry, Calculus, and more
                    </p>
                  </div>
                  <div
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push('/topics?category=computer-science')}
                  >
                    <h3 className="font-medium">Computer Science</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Programming, Algorithms, Data Structures
                    </p>
                  </div>
                  <div
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push('/topics?category=science')}
                  >
                    <h3 className="font-medium">Science</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Physics, Chemistry, Biology
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // This should not be reached due to the redirect in useEffect
  return null;
}