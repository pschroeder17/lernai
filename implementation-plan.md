# Simplified Implementation Plan for Lernai

## 1. Project Overview

Lernai is an AI-powered learning application that provides personalized learning experiences based on the user's knowledge level and chosen topics. The app will use Next.js for both frontend and backend, MongoDB for data storage, and OpenAI's GPT-4 API for generating personalized learning content.

## 2. System Architecture

```mermaid
graph TD
    A[User Browser/Device] -->|HTTP Requests| B[Next.js Frontend]
    B -->|API Calls| C[Next.js API Routes]
    C -->|Database Operations| D[MongoDB]
    C -->|AI Requests| E[OpenAI GPT-4 API]
    D -->|User Data| C
    E -->|Generated Content| C
    C -->|Responses| B
    B -->|Rendered UI| A
```

## 3. Core Database Schema

```mermaid
erDiagram
    USERS {
        string _id
        string email
        string hashedPassword
        string name
        date createdAt
    }
    
    TOPICS {
        string _id
        string name
        string description
        array subtopics
        string category
        number difficulty
    }
    
    LEARNING_PROGRESS {
        string _id
        string userId
        string topicId
        number knowledgeLevel
        array completedExercises
        date lastAccessed
    }
    
    EXERCISES {
        string _id
        string topicId
        string type
        string question
        array options
        string correctAnswer
        number difficulty
    }
    
    USERS ||--o{ LEARNING_PROGRESS : tracks
    TOPICS ||--o{ LEARNING_PROGRESS : includes
    TOPICS ||--o{ EXERCISES : contains
```

## 4. Simplified Implementation Phases

### Phase 1: Project Setup and Authentication (1 week)

1. **Environment Setup**
   - Configure MongoDB connection
   - Set up OpenAI API integration
   - Configure environment variables

2. **Basic Authentication System**
   - Implement user registration
   - Implement login/logout functionality
   - Create protected routes

### Phase 2: Core Learning Features (2 weeks)

1. **Topic Management**
   - Create topic selection interface
   - Implement basic topic search
   - Design simple topic detail pages

2. **Knowledge Assessment**
   - Implement self-assessment questionnaire
   - Create simple knowledge level determination

3. **AI-Generated Learning Content**
   - Implement OpenAI GPT-4 API integration
   - Create prompts for generating explanations
   - Design basic content presentation

4. **Interactive Exercises**
   - Implement multiple choice exercises
   - Create simple exercise evaluation logic

### Phase 3: Progress Tracking (1 week)

1. **Basic Progress Tracking**
   - Implement simple learning progress dashboard
   - Create basic progress indicators

2. **Simple Repetition System**
   - Implement basic spaced repetition logic
   - Design simple review sessions

## 5. Technical Implementation Details

### Frontend Components

```mermaid
graph TD
    A[App Layout] --> B[Authentication Components]
    A --> C[Dashboard]
    A --> D[Topic Explorer]
    A --> E[Learning Session]
    
    B --> B1[Login Form]
    B --> B2[Registration Form]
    
    C --> C1[Progress Overview]
    C --> C2[Recommended Topics]
    
    D --> D1[Topic Categories]
    D --> D2[Topic Details]
    
    E --> E1[Knowledge Assessment]
    E --> E2[AI Explanations]
    E --> E3[Interactive Exercises]
```

### Backend API Routes

1. **Authentication API**
   - `/api/auth/register` - User registration
   - `/api/auth/login` - User login
   - `/api/auth/logout` - User logout

2. **Topics API**
   - `/api/topics` - Get all topics
   - `/api/topics/[id]` - Get specific topic

3. **Learning API**
   - `/api/learning/assessment` - Get/submit knowledge assessment
   - `/api/learning/explanation` - Get AI-generated explanations
   - `/api/learning/exercises` - Get/submit exercises
   - `/api/learning/progress` - Get/update learning progress

4. **AI Integration API**
   - `/api/ai/generate-explanation` - Generate topic explanation
   - `/api/ai/generate-exercise` - Generate exercise
   - `/api/ai/evaluate-answer` - Evaluate user's answer

## 6. Required Dependencies

1. **Core Dependencies**
   - `next` - Next.js framework
   - `react` & `react-dom` - React library
   - `typescript` - TypeScript support
   - `tailwindcss` - Styling

2. **Database & Authentication**
   - `mongodb` - MongoDB driver
   - `mongoose` - MongoDB object modeling
   - `next-auth` - Authentication for Next.js
   - `bcrypt` - Password hashing

3. **AI Integration**
   - `openai` - OpenAI API client

4. **UI Components**
   - `@headlessui/react` - Accessible UI components
   - `@heroicons/react` - Icon set
   - `react-hook-form` - Form handling

## 7. OpenAI GPT-4 Integration Details

The integration with OpenAI's GPT-4 API will be central to providing personalized learning content. Here's how it will be implemented:

1. **Explanation Generation**
   - Input: Topic, user's knowledge level, preferred learning style
   - Output: Personalized explanation of the topic
   - Example prompt: "Explain [topic] at a [knowledge level] level. Focus on [key aspects] and use [learning style] approach."

2. **Exercise Generation**
   - Input: Topic, knowledge level, exercise type (multiple choice, free text)
   - Output: Question, answer options (for multiple choice), correct answer
   - Example prompt: "Create a [difficulty level] [exercise type] question about [topic] with [number] answer options."

3. **Answer Evaluation**
   - Input: Question, user's answer, correct answer
   - Output: Correctness assessment, explanation of mistakes, tips for improvement
   - Example prompt: "Evaluate this answer: [user answer] for the question: [question]. The correct answer is: [correct answer]. Provide feedback and tips for improvement."

4. **API Implementation**
   - Create a wrapper service for OpenAI API calls
   - Implement caching to reduce API calls for common topics
   - Add error handling and fallback content

## 8. Development Approach

1. **Iterative Development**
   - Start with minimal viable features
   - Implement core functionality first
   - Add enhancements in subsequent iterations

2. **Simple Deployment**
   - Deploy to Vercel for hosting
   - Use MongoDB Atlas for database

3. **Basic Testing**
   - Manual testing of core functionality
   - Simple unit tests for critical components

This simplified plan focuses on the essential features needed for a functional learning application, without the overhead of extensive testing, marketing, or complex features. Once the core functionality is implemented and working, we can iterate and add more sophisticated features based on feedback and requirements.