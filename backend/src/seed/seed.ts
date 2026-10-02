import "dotenv/config";
import bcrypt from "bcryptjs";

import { connectDB, disconnectDB } from "../config/db.js";
import { User } from "../models/User.js";
import Service from "../models/Service.js";
import { Testimonial } from "../models/Testimonial.js";
import { BlogPost } from "../models/BlogPost.js";

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function seed(): Promise<void> {
  try {
    await connectDB();

    console.log("Clearing existing seed data...");

    await User.deleteMany({
      email: "admin@nexora.tech",
    });

    await Service.deleteMany({});

    await Testimonial.deleteMany({});

    await BlogPost.deleteMany({});

    const adminPassword = await hashPassword(
      "ChangeThisAdminPassword123!",
    );

    await User.create({
      name: "Nexora Admin",
      email: "admin@nexora.tech",
      password: adminPassword,
      role: "admin",
    });

    await Service.insertMany([
      {
        title: "Software Engineering",
        slug: "software-engineering",
        description:
          "Design and build scalable, reliable software products for modern businesses.",
        icon: "fa-solid fa-code",
        featured: true,
        active: true,
      },
      {
        title: "AI & Automation",
        slug: "ai-automation",
        description:
          "Use AI and intelligent automation to streamline workflows and improve operational efficiency.",
        icon: "fa-solid fa-wand-magic-sparkles",
        featured: true,
        active: true,
      },
      {
        title: "Cloud Infrastructure",
        slug: "cloud-infrastructure",
        description:
          "Build reliable cloud infrastructure with deployment automation, monitoring, and operational resilience.",
        icon: "fa-solid fa-cloud",
        featured: true,
        active: true,
      },
      {
        title: "DevOps & Platform Engineering",
        slug: "devops-platform-engineering",
        description:
          "Improve development and deployment workflows through CI/CD, infrastructure automation, and observability.",
        icon: "fa-solid fa-server",
        featured: false,
        active: true,
      },
      {
        title: "Digital Product Development",
        slug: "digital-product-development",
        description:
          "Turn product ideas into polished digital experiences through thoughtful design and engineering.",
        icon: "fa-solid fa-layer-group",
        featured: false,
        active: true,
      },
    ]);

    await Testimonial.insertMany([
      {
        quote:
          "Nexora gives our teams one place to understand what is happening, what needs attention, and what comes next.",
        name: "Sam",
        role: "Product & Engineering",
        category: "Product",
        image: "assets/images/testimonial-sam.png",
        featured: true,
        active: true,
      },
      {
        quote:
          "The connection between product planning and engineering execution makes it much easier to understand what is moving, what is blocked, and what needs attention.",
        name: "Jonathan",
        role: "Engineering",
        category: "Engineering",
        image: "assets/images/testimonial-jonathan.png",
        featured: true,
        active: true,
      },
      {
        quote:
          "Nexora gives our organization a shared operating picture. Everyone can see priorities, updates, and the work that is happening across teams.",
        name: "Lance",
        role: "Operations",
        category: "Operations",
        image: "assets/images/testimonial-lance.png",
        featured: false,
        active: true,
      },
      {
        quote:
          "Automation removes a lot of repetitive coordination from our day. The team can spend more time on meaningful work instead of constantly moving information between tools.",
        name: "Nik",
        role: "Product & Engineering",
        category: "Automation",
        image: "assets/images/testimonial-nik.png",
        featured: false,
        active: true,
      },
    ]);

    await BlogPost.insertMany([
      {
        title: "Building Scalable Applications for Modern Businesses",
        slug: "building-scalable-applications-for-modern-businesses",
        excerpt:
          "Explore architecture principles and engineering practices that help digital products grow without unnecessary complexity.",
        content:
          "Modern applications need architecture that can evolve with the business. This article explores practical principles for designing scalable software systems, maintaining clean boundaries, and avoiding unnecessary complexity.",
        category: "Software Development",
        readTime: 5,
        image: "assets/images/Blog-1.png",
        published: true,
        publishedAt: new Date(),
      },
      {
        title: "Practical Ways AI Can Improve Business Operations",
        slug: "practical-ways-ai-can-improve-business-operations",
        excerpt:
          "Discover how teams can introduce AI and automation into everyday workflows without creating unnecessary complexity.",
        content:
          "AI and automation can improve repetitive workflows, information processing, customer support, and operational coordination. The key is to start with practical use cases where automation can provide measurable value.",
        category: "AI & Automation",
        readTime: 6,
        image: "assets/images/Blog-2.png",
        published: true,
        publishedAt: new Date(),
      },
      {
        title:
          "Designing Cloud Infrastructure That Can Grow With Your Business",
        slug: "designing-cloud-infrastructure-that-can-grow-with-your-business",
        excerpt:
          "Understand the foundations of reliable cloud infrastructure, deployment automation, monitoring, and operational resilience.",
        content:
          "Reliable cloud infrastructure requires thoughtful architecture, automated deployments, monitoring, security controls, and operational processes. This article explores the foundations needed to build systems that can grow with business requirements.",
        category: "Cloud Engineering",
        readTime: 7,
        image: "assets/images/Blog-3.png",
        published: true,
        publishedAt: new Date(),
      },
    ]);

    console.log("Nexora seed completed successfully.");

    console.log("");
    console.log("Admin account:");
    console.log("Email: admin@nexora.tech");
    console.log("Password: ChangeThisAdminPassword123!");
    console.log("");
    console.log(
      "IMPORTANT: Change the admin password before production.",
    );
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

seed();