import { Newsletter } from "../models/Newsletter.js";

const subscribeToNewsletter = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingSubscriber = await Newsletter.findOne({
    email: normalizedEmail,
  });

  if (existingSubscriber) {
    if (!existingSubscriber.active) {
      existingSubscriber.active = true;
      await existingSubscriber.save();
    }

    return {
      subscriber: existingSubscriber,
      alreadySubscribed: true,
    };
  }

  const subscriber = await Newsletter.create({
    email: normalizedEmail,
    active: true,
  });

  return {
    subscriber,
    alreadySubscribed: false,
  };
};

const getNewsletterSubscribers = async () => {
  return Newsletter.find()
    .sort({ createdAt: -1 })
    .select("-__v")
    .lean();
};

export {
  subscribeToNewsletter,
  getNewsletterSubscribers,
};