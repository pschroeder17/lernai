import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the request body
    const { topic, knowledgeLevel, exerciseType, count = 3 } = await request.json();

    // Validate input
    if (!topic || !knowledgeLevel || !exerciseType) {
      return NextResponse.json(
        { message: 'Topic, knowledge level, and exercise type are required' },
        { status: 400 }
      );
    }

    // Create the prompt for OpenAI
    const prompt = createPrompt(topic, knowledgeLevel, exerciseType, count);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educator who creates high-quality learning exercises. Your exercises are clear, relevant to the topic, and appropriate for the student\'s knowledge level. Always respond with valid JSON format with an "exercises" array.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Extract the generated content
    const exercisesJson = completion.choices[0].message.content;
    
    // Parse the JSON response
    let exercises;
    try {
      // Remove markdown code block syntax if present
      const cleanJson = exercisesJson?.replace(/```json|```/g, '').trim();
      exercises = cleanJson ? JSON.parse(cleanJson) : null;
      
      // Convert options object to array if needed
      if (exercises && exercises.exercises) {
        exercises.exercises = exercises.exercises.map((exercise: any) => {
          // Check if options is an object with A, B, C, D keys
          if (exercise.options && typeof exercise.options === 'object' && !Array.isArray(exercise.options)) {
            const optionsArray = Object.entries(exercise.options).map(([key, value]) => {
              // If the correctAnswer is a letter (A, B, C, D), update it to the full option text
              if (exercise.correctAnswer === key) {
                exercise.correctAnswer = value as string;
              }
              return value as string;
            });
            exercise.options = optionsArray;
          }
          return exercise;
        });
      }
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      console.log('Raw response:', exercisesJson);
      
      // Attempt to extract JSON from the response if it's not properly formatted
      const jsonMatch = exercisesJson?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);
          exercises = {
            exercises: extractedJson.exercises.map((exercise: any) => {
              // Convert options object to array if needed
              if (exercise.options && typeof exercise.options === 'object' && !Array.isArray(exercise.options)) {
                const optionsArray = Object.entries(exercise.options).map(([key, value]) => {
                  // If the correctAnswer is a letter (A, B, C, D), update it to the full option text
                  if (exercise.correctAnswer === key) {
                    exercise.correctAnswer = value as string;
                  }
                  return value as string;
                });
                exercise.options = optionsArray;
              }
              return exercise;
            })
          };
        } catch (e) {
          exercises = {
            exercises: [
              {
                question: `Question about ${topic}?`,
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: 'Option A'
              }
            ]
          };
        }
      } else {
        // Fallback to a default exercise
        exercises = {
          exercises: [
            {
              question: `Question about ${topic}?`,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 'Option A'
            }
          ]
        };
      }
    }

    // Return the generated exercises
    return NextResponse.json(
      { 
        exercises,
        topic,
        knowledgeLevel,
        exerciseType,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    return NextResponse.json(
      { message: 'Error generating exercises', error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to create the prompt
function createPrompt(topic: string, knowledgeLevel: string, exerciseType: string, count: number): string {
  let prompt = `Create ${count} ${exerciseType} exercises about ${topic} at a ${knowledgeLevel} level.`;
  
  if (exerciseType === 'multiple-choice') {
    prompt += ` Each exercise should have a question, 4 options (labeled A, B, C, D), and indicate the correct answer.`;
  } else if (exerciseType === 'true-false') {
    prompt += ` Each exercise should have a statement and indicate whether it's true or false.`;
  } else if (exerciseType === 'fill-in-the-blank') {
    prompt += ` Each exercise should have a sentence with a blank and the correct answer.`;
  } else if (exerciseType === 'short-answer') {
    prompt += ` Each exercise should have a question that requires a short answer (1-2 sentences) and provide a model answer.`;
  }
  
  prompt += ` Format your response as a JSON object with an "exercises" array containing objects with "question", "options" (as an array of strings, not an object), and "correctAnswer" fields.`;
  
  return prompt;
}