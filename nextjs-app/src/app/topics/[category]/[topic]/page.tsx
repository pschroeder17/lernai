'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Define types for our data structures
interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Topic {
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  subtopics: string[];
}

interface AIContent {
  explanation: string;
  examples: string[];
  assessmentExplanations: {
    question: string;
    correctAnswer: string;
    explanation: string;
  }[];
  exercises: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
}

export default function TopicDetail() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const category = params.category as string;
  const topicId = params.topic as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  const [currentStep, setCurrentStep] = useState('assessment'); // 'assessment', 'learning', 'practice'
  const [selectedLevel, setSelectedLevel] = useState('');
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [assessmentResults, setAssessmentResults] = useState<Record<string, boolean>>({});
  const [showAssessmentResults, setShowAssessmentResults] = useState(false);
  const [aiContent, setAiContent] = useState<AIContent | null>(null);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, string>>({});
  const [practiceResults, setPracticeResults] = useState<Record<number, boolean>>({});
  const [generatingContent, setGeneratingContent] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchTopic();
    }
  }, [status, router, category, topicId]);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/topics/${topicId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch topic');
      }
      
      const data = await response.json();
      setTopic(data.topic);
      
      // Only generate assessment questions if we don't already have them
      // This prevents double loading
      if (assessmentQuestions.length === 0) {
        // Generate assessment questions
        await generateAssessmentQuestions(data.topic);
      }
    } catch (err) {
      console.error('Error fetching topic:', err);
      setError('Failed to load topic. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const generateAssessmentQuestions = async (topicData: Topic) => {
    try {
      setGeneratingQuestions(true);
      
      const response = await fetch('/api/ai/generate-exercise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topicData.name,
          knowledgeLevel: 'assessment',
          exerciseType: 'multiple-choice',
          count: 3,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate assessment questions');
      }
      
      const data = await response.json();
      
      // Format the questions
      const questions = data.exercises.exercises.map((exercise: any, index: number) => ({
        id: `q${index + 1}`,
        question: exercise.question,
        options: exercise.options,
        // Trim the correctAnswer to avoid whitespace issues
        correctAnswer: typeof exercise.correctAnswer === 'string' ? exercise.correctAnswer.trim() : exercise.correctAnswer,
      }));
      
      setAssessmentQuestions(questions);
    } catch (err) {
      console.error('Error generating assessment questions:', err);
      // Fallback to basic questions if API fails
      setAssessmentQuestions([
        {
          id: 'q1',
          question: `What is the main focus of ${topicData.name}?`,
          options: [
            `Understanding ${topicData.name} concepts`,
            'Learning programming',
            'Studying history',
            'Physical exercise',
          ],
          correctAnswer: `Understanding ${topicData.name} concepts`,
        },
        {
          id: 'q2',
          question: `Which of the following is related to ${topicData.name}?`,
          options: [
            topicData.subtopics[0] || 'Basic concepts',
            'Cooking recipes',
            'Sports training',
            'Movie production',
          ],
          correctAnswer: topicData.subtopics[0] || 'Basic concepts',
        },
        {
          id: 'q3',
          question: `How would you rate your knowledge of ${topicData.name}?`,
          options: [
            'Beginner - I know very little',
            'Intermediate - I have some knowledge',
            'Advanced - I know a lot',
            'Expert - I could teach this subject',
          ],
          correctAnswer: 'Beginner - I know very little',
        },
      ]);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // Handle assessment submission
  const handleAssessmentSubmit = async () => {
    if (!topic) return;
    
    // First, show the assessment results
    if (!showAssessmentResults) {
      // Calculate the results
      const results: Record<string, boolean> = {};
      
      assessmentQuestions.forEach((question) => {
        // Trim and normalize both answers to avoid whitespace and case sensitivity issues
        const userAnswer = (assessmentAnswers[question.id] || '').trim().toLowerCase();
        const correctAnswer = (question.correctAnswer || '').trim().toLowerCase();
        
        // Compare normalized answers
        results[question.id] = userAnswer === correctAnswer;
        
        // Log for debugging
        console.log(`Question ${question.id}:`, {
          userAnswer,
          correctAnswer,
          isCorrect: userAnswer === correctAnswer
        });
      });
      
      setAssessmentResults(results);
      setShowAssessmentResults(true);
      return;
    }
    
    // If results are already shown, proceed to generate content
    setGeneratingContent(true);
    
    try {
      // Calculate the level based on answers
      // This is a simplified version - in a real app, this would be more sophisticated
      const totalQuestions = assessmentQuestions.length;
      const correctAnswers = Object.values(assessmentResults).filter(result => result).length;
      
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
      
      // Generate AI content based on the determined level and assessment questions
      const content = await generateAIContent(topic.name, level, assessmentQuestions, assessmentAnswers);
      setAiContent(content);
      
      // Move to learning step
      setCurrentStep('learning');
      
      // Record the learning progress
      recordLearningProgress(topic._id, false);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate learning content. Please try again.');
    } finally {
      setGeneratingContent(false);
    }
  };

  // Generate AI content using the API
  const generateAIContent = async (
    topicName: string,
    level: string,
    questions: AssessmentQuestion[],
    answers: Record<string, string>
  ): Promise<AIContent> => {
    // Create a string with the assessment questions and answers
    const assessmentInfo = questions.map(q =>
      `Question: ${q.question}\nUser's Answer: ${answers[q.id]}\nCorrect Answer: ${q.correctAnswer}\nCorrect: ${answers[q.id] === q.correctAnswer ? 'Yes' : 'No'}`
    ).join('\n\n');
    
    // Generate explanation
    const explanationResponse = await fetch('/api/ai/generate-explanation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: topicName,
        knowledgeLevel: level.toLowerCase(),
        learningStyle: 'structured',
        additionalContext: `Please include explanations for these assessment questions:\n${assessmentInfo}`
      }),
    });
    
    if (!explanationResponse.ok) {
      throw new Error('Failed to generate explanation');
    }
    
    const explanationData = await explanationResponse.json();
    
    // Generate exercises
    const exercisesResponse = await fetch('/api/ai/generate-exercise', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: topicName,
        knowledgeLevel: level.toLowerCase(),
        exerciseType: 'multiple-choice',
        count: 8,
      }),
    });
    
    if (!exercisesResponse.ok) {
      throw new Error('Failed to generate exercises');
    }
    
    const exercisesData = await exercisesResponse.json();
    
    // Create assessment explanations from the questions
    const assessmentExplanations = questions.map(q => ({
      question: q.question,
      correctAnswer: q.correctAnswer,
      explanation: `This will be explained in the content below.` // This will be replaced with actual explanations from the AI
    }));
    
    return {
      explanation: explanationData.explanation || `Learn about ${topicName} at the ${level} level.`,
      examples: explanationData.examples || [
        'Example 1: This is a simple example to illustrate the concept.',
        'Example 2: This is a more detailed example with step-by-step explanation.',
      ],
      assessmentExplanations,
      exercises: exercisesData.exercises.exercises || [
        {
          question: `Practice Question 1: What is a key concept in ${topicName}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A',
        },
        {
          question: `Practice Question 2: How would you apply ${topicName} in a real-world scenario?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option B',
        },
        {
          question: `Practice Question 3: Which of the following best describes ${topicName}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option C',
        },
        {
          question: `Practice Question 4: What is an important principle of ${topicName}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option D',
        },
        {
          question: `Practice Question 5: In what context would ${topicName} be most useful?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A',
        },
        {
          question: `Practice Question 6: What is a common misconception about ${topicName}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option B',
        },
        {
          question: `Practice Question 7: How does ${topicName} relate to other concepts in this field?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option C',
        },
        {
          question: `Practice Question 8: What is a practical application of ${topicName}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option D',
        },
      ],
    };
  };

  // Record learning progress in the database
  const recordLearningProgress = async (topicId: string, isCompleted: boolean) => {
    try {
      const response = await fetch('/api/learning/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId,
          isCompleted,
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to record learning progress');
      }
    } catch (error) {
      console.error('Error recording learning progress:', error);
    }
  };

  // Handle practice submission
  const handlePracticeSubmit = async () => {
    if (!aiContent || !topic) return;
    
    // Check answers and calculate results
    const results: Record<number, boolean> = {};
    
    aiContent.exercises.forEach((exercise, index: number) => {
      results[index] = practiceAnswers[index] === exercise.correctAnswer;
    });
    
    setPracticeResults(results);
    
    // If all exercises are completed, mark the topic as completed
    if (Object.keys(results).length === aiContent.exercises.length) {
      const allCorrect = Object.values(results).every(result => result);
      
      // Record exercise completion
      try {
        const response = await fetch('/api/learning/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topicId: topic._id,
            completedExercise: {
              exerciseId: `practice-${Date.now()}`,
              score: allCorrect ? 100 : Math.round((Object.values(results).filter(r => r).length / Object.values(results).length) * 100),
            },
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to record exercise completion');
        }
      } catch (error) {
        console.error('Error recording exercise completion:', error);
      }
    }
  };

  // Loading state
  if (loading || generatingQuestions) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-4">Loading Topic</h1>
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">
                {generatingQuestions ? 'Generating assessment questions...' : 'Loading topic data...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => router.push('/topics')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Back to Topics
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Topic not found
  if (!topic) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-4">Topic Not Found</h1>
            <p className="text-gray-600">
              The requested topic could not be found. Please try another topic.
            </p>
            <button
              onClick={() => router.push('/topics')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Back to Topics
            </button>
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

          {generatingContent && (
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
              <p className="text-indigo-700">Generating personalized learning content based on your assessment...</p>
            </div>
          )}

          {currentStep === 'assessment' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Knowledge Assessment</h2>
              <p className="text-gray-600 mb-6">
                Please answer the following questions so we can determine your current knowledge level and provide personalized content.
              </p>

              <div className="space-y-6">
                {assessmentQuestions.map((question: AssessmentQuestion) => (
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
                            disabled={showAssessmentResults}
                          />
                          <label
                            htmlFor={`question-${question.id}-option-${index}`}
                            className={`ml-2 block text-sm ${
                              showAssessmentResults && option === question.correctAnswer
                                ? 'text-green-700 font-medium'
                                : showAssessmentResults && assessmentAnswers[question.id] === option && option !== question.correctAnswer
                                ? 'text-red-700'
                                : 'text-gray-700'
                            }`}
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                    {showAssessmentResults && (
                      <div className={`mt-3 text-sm ${
                        assessmentResults[question.id] ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {assessmentResults[question.id]
                          ? 'Correct! Well done.'
                          : `Incorrect. The correct answer is: ${question.correctAnswer.trim()}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <button
                  onClick={handleAssessmentSubmit}
                  disabled={Object.keys(assessmentAnswers).length < assessmentQuestions.length || generatingContent}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                >
                  {showAssessmentResults ? 'Continue to Learning Content' : 'Check Answers'}
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
                <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-medium text-indigo-800 mb-2">Your Assessment Results</h3>
                  <p className="text-indigo-700 mb-2">
                    Based on your answers, we've determined your knowledge level is: <strong>{selectedLevel}</strong>
                  </p>
                  <p className="text-indigo-700">
                    The content below is tailored to your current understanding of {topic.name}.
                  </p>
                </div>

                <h3 className="text-xl font-semibold mb-4">Understanding {topic.name}</h3>
                <div className="whitespace-pre-line text-gray-800 mb-6">
                  {aiContent.explanation}
                </div>

                <h3 className="text-lg font-semibold mb-3">Assessment Review</h3>
                <div className="mb-6 space-y-4 border-l-4 border-indigo-500 pl-4">
                  {assessmentQuestions.map((question, index) => (
                    <div key={index} className="mb-4">
                      <p className="font-medium">{question.question}</p>
                      <p className="text-green-700">Correct answer: {question.correctAnswer.trim()}</p>
                      <p className={assessmentAnswers[question.id]?.trim().toLowerCase() === question.correctAnswer?.trim().toLowerCase() ?
                        "text-green-600" : "text-red-600"}>
                        Your answer: {assessmentAnswers[question.id]?.trim()}
                      </p>
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-semibold mb-3">Examples</h3>
                <div className="space-y-4 mb-6">
                  {aiContent.examples.map((example: string, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 rounded border-l-4 border-green-500">
                      <p className="mb-1 font-medium text-green-700">Example {index + 1}</p>
                      <p>{example}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
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
                            onChange={() => {
                              // Trim the option to avoid whitespace issues
                              const trimmedOption = option.trim();
                              setPracticeAnswers({
                                ...practiceAnswers,
                                [index]: trimmedOption,
                              });
                            }}
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
                      onClick={() => {
                        // Mark topic as completed
                        if (topic) {
                          recordLearningProgress(topic._id, true);
                        }
                        router.push('/dashboard');
                      }}
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