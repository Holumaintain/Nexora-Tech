import mongoose from "mongoose";

interface IBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: number;
  image?: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new mongoose.Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 220,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    content: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    readTime: {
      type: Number,
      required: true,
      min: 1,
    },

    image: {
      type: String,
      trim: true,
    },

    published: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const BlogPost = mongoose.model<IBlogPost>("BlogPost", blogPostSchema);

export { BlogPost };
export type { IBlogPost };