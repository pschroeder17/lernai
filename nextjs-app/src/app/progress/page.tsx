'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

// Mock data for user progress
const mockProgress = {
  completedTopics: [
    {
      id: 'algebra',
      category: 'mathematics',
      name: 'Algebra',
      completedAt: '2025-04-25T10:30:00Z',
      score: 85,
    },
    {
      id: 'programming-basics',
      category: 'computer-science',
      name: 'Programming Basics',
      completedAt: '2025-04-27T14:15:00Z',
      score: 92,
    },
  ],
  inProgressTopics: [
    {
      id: 'geometry',
      category: 'mathematics',
      name: 'Geometry',
      progress: 60,
      lastAccessed: '2025-04-28T09:45:00Z',
    },
    {
      id: 'data-structures',
      category: 'computer-science',
      name: 'Data Structures',
      progress: 25,
      lastAccessed: '2025-04-28T16:20:00Z',
    },
  ],
  recommendedTopics: [
    {
      id: 'calculus',
      category: 'mathematics',
      name: 'Calculus',
      difficulty: 'Hard',
      relevance: 'Based on your interest in Algebra and Geometry',
    },
    {
      id: 'algorithms',
      category: 'computer-science',
      name: 'Algorithms',
      difficulty: 'Hard',
      relevance: 'Next step after Data Structures',
    },
    {
      id: 'statistics',
      category: 'mathematics',
      name: 'Statistics',
      difficulty: 'Medium',
      relevance: 'Complements your knowledge in Mathematics',
    },
  ],
  stats: {
    totalLearningTime: 1240, // in minutes
    topicsCompleted: 2,
    topicsInProgress: 2,
    averageScore: 88.5,
    learningStreak: 5, // days
  },
};

export default function Progress() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');

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

  if (!session) {
    return null; // This should be handled by middleware
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
                  <p className="text-2xl font-bold">{formatTime(mockProgress.stats.totalLearningTime)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-500 mb-1">Topics Completed</h3>
                  <p className="text-2xl font-bold">{mockProgress.stats.topicsCompleted}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-500 mb-1">Average Score</h3>
                  <p className="text-2xl font-bold">{mockProgress.stats.averageScore}%</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-purple-500 mb-1">Learning Streak</h3>
                  <p className="text-2xl font-bold">{mockProgress.stats.learningStreak} days</p>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4 mb-8">
                {mockProgress.inProgressTopics.map((topic) => (
                  <div key={topic.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{topic.name}</h3>
                        <p className="text-sm text-gray-500">Last accessed on {formatDate(topic.lastAccessed)}</p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        In Progress
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${topic.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs text-gray-500 mt-1">{topic.progress}% complete</p>
                  </div>
                ))}
              </div>

              <h2 className="text-xl font-semibold mb-4">Suggested Next Steps</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockProgress.recommendedTopics.slice(0, 3).map((topic) => (
                  <div key={topic.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
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
                    <p className="text-sm text-gray-600">{topic.relevance}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Topics Tab */}
          {activeTab === 'completed' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Completed Topics</h2>
              {mockProgress.completedTopics.length === 0 ? (
                <p className="text-gray-500">You haven't completed any topics yet.</p>
              ) : (
                <div className="space-y-4">
                  {mockProgress.completedTopics.map((topic) => (
                    <div key={topic.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{topic.name}</h3>
                          <p className="text-sm text-gray-500">Completed on {formatDate(topic.completedAt)}</p>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
                            Completed
                          </span>
                          <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                            Score: {topic.score}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* In Progress Tab */}
          {activeTab === 'in-progress' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Topics In Progress</h2>
              {mockProgress.inProgressTopics.length === 0 ? (
                <p className="text-gray-500">You don't have any topics in progress.</p>
              ) : (
                <div className="space-y-4">
                  {mockProgress.inProgressTopics.map((topic) => (
                    <div key={topic.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{topic.name}</h3>
                          <p className="text-sm text-gray-500">Last accessed on {formatDate(topic.lastAccessed)}</p>
                        </div>
                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                          Continue Learning
                        </button>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{ width: `${topic.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-right text-xs text-gray-500 mt-1">{topic.progress}% complete</p>
                    </div>
                  ))}
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
                {mockProgress.recommendedTopics.map((topic) => (
                  <div key={topic.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
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
                    <p className="text-sm text-gray-600 mb-4">{topic.relevance}</p>
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      Start Learning
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}