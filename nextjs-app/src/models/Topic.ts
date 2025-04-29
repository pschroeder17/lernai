import mongoose, { Schema, Document } from 'mongoose';

export interface ITopic extends Document {
  name: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subtopics: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: [true, 'Difficulty is required'],
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

// Update the updatedAt field on save
TopicSchema.pre<ITopic>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Delete the model if it exists to prevent OverwriteModelError during hot reloads in development
const Topic = mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema);

export default Topic;