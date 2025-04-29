import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Topic from '@/models/Topic';
import mongoose from 'mongoose';

// GET /api/topics/[id] - Get a specific topic
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid topic ID' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find the topic
    const topic = await Topic.findById(id);

    if (!topic) {
      return NextResponse.json(
        { message: 'Topic not found' },
        { status: 404 }
      );
    }

    // Return the topic
    return NextResponse.json({ topic }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching topic:', error);
    
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/topics/[id] - Update a specific topic (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    // For now, allow any authenticated user to update topics for development purposes

    const { id } = params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid topic ID' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Get the request body
    const { name, description, category, difficulty, subtopics } = await request.json();

    // Find the topic
    const topic = await Topic.findById(id);

    if (!topic) {
      return NextResponse.json(
        { message: 'Topic not found' },
        { status: 404 }
      );
    }

    // Update the topic
    if (name) topic.name = name;
    if (description) topic.description = description;
    if (category) topic.category = category;
    if (difficulty) topic.difficulty = difficulty;
    if (subtopics) topic.subtopics = subtopics;

    await topic.save();

    // Return success response
    return NextResponse.json(
      { 
        message: 'Topic updated successfully',
        topic,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating topic:', error);
    
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/topics/[id] - Delete a specific topic (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    // For now, allow any authenticated user to delete topics for development purposes

    const { id } = params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid topic ID' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find and delete the topic
    const topic = await Topic.findByIdAndDelete(id);

    if (!topic) {
      return NextResponse.json(
        { message: 'Topic not found' },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json(
      { message: 'Topic deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting topic:', error);
    
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}