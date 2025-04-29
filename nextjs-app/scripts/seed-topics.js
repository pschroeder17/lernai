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
  // Mathematics topics
  {
    name: 'Algebra',
    description: 'Learn the basics of algebra, including variables, equations, and functions.',
    category: 'mathematics',
    difficulty: 'Medium',
    subtopics: ['Variables', 'Equations', 'Functions', 'Graphs'],
  },
  {
    name: 'Geometry',
    description: 'Explore the properties of shapes, angles, and spatial relationships.',
    category: 'mathematics',
    difficulty: 'Medium',
    subtopics: ['Angles', 'Triangles', 'Circles', 'Polygons', 'Coordinate Geometry'],
  },
  {
    name: 'Calculus',
    description: 'Introduction to differential and integral calculus.',
    category: 'mathematics',
    difficulty: 'Hard',
    subtopics: ['Limits', 'Derivatives', 'Integrals', 'Applications'],
  },
  {
    name: 'Statistics',
    description: 'Learn about data collection, analysis, and interpretation.',
    category: 'mathematics',
    difficulty: 'Medium',
    subtopics: ['Probability', 'Descriptive Statistics', 'Inferential Statistics', 'Regression'],
  },
  {
    name: 'Arithmetic',
    description: 'Master the fundamental operations with numbers.',
    category: 'mathematics',
    difficulty: 'Easy',
    subtopics: ['Addition', 'Subtraction', 'Multiplication', 'Division', 'Fractions'],
  },
  
  // Computer Science topics
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
    name: 'Web Development',
    description: 'Learn how to build websites and web applications.',
    category: 'computer-science',
    difficulty: 'Medium',
    subtopics: ['HTML', 'CSS', 'JavaScript', 'Responsive Design', 'Web APIs'],
  },
  {
    name: 'Databases',
    description: 'Understand how to store, retrieve, and manage data efficiently.',
    category: 'computer-science',
    difficulty: 'Medium',
    subtopics: ['SQL', 'Database Design', 'Normalization', 'Indexing', 'Transactions'],
  },
  
  // Science topics
  {
    name: 'Physics',
    description: 'Introduction to the basic principles of physics.',
    category: 'science',
    difficulty: 'Medium',
    subtopics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics'],
  },
  {
    name: 'Chemistry',
    description: 'Learn about atoms, molecules, and chemical reactions.',
    category: 'science',
    difficulty: 'Medium',
    subtopics: ['Atoms', 'Periodic Table', 'Chemical Bonds', 'Reactions'],
  },
  {
    name: 'Biology',
    description: 'Explore the basics of living organisms and their processes.',
    category: 'science',
    difficulty: 'Medium',
    subtopics: ['Cells', 'Genetics', 'Evolution', 'Ecology'],
  },
  {
    name: 'Astronomy',
    description: 'Study celestial objects and phenomena beyond Earth\'s atmosphere.',
    category: 'science',
    difficulty: 'Medium',
    subtopics: ['Solar System', 'Stars', 'Galaxies', 'Cosmology'],
  },
  {
    name: 'Earth Science',
    description: 'Learn about the Earth\'s structure, atmosphere, and natural processes.',
    category: 'science',
    difficulty: 'Easy',
    subtopics: ['Geology', 'Meteorology', 'Oceanography', 'Environmental Science'],
  },
  
  // Languages topics
  {
    name: 'English',
    description: 'Improve your English language skills for better communication.',
    category: 'languages',
    difficulty: 'Easy',
    subtopics: ['Grammar', 'Vocabulary', 'Reading', 'Writing', 'Speaking'],
  },
  {
    name: 'Spanish',
    description: 'Learn one of the world\'s most widely spoken languages.',
    category: 'languages',
    difficulty: 'Medium',
    subtopics: ['Grammar', 'Vocabulary', 'Pronunciation', 'Conversation', 'Culture'],
  },
  {
    name: 'French',
    description: 'Master the language of diplomacy, culture, and cuisine.',
    category: 'languages',
    difficulty: 'Medium',
    subtopics: ['Grammar', 'Vocabulary', 'Pronunciation', 'Conversation', 'Culture'],
  },
  {
    name: 'German',
    description: 'Learn the language of philosophy, science, and engineering.',
    category: 'languages',
    difficulty: 'Medium',
    subtopics: ['Grammar', 'Vocabulary', 'Pronunciation', 'Conversation', 'Culture'],
  },
  {
    name: 'Japanese',
    description: 'Explore the fascinating language and writing system of Japan.',
    category: 'languages',
    difficulty: 'Hard',
    subtopics: ['Hiragana', 'Katakana', 'Kanji', 'Grammar', 'Conversation'],
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