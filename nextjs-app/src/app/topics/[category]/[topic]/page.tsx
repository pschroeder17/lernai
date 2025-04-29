'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

// Define types for our data structures
interface AssessmentQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface TopicData {
  name: string;
  description: string;
  levels: string[];
  assessmentQuestions: AssessmentQuestion[];
}

interface CategoryData {
  [key: string]: TopicData;
}

interface TopicDataStructure {
  [key: string]: CategoryData;
}

interface AIContent {
  explanation: string;
  examples: string[];
  exercises: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
}

// Mock data for topics
const topicData: TopicDataStructure = {
  'mathematics': {
    'algebra': {
      name: 'Algebra',
      description: 'Algebra is a branch of mathematics dealing with symbols and the rules for manipulating these symbols.',
      levels: ['Beginner', 'Intermediate', 'Advanced'],
      assessmentQuestions: [
        {
          id: 1,
          question: 'What is the value of x in the equation 2x + 5 = 13?',
          options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
          correctAnswer: 'x = 4',
        },
        {
          id: 2,
          question: 'Which of the following is a quadratic equation?',
          options: ['y = 2x + 3', 'y = x² + 2x + 1', 'y = 3/x', 'y = √x'],
          correctAnswer: 'y = x² + 2x + 1',
        },
        {
          id: 3,
          question: 'What is the solution to the inequality x + 4 > 10?',
          options: ['x > 6', 'x > 14', 'x < 6', 'x < 14'],
          correctAnswer: 'x > 6',
        },
      ],
    },
    // Other mathematics topics would be defined here
  },
  'computer-science': {
    'programming-basics': {
      name: 'Programming Basics',
      description: 'Learn the fundamental concepts of programming, including variables, data types, control structures, and functions.',
      levels: ['Beginner', 'Intermediate', 'Advanced'],
      assessmentQuestions: [
        {
          id: 1,
          question: 'Which of the following is not a common programming data type?',
          options: ['Integer', 'String', 'Boolean', 'Paragraph'],
          correctAnswer: 'Paragraph',
        },
        {
          id: 2,
          question: 'What is a variable in programming?',
          options: [
            'A fixed value that cannot be changed',
            'A named storage location for data that can be modified',
            'A mathematical equation',
            'A type of function',
          ],
          correctAnswer: 'A named storage location for data that can be modified',
        },
        {
          id: 3,
          question: 'Which control structure is used to repeat a block of code multiple times?',
          options: ['If statement', 'Switch statement', 'Loop', 'Function'],
          correctAnswer: 'Loop',
        },
      ],
    },
    // Other computer science topics would be defined here
  },
  // Other categories would be defined here
};

// Mock function to simulate AI-generated content
const generateAIContent = (topic: string, level: string): AIContent => {
  // In a real application, this would call the OpenAI API
  return {
    explanation: `This is an AI-generated explanation for ${topic} at the ${level} level. In a real application, this would be generated using the OpenAI GPT-4 API based on the user's knowledge level.`,
    examples: [
      'Example 1: This is a simple example to illustrate the concept.',
      'Example 2: This is a more detailed example with step-by-step explanation.',
      'Example 3: This is a practical application of the concept.',
    ],
    exercises: [
      {
        question: 'Practice Question 1: This is a question to test your understanding.',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option B',
      },
      {
        question: 'Practice Question 2: This is another question to reinforce the concept.',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
      },
    ],
  };
};

