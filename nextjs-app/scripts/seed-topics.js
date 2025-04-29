// This script seeds the database with initial topics
// Run it with: node scripts/seed-topics.js

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Define Topic Schema (simplified version of the one in src/models/Topic.ts)
const TopicSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  subtopics: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create Topic model
const Topic = mongoose.models.Topic || mongoose.model('Topic', TopicSchema);

// Sample topics data
const topics = [
  {
    name: 'Introduction to Algebra',
    description: 'Learn the basics of algebra, including variables, equations, and functions.',
    category: 'mathematics',
    difficulty: 'Easy',
    subtopics: ['Variables', 'Equations', 'Functions', 'Graphs'],
  },
  {
    name: 'Geometry Fundamentals',
    description: 'Explore the properties of shapes, angles, and spatial relationships.',
    category: 'mathematics',
    difficulty: 'Medium',
    subtopics: ['Angles', 'Triangles', 'Circles', 'Polygons', 'Coordinate Geometry'],
  },
  {
    name: 'Calculus Basics',
    description: 'Introduction to differential and integral calculus.',
    category: 'mathematics',
    difficulty: 'Hard',
    subtopics: ['Limits', 'Derivatives', 'Integrals', 'Applications'],
  },
  {
    name: 'Programming Basics',
    description: 'Learn the fundamentals of programming, including variables, data types, and control structures.',
    category: 'computer-science',
    difficulty: 'Easy',
    subtopics: ['Variables', 'Data Types', 'Control Flow', 'Functions'],
  },
  {
    name: 'Data Structures',
    description: 'Explore common data structures like arrays, linked lists, stacks, and queues.',
    category: 'computer-science',
    difficulty: 'Medium',
    subtopics: ['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs'],
  },
  {
    name: 'Algorithms',
    description: 'Learn about algorithm design, analysis, and common algorithms.',
    category: 'computer-science',
    difficulty: 'Hard',
    subtopics: ['Sorting', 'Searching', 'Dynamic Programming', 'Graph Algorithms'],
  },
  {
    name: 'Physics Fundamentals',
    description: 'Introduction to the basic principles of physics.',
    category: 'science',
    difficulty: 'Medium',
    subtopics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics'],
  },
  {
    name: 'Chemistry Basics',
    description: 'Learn about atoms, molecules, and chemical reactions.',
    category: 'science',
    difficulty: 'Medium',
    subtopics: ['Atoms', 'Periodic Table', 'Chemical Bonds', 'Reactions'],
  },
  {
    name: 'Biology Fundamentals',
    description: 'Explore the basics of living organisms and their processes.',
    category: 'science',
    difficulty: 'Medium',
    subtopics: ['Cells', 'Genetics', 'Evolution', 'Ecology'],
  },
];

// Seed the database
async function seedTopics() {
  try {
    // Clear existing topics
    await Topic.deleteMany({});
    console.log('Cleared existing topics');

    // Insert new topics
    const result = await Topic.insertMany(topics);
    console.log(`Successfully seeded ${result.length} topics`);

    // Log the topics
    console.log('Topics:');
    result.forEach(topic => {
      console.log(`- ${topic.name} (${topic.category}, ${topic.difficulty})`);
    });

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding topics:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the seed function
seedTopics();