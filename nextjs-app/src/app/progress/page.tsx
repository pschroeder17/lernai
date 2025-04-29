'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface CompletedTopic {
  _id: string;
  topicId: {
    _id: string;
    name: string;
    category: string;
  };
  completedAt: string;
  completedExercises: {
    score: number;
  }[];
}

interface InProgressTopic {
  _id: string;
  topicId: {
    _id: string;
    name: string;
    category: string;
  };
  lastAccessed: string;
  completedExercises: {
    score: number;
  }[];
}

interface RecommendedTopic {
  _id: string;
  name: string;
  category: string;
  difficulty: string;
}

interface UserProgress {
  completedTopics: CompletedTopic[];
  inProgressTopics: InProgressTopic[];
  recommendedTopics: RecommendedTopic[];
  stats: {
    totalLearningTime: number;
    topicsCompleted: number;
    topicsInProgress: number;
    averageScore: number;
    learningStreak: number;
  };
}

export default function Progress() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    // Fetch user progress data
    if (status === 'authenticated') {
      fetchUserProgress();
    }
  }, [status, router]);

  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/learning/progress');
      
      if (!response.ok) {
        throw new Error('Failed to fetch learning progress');
      }
      
      const data = await response.json();
      
      // Process the data to match our UI needs
      const processedData: UserProgress = {
        completedTopics: data.progress.filter((item: any) => item.isCompleted),
        inProgressTopics: data.progress.filter((item: any) => !item.isCompleted),
        recommendedTopics: [], // We'll fetch these separately or generate based on user's progress
        stats: {
          totalLearningTime: calculateTotalLearningTime(data.progress),
          topicsCompleted: data.progress.filter((item: any) => item.isCompleted).length,
          topicsInProgress: data.progress.filter((item: any) => !item.isCompleted).length,
          averageScore: calculateAverageScore(data.progress),
          learningStreak: calculateLearningStreak(data.progress),
        },
      };
      
      // Fetch recommended topics
      const topicsResponse = await fetch('/api/topics');
      if (topicsResponse.ok) {
        const topicsData = await topicsResponse.json();
        // Filter out topics that the user has already started or completed
        const userTopicIds = data.progress.map((item: any) => item.topicId._id);
        processedData.recommendedTopics = topicsData.topics
          .filter((topic: any) => !userTopicIds.includes(topic._id))
          .slice(0, 5); // Limit to 5 recommendations
      }
      
      setProgress(processedData);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Failed to load your learning progress. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for calculating stats
  const calculateTotalLearningTime = (progressData: any[]): number => {
    // This would be more sophisticated in a real app
    // For now, we'll just return a placeholder value
    return progressData.length * 60; // 60 minutes per topic as a placeholder
  };

  const calculateAverageScore = (progressData: any[]): number => {
    const completedExercises = progressData.flatMap((item: any) => item.completedExercises);
    if (completedExercises.length === 0) return 0;
    
    const totalScore = completedExercises.reduce((sum: number, ex: any) => sum + ex.score, 0);
    return Math.round((totalScore / completedExercises.length) * 10) / 10;
  };

  const calculateLearningStreak = (progressData: any[]): number => {
    // This would use actual dates in a real app
    // For now, we'll just return a placeholder value
    return Math.min(progressData.length, 7); // Max 7 days as a placeholder
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format minutes to hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-6">Your Learning Progress</h1>
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Loading your progress data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-6">Your Learning Progress</h1>
            <div className="flex justify-center items-center h-64">
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!session) {
    return null; // This should be handled by middleware
  }

  // Show empty state if no progress data
  if (!progress) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-6">Your Learning Progress</h1>
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-gray-500 mb-4">You haven't started learning any topics yet.</p>
                <button
                  onClick={() => router.push('/topics')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Explore Topics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">Your Learning Progress</h1>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Completed Topics
              </button>
              <button
                onClick={() => setActiveTab('in-progress')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'in-progress'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setActiveTab('recommended')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'recommended'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recommended
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-indigo-500 mb-1">Total Learning Time</h3>
                  <p className="text-2xl font-bold">{formatTime(progress.stats.totalLearningTime)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-500 mb-1">Topics Completed</h3>
                  <p className="text-2xl font-bold">{progress.stats.topicsCompleted}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-500 mb-1">Average Score</h3>
                  <p className="text-2xl font-bold">{progress.stats.averageScore}%</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-purple-500 mb-1">Learning Streak</h3>
                  <p className="text-2xl font-bold">{progress.stats.learningStreak} days</p>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4 mb-8">
                {progress.inProgressTopics.length === 0 ? (
                  <p className="text-gray-500">You don't have any topics in progress.</p>
                ) : (
                  progress.inProgressTopics.map((topic) => {
                    // Calculate progress percentage based on completed exercises
                    const progressPercentage = topic.completedExercises.length > 0
                      ? Math.min(Math.round((topic.completedExercises.length / 5) * 100), 95) // Assuming 5 exercises per topic
                      : 5; // At least 5% if started
                    
                    return (
                      <div key={topic._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{topic.topicId.name}</h3>
                            <p className="text-sm text-gray-500">Last accessed on {formatDate(topic.lastAccessed)}</p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            In Progress
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <p className="text-right text-xs text-gray-500 mt-1">{progressPercentage}% complete</p>
                      </div>
                    );
                  })
                )}
              </div>

              <h2 className="text-xl font-semibold mb-4">Suggested Next Steps</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {progress.recommendedTopics.length === 0 ? (
                  <p className="text-gray-500 col-span-3">No recommendations available at this time.</p>
                ) : (
                  progress.recommendedTopics.slice(0, 3).map((topic) => (
                    <div
                      key={topic._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/topics/${topic.category}/${topic._id}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{topic.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          topic.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          topic.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {topic.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {topic.category.charAt(0).toUpperCase() + topic.category.slice(1)} topic
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Completed Topics Tab */}
          {activeTab === 'completed' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Completed Topics</h2>
              {progress.completedTopics.length === 0 ? (
                <p className="text-gray-500">You haven't completed any topics yet.</p>
              ) : (
                <div className="space-y-4">
                  {progress.completedTopics.map((topic) => {
                    // Calculate average score from completed exercises
                    const totalScore = topic.completedExercises.reduce((sum, ex) => sum + ex.score, 0);
                    const averageScore = topic.completedExercises.length > 0
                      ? Math.round(totalScore / topic.completedExercises.length)
                      : 0;
                    
                    return (
                      <div key={topic._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{topic.topicId.name}</h3>
                            <p className="text-sm text-gray-500">Completed on {formatDate(topic.completedAt)}</p>
                          </div>
                          <div className="flex items-center">
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
                              Completed
                            </span>
                            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                              Score: {averageScore}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* In Progress Tab */}
          {activeTab === 'in-progress' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Topics In Progress</h2>
              {progress.inProgressTopics.length === 0 ? (
                <p className="text-gray-500">You don't have any topics in progress.</p>
              ) : (
                <div className="space-y-4">
                  {progress.inProgressTopics.map((topic) => {
                    // Calculate progress percentage based on completed exercises
                    const progressPercentage = topic.completedExercises.length > 0
                      ? Math.min(Math.round((topic.completedExercises.length / 5) * 100), 95) // Assuming 5 exercises per topic
                      : 5; // At least 5% if started
                    
                    return (
                      <div key={topic._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{topic.topicId.name}</h3>
                            <p className="text-sm text-gray-500">Last accessed on {formatDate(topic.lastAccessed)}</p>
                          </div>
                          <button
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            onClick={() => router.push(`/topics/${topic.topicId.category}/${topic.topicId._id}`)}
                          >
                            Continue Learning
                          </button>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <p className="text-right text-xs text-gray-500 mt-1">{progressPercentage}% complete</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Recommended Tab */}
          {activeTab === 'recommended' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Recommended Topics</h2>
              <p className="text-gray-600 mb-6">
                Based on your learning history and interests, we recommend these topics to explore next.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {progress.recommendedTopics.length === 0 ? (
                  <p className="text-gray-500 col-span-3">No recommendations available at this time.</p>
                ) : (
                  progress.recommendedTopics.map((topic) => (
                    <div key={topic._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{topic.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          topic.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          topic.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {topic.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        {topic.category.charAt(0).toUpperCase() + topic.category.slice(1)} topic
                      </p>
                      <button
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        onClick={() => router.push(`/topics/${topic.category}/${topic._id}`)}
                      >
                        Start Learning
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}