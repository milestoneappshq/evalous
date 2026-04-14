"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// Validation schema for registration
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function registerUser(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = registerSchema.parse(rawData);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create User
    await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        systemRole: "USER", // Default role
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Registration Error:", error);
    return { error: "Failed to create account. Please try again later." };
  }
}

export async function requestPasswordReset(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    
    if (!email) {
      return { error: "Email is required" };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Security best practice: Don't reveal if user exists or not
      return { success: true };
    }

    // Generate Token
    const token = uuidv4();
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour from now

    // Save token to DB
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: token,
        expires: expires,
      },
    });

    // TODO: Send Email via Nodemailer
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    console.log("----------------------------------------");
    console.log("PASSWORD RESET LINK GENERATED:");
    console.log(resetUrl);
    console.log("----------------------------------------");

    return { success: true };
  } catch (error) {
    console.error("Password Reset Error:", error);
    return { error: "Failed to process request." };
  }
}

const resetSchema = z.object({
  email: z.string().email(),
  token: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function resetPassword(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = resetSchema.parse(rawData);

    // Find valid token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: validatedData.email,
        token: validatedData.token,
        expires: { gt: new Date() } // Must not be expired
      }
    });

    if (!verificationToken) {
        return { error: "Invalid or expired reset token." };
    }

    // Update User Password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    
    await prisma.user.update({
      where: { email: validatedData.email },
      data: { password: hashedPassword }
    });

    // Clean up token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: validatedData.email,
          token: validatedData.token
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Password Update Error:", error);
    return { error: "Failed to reset password." };
  }
}