export default function TopicDetail() {
  const params = useParams();
  const category = params.category as string;
  const topicId = params.topic as string;

  const [currentStep, setCurrentStep] = useState('assessment'); // 'assessment', 'learning', 'practice'
  const [selectedLevel, setSelectedLevel] = useState('');
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<number, string>>({});
  const [aiContent, setAiContent] = useState<AIContent | null>(null);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, string>>({});
  const [practiceResults, setPracticeResults] = useState<Record<number, boolean>>({});

  // Get topic data
  const topic = topicData[category as keyof typeof topicData]?.[topicId as string] as TopicData | undefined;

  // Handle assessment submission
  const handleAssessmentSubmit = () => {
    if (!topic) return;
    
    // Calculate the level based on answers
    // This is a simplified version - in a real app, this would be more sophisticated
    const totalQuestions = topic.assessmentQuestions.length;
    const correctAnswers = topic.assessmentQuestions.filter(
      (q: AssessmentQuestion) => assessmentAnswers[q.id] === q.correctAnswer
    ).length;
    
    const score = correctAnswers / totalQuestions;
    
    let level;
    if (score < 0.33) {
      level = 'Beginner';
    } else if (score < 0.67) {
      level = 'Intermediate';
    } else {
      level = 'Advanced';
    }
    
    setSelectedLevel(level);
    
    // Generate AI content based on the determined level
    const content = generateAIContent(topic.name, level);
    setAiContent(content);
    
    // Move to learning step
    setCurrentStep('learning');
  };

  // Handle practice submission
  const handlePracticeSubmit = () => {
    if (!aiContent) return;
    
    // Check answers and calculate results
    const results: Record<number, boolean> = {};
    
    aiContent.exercises.forEach((exercise, index: number) => {
      results[index] = practiceAnswers[index] === exercise.correctAnswer;
    });
    
    setPracticeResults(results);
  };

  if (!topic) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-4">Topic Not Found</h1>
            <p className="text-gray-600">
              The requested topic could not be found. Please try another topic.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">{topic.name}</h1>
          <p className="text-gray-600 mb-6">{topic.description}</p>

          {currentStep === 'assessment' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Knowledge Assessment</h2>
              <p className="text-gray-600 mb-6">
                Please answer the following questions so we can determine your current knowledge level and provide personalized content.
              </p>

              <div className="space-y-6">
                {topic.assessmentQuestions.map((question: AssessmentQuestion) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium mb-3">{question.question}</p>
                    <div className="space-y-2">
                      {question.options.map((option: string, index: number) => (
                        <div key={index} className="flex items-center">
                          <input
                            type="radio"
                            id={`question-${question.id}-option-${index}`}
                            name={`question-${question.id}`}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            checked={assessmentAnswers[question.id] === option}
                            onChange={() => setAssessmentAnswers({
                              ...assessmentAnswers,
                              [question.id]: option,
                            })}
                          />
                          <label
                            htmlFor={`question-${question.id}-option-${index}`}
                            className="ml-2 block text-sm text-gray-700"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <button
                  onClick={handleAssessmentSubmit}
                  disabled={Object.keys(assessmentAnswers).length < topic.assessmentQuestions.length}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                >
                  Submit Assessment
                </button>
              </div>
            </div>
          )}

          {currentStep === 'learning' && aiContent && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Learning Content</h2>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                  {selectedLevel} Level
                </span>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-medium mb-2">Explanation</h3>
                <p className="mb-6">{aiContent.explanation}</p>

                <h3 className="text-lg font-medium mb-2">Examples</h3>
                <ul className="list-disc pl-5 mb-6">
                  {aiContent.examples.map((example: string, index: number) => (
                    <li key={index} className="mb-2">{example}</li>
                  ))}
                </ul>

                <div className="mt-6">
                  <button
                    onClick={() => setCurrentStep('practice')}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Continue to Practice
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'practice' && aiContent && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Practice Exercises</h2>

              <div className="space-y-6">
                {aiContent.exercises.map((exercise: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium mb-3">{exercise.question}</p>
                    <div className="space-y-2">
                      {exercise.options.map((option: string, optionIndex: number) => (
                        <div key={optionIndex} className="flex items-center">
                          <input
                            type="radio"
                            id={`exercise-${index}-option-${optionIndex}`}
                            name={`exercise-${index}`}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            checked={practiceAnswers[index] === option}
                            onChange={() => setPracticeAnswers({
                              ...practiceAnswers,
                              [index]: option,
                            })}
                            disabled={practiceResults[index] !== undefined}
                          />
                          <label
                            htmlFor={`exercise-${index}-option-${optionIndex}`}
                            className={`ml-2 block text-sm ${
                              practiceResults[index] !== undefined && option === exercise.correctAnswer
                                ? 'text-green-700 font-medium'
                                : 'text-gray-700'
                            }`}
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                    {practiceResults[index] !== undefined && (
                      <div className={`mt-3 text-sm ${
                        practiceResults[index] ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {practiceResults[index]
                          ? 'Correct! Well done.'
                          : `Incorrect. The correct answer is: ${exercise.correctAnswer}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                {Object.keys(practiceResults).length < aiContent.exercises.length ? (
                  <button
                    onClick={handlePracticeSubmit}
                    disabled={Object.keys(practiceAnswers).length < aiContent.exercises.length}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                  >
                    Check Answers
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="text-lg font-medium text-green-600 mb-4">
                      Great job completing this topic!
                    </p>
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}