# Lernai - AI-Powered Learning Platform

Lernai is an AI-powered learning platform that provides personalized learning experiences based on the user's knowledge level and chosen topics. The app uses Next.js for both frontend and backend, MongoDB for data storage, and OpenAI's GPT-4 API for generating personalized learning content.

## Features

- User authentication (sign up, sign in, sign out)
- Topic browsing and searching
- Knowledge assessment
- AI-generated personalized explanations
- Interactive exercises
- Progress tracking
- Spaced repetition for better retention

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI GPT-4 API

## Prerequisites

- Node.js (v18 or later)
- MongoDB (local instance or MongoDB Atlas)
- OpenAI API key

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd lernai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/lernai
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-in-production
OPENAI_API_KEY=your-openai-api-key
```

Replace the values with your actual MongoDB URI and OpenAI API key.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `src/app`: Next.js app router pages and API routes
- `src/components`: Reusable React components
- `src/lib`: Utility functions and configuration
- `src/models`: MongoDB models
- `src/providers`: React context providers
- `src/types`: TypeScript type definitions

## API Routes

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/[...nextauth]`: NextAuth.js authentication endpoints

### User

- `GET /api/user/profile`: Get user profile
- `PUT /api/user/profile`: Update user profile

### Topics

- `GET /api/topics`: Get all topics
- `POST /api/topics`: Create a new topic
- `GET /api/topics/[id]`: Get a specific topic
- `PUT /api/topics/[id]`: Update a specific topic
- `DELETE /api/topics/[id]`: Delete a specific topic

### Learning

- `GET /api/learning/progress`: Get learning progress
- `POST /api/learning/progress`: Update learning progress

### AI Integration

- `POST /api/ai/generate-explanation`: Generate topic explanation
- `POST /api/ai/generate-exercise`: Generate exercise
- `POST /api/ai/evaluate-answer`: Evaluate user's answer

## Development

### Adding New Topics

To add new topics to the database, you can use the API endpoint:

```bash
curl -X POST http://localhost:3000/api/topics \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Introduction to JavaScript",
    "description": "Learn the basics of JavaScript programming language",
    "category": "computer-science",
    "difficulty": "Easy",
    "subtopics": ["Variables", "Data Types", "Functions", "Control Flow"]
  }'
```

### Database Models

The application uses the following MongoDB models:

- `User`: User accounts and authentication
- `Topic`: Learning topics and categories
- `LearningProgress`: User progress on topics

## Deployment

The application can be deployed to Vercel:

```bash
npm run build
vercel --prod
```

Make sure to set up the environment variables in your Vercel project settings.

## License

[MIT](LICENSE)
