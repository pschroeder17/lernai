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
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educator who creates high-quality learning exercises. Your exercises are clear, relevant to the topic, and appropriate for the student\'s knowledge level.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    // Extract the generated content
    const exercisesJson = completion.choices[0].message.content;
    
    // Parse the JSON response
    const exercises = exercisesJson ? JSON.parse(exercisesJson) : null;

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
  
  prompt += ` Format your response as a JSON object with an "exercises" array containing objects with "question", "options" (if applicable), and "correctAnswer" fields.`;
  
  return prompt;
}