import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Topic from '@/models/Topic';

// GET /api/topics - Get all topics
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
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    
    // Build query
    const query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Get topics
    const topics = await Topic.find(query).sort({ name: 1 });

    // Return topics
    return NextResponse.json({ topics }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching topics:', error);
    
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/topics - Create a new topic (admin only)
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

    // TODO: Add admin check here when admin functionality is implemented
    // For now, allow any authenticated user to create topics for development purposes

    // Connect to the database
    await connectToDatabase();

    // Get the request body
    const { name, description, category, difficulty, subtopics } = await request.json();

    // Validate input
    if (!name || !description || !category || !difficulty) {
      return NextResponse.json(
        { message: 'Name, description, category, and difficulty are required' },
        { status: 400 }
      );
    }

    // Create new topic
    const topic = new Topic({
      name,
      description,
      category,
      difficulty,
      subtopics: subtopics || [],
    });

    await topic.save();

    // Return success response
    return NextResponse.json(
      { 
        message: 'Topic created successfully',
        topic,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating topic:', error);
    
    // Check for duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'A topic with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}