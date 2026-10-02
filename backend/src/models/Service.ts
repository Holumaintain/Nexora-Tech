import mongoose from "mongoose";

interface IService {
  title: string;
  slug: string;
  description: string;
  icon?: string;
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new mongoose.Schema<IService>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    icon: {
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

const Service = mongoose.model<IService>("Service", serviceSchema);

export default Service;