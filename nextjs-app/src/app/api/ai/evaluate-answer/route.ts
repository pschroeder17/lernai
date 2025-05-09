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
    const { question, userAnswer, correctAnswer, exerciseType, topic } = await request.json();

    // Validate input
    if (!question || !userAnswer || !correctAnswer || !exerciseType) {
      return NextResponse.json(
        { message: 'Question, user answer, correct answer, and exercise type are required' },
        { status: 400 }
      );
    }

    // For multiple-choice and true-false questions, we can evaluate directly
    if (exerciseType === 'multiple-choice' || exerciseType === 'true-false') {
      const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
      
      return NextResponse.json({
        isCorrect,
        feedback: isCorrect 
          ? 'Correct! Well done.' 
          : `Incorrect. The correct answer is: ${correctAnswer}`,
        explanation: isCorrect
          ? ''
          : `The correct answer is ${correctAnswer}. Make sure to review this concept.`,
      });
    }

    // For more complex answers, use OpenAI to evaluate
    const prompt = createPrompt(question, userAnswer, correctAnswer, exerciseType, topic);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educator who evaluates student answers fairly and provides constructive feedback. Your feedback is specific, helpful, and encouraging. Always respond with valid JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    // Extract the generated content
    const evaluationJson = completion.choices[0].message.content;
    
    // Parse the JSON response
    let evaluation;
    try {
      evaluation = evaluationJson ? JSON.parse(evaluationJson) : null;
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      console.log('Raw response:', evaluationJson);
      
      // Attempt to extract JSON from the response if it's not properly formatted
      const jsonMatch = evaluationJson?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          evaluation = JSON.parse(jsonMatch[0]);
        } catch (e) {
          // Fallback to a default evaluation
          evaluation = createDefaultEvaluation(userAnswer, correctAnswer);
        }
      } else {
        // Fallback to a default evaluation
        evaluation = createDefaultEvaluation(userAnswer, correctAnswer);
      }
    }

    // Return the evaluation
    return NextResponse.json(evaluation, { status: 200 });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    return NextResponse.json(
      { message: 'Error evaluating answer', error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to create the prompt
function createPrompt(
  question: string, 
  userAnswer: string, 
  correctAnswer: string, 
  exerciseType: string,
  topic?: string
): string {
  let prompt = `Evaluate the following student answer:\n\n`;
  
  prompt += `Question: ${question}\n`;
  prompt += `Student's Answer: ${userAnswer}\n`;
  prompt += `Correct Answer: ${correctAnswer}\n`;
  
  if (topic) {
    prompt += `Topic: ${topic}\n`;
  }
  
  prompt += `Exercise Type: ${exerciseType}\n\n`;
  
  prompt += `Please evaluate whether the student's answer is correct or partially correct, and provide helpful feedback. `;
  prompt += `Consider the meaning and intent of the answer, not just exact wording. `;
  
  if (exerciseType === 'fill-in-the-blank' || exerciseType === 'short-answer') {
    prompt += `For this type of question, focus on whether the student demonstrated understanding of the concept. `;
  }
  
  prompt += `Format your response as a JSON object with these fields:
  - "isCorrect": boolean indicating if the answer is correct
  - "score": number from 0 to 100 representing the correctness
  - "feedback": short feedback message (1-2 sentences)
  - "explanation": more detailed explanation of the correct answer
  - "improvementTips": specific suggestions for improvement`;
  
  return prompt;
}

// Helper function to create a default evaluation when parsing fails
function createDefaultEvaluation(userAnswer: string, correctAnswer: string) {
  const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  
  return {
    isCorrect: isCorrect,
    score: isCorrect ? 100 : 0,
    feedback: isCorrect
      ? 'Correct! Well done.'
      : `Incorrect. The correct answer is: ${correctAnswer}`,
    explanation: isCorrect
      ? 'Your answer matches the correct answer.'
      : `The correct answer is ${correctAnswer}. Make sure to review this concept.`,
    improvementTips: isCorrect
      ? 'Continue practicing to reinforce your understanding.'
      : 'Review the material and try again with the correct answer in mind.'
  };
}