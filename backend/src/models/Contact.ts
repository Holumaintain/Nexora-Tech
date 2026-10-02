import mongoose from "mongoose";

interface IContact {
  name: string;
  email: string;
  company?: string;
  subject?: string;
  message: string;
  status: "new" | "read" | "replied";
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new mongoose.Schema<IContact>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    company: {
      type: String,
      trim: true,
      maxlength: 160,
    },

    subject: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    status: {
      type: String,
      enum: ["new", "read", "replied"],
      default: "new",
    },
  },
  {
    timestamps: true,
  },
);

const Contact = mongoose.model<IContact>("Contact", contactSchema);

export { Contact };
export type { IContact };