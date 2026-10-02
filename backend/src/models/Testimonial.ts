import mongoose from "mongoose";

type ITestimonial = {
  quote: string;
  name: string;
  role: string;
  category: string;
  image?: string;
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const testimonialSchema = new mongoose.Schema<ITestimonial>(
  {
    quote: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    image: {
      type: String,
      trim: true,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Testimonial = mongoose.model<ITestimonial>(
  "Testimonial",
  testimonialSchema,
);

export {
  Testimonial,
};

export type {
  ITestimonial,
};