import mongoose from "mongoose";

interface INewsletter {
  email: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSchema = new mongoose.Schema<INewsletter>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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

const Newsletter = mongoose.model<INewsletter>(
  "Newsletter",
  newsletterSchema,
);

export {
  Newsletter,
};

export type {
  INewsletter,
};