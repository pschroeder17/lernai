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
    const { topic, knowledgeLevel, learningStyle } = await request.json();

    // Validate input
    if (!topic || !knowledgeLevel) {
      return NextResponse.json(
        { message: 'Topic and knowledge level are required' },
        { status: 400 }
      );
    }

    // Create the prompt for OpenAI
    const prompt = createPrompt(topic, knowledgeLevel, learningStyle);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert tutor who explains concepts clearly and adapts to the student\'s knowledge level. Your explanations are concise, accurate, and include helpful examples.'
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
    const explanation = completion.choices[0].message.content;

    // Return the generated explanation
    return NextResponse.json(
      { 
        explanation,
        topic,
        knowledgeLevel,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    return NextResponse.json(
      { message: 'Error generating explanation', error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to create the prompt
function createPrompt(topic: string, knowledgeLevel: string, learningStyle?: string): string {
  let prompt = `Explain the concept of ${topic} at a ${knowledgeLevel} level.`;
  
  if (learningStyle) {
    prompt += ` Use a ${learningStyle} learning style.`;
  }
  
  prompt += ` Include a clear explanation, 2-3 examples, and a summary of key points.`;
  
  return prompt;
}