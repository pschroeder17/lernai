'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Mock data for topics
const topicCategories = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    description: 'Learn about numbers, equations, geometry, and more',
    topics: [
      { id: 'algebra', name: 'Algebra', difficulty: 'Medium' },
      { id: 'geometry', name: 'Geometry', difficulty: 'Medium' },
      { id: 'calculus', name: 'Calculus', difficulty: 'Hard' },
      { id: 'statistics', name: 'Statistics', difficulty: 'Medium' },
      { id: 'arithmetic', name: 'Arithmetic', difficulty: 'Easy' },
    ],
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    description: 'Explore programming, algorithms, data structures, and more',
    topics: [
      { id: 'programming-basics', name: 'Programming Basics', difficulty: 'Easy' },
      { id: 'data-structures', name: 'Data Structures', difficulty: 'Medium' },
      { id: 'algorithms', name: 'Algorithms', difficulty: 'Hard' },
      { id: 'web-development', name: 'Web Development', difficulty: 'Medium' },
      { id: 'databases', name: 'Databases', difficulty: 'Medium' },
    ],
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Discover physics, chemistry, biology, and more',
    topics: [
      { id: 'physics', name: 'Physics', difficulty: 'Medium' },
      { id: 'chemistry', name: 'Chemistry', difficulty: 'Medium' },
      { id: 'biology', name: 'Biology', difficulty: 'Medium' },
      { id: 'astronomy', name: 'Astronomy', difficulty: 'Medium' },
      { id: 'earth-science', name: 'Earth Science', difficulty: 'Easy' },
    ],
  },
  {
    id: 'languages',
    name: 'Languages',
    description: 'Master new languages and improve your communication skills',
    topics: [
      { id: 'english', name: 'English', difficulty: 'Easy' },
      { id: 'spanish', name: 'Spanish', difficulty: 'Medium' },
      { id: 'french', name: 'French', difficulty: 'Medium' },
      { id: 'german', name: 'German', difficulty: 'Medium' },
      { id: 'japanese', name: 'Japanese', difficulty: 'Hard' },
    ],
  },
];

export default function Topics() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter topics based on search term and selected category
  const filteredCategories = topicCategories
    .filter(category => 
      selectedCategory === 'all' || category.id === selectedCategory
    )
    .map(category => ({
      ...category,
      topics: category.topics.filter(topic => 
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter(category => category.topics.length > 0);

  const handleTopicClick = (categoryId: string, topicId: string) => {
    router.push(`/topics/${categoryId}/${topicId}`);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Explore Topics</h1>
          <p className="text-gray-600 mb-6">
            Browse through our collection of topics and find something new to learn. 
            Each topic is designed to adapt to your knowledge level and provide personalized learning experiences.
          </p>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Search topics</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search topics"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <label htmlFor="category" className="sr-only">Category</label>
              <select
                id="category"
                name="category"
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {topicCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No topics found matching your search criteria.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredCategories.map((category) => (
                <div key={category.id} className="border-t pt-6">
                  <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.topics.map((topic) => (
                      <div
                        key={topic.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleTopicClick(category.id, topic.id)}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{topic.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            topic.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                            topic.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {topic.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Click to start learning
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}