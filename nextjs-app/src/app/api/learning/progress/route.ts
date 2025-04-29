import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import LearningProgress from '@/models/LearningProgress';
import mongoose from 'mongoose';

// GET /api/learning/progress - Get learning progress for the current user
export async function GET(request: NextRequest) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');
    
    // Build query
    const query: any = { userId: session.user.id };
    
    if (topicId) {
      // Validate topic ID format
      if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return NextResponse.json(
          { message: 'Invalid topic ID' },
          { status: 400 }
        );
      }
      
      query.topicId = topicId;
    }

    // Get learning progress
    const progress = await LearningProgress.find(query)
      .populate('topicId', 'name category difficulty')
      .sort({ lastAccessed: -1 });

    // Return progress
    return NextResponse.json({ progress }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching learning progress:', error);
    
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/learning/progress - Create or update learning progress
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

    // Connect to the database
    await connectToDatabase();

    // Get the request body
    const { topicId, knowledgeLevel, isCompleted, completedExercise } = await request.json();

    // Validate input
    if (!topicId) {
      return NextResponse.json(
        { message: 'Topic ID is required' },
        { status: 400 }
      );
    }

    // Validate topic ID format
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return NextResponse.json(
        { message: 'Invalid topic ID' },
        { status: 400 }
      );
    }

    // Find existing progress or create new one
    let progress = await LearningProgress.findOne({
      userId: session.user.id,
      topicId,
    });

    if (!progress) {
      // Create new progress
      progress = new LearningProgress({
        userId: session.user.id,
        topicId,
        knowledgeLevel: knowledgeLevel || 1,
        completedExercises: [],
        isCompleted: isCompleted || false,
      });
    } else {
      // Update existing progress
      if (knowledgeLevel !== undefined) {
        progress.knowledgeLevel = knowledgeLevel;
      }
      
      if (isCompleted !== undefined) {
        progress.isCompleted = isCompleted;
        
        if (isCompleted && !progress.completedAt) {
          progress.completedAt = new Date();
        } else if (!isCompleted) {
          progress.completedAt = undefined;
        }
      }
    }

    // Add completed exercise if provided
    if (completedExercise) {
      const { exerciseId, score } = completedExercise;
      
      if (!exerciseId || score === undefined) {
        return NextResponse.json(
          { message: 'Exercise ID and score are required for completed exercise' },
          { status: 400 }
        );
      }
      
      // Check if exercise already exists
      const existingExerciseIndex = progress.completedExercises.findIndex(
        (ex: { exerciseId: string; score: number; completedAt: Date }) => ex.exerciseId === exerciseId
      );
      
      if (existingExerciseIndex >= 0) {
        // Update existing exercise
        progress.completedExercises[existingExerciseIndex].score = score;
        progress.completedExercises[existingExerciseIndex].completedAt = new Date();
      } else {
        // Add new exercise
        progress.completedExercises.push({
          exerciseId,
          score,
          completedAt: new Date(),
        });
      }
    }

    // Calculate repetition score and next review date
    // This is a simple implementation of spaced repetition
    // In a real app, this would be more sophisticated
    if (progress.isCompleted) {
      progress.repetitionScore += 1;
      
      // Calculate next review date based on repetition score
      // Using a simple exponential backoff: 1 day, 3 days, 7 days, 14 days, 30 days
      const daysUntilReview = Math.min(Math.pow(2, progress.repetitionScore - 1), 30);
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + daysUntilReview);
      
      progress.nextReviewDate = nextReview;
    }

    await progress.save();

    // Return success response
    return NextResponse.json(
      { 
        message: 'Learning progress updated successfully',
        progress,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating learning progress:', error);
    
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}