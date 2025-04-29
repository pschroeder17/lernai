import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningProgress extends Document {
  userId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  knowledgeLevel: number; // 1-5 scale
  completedExercises: {
    exerciseId: string;
    score: number;
    completedAt: Date;
  }[];
  lastAccessed: Date;
  isCompleted: boolean;
  completedAt?: Date;
  repetitionScore: number; // For spaced repetition algorithm
  nextReviewDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LearningProgressSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  topicId: {
    type: Schema.Types.ObjectId,
    ref: 'Topic',
    required: [true, 'Topic ID is required'],
  },
  knowledgeLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 1,
  },
  completedExercises: [{
    exerciseId: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  lastAccessed: {
    type: Date,
    default: Date.now,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  repetitionScore: {
    type: Number,
    default: 0,
  },
  nextReviewDate: {
    type: Date,
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

// Create a compound index for userId and topicId to ensure uniqueness
LearningProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

// Update the lastAccessed and updatedAt fields on save
LearningProgressSchema.pre<ILearningProgress>('save', function (next) {
  this.lastAccessed = new Date();
  this.updatedAt = new Date();
  next();
});

// Delete the model if it exists to prevent OverwriteModelError during hot reloads in development
const LearningProgress = mongoose.models.LearningProgress || mongoose.model<ILearningProgress>('LearningProgress', LearningProgressSchema);

export default LearningProgress;