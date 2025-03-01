"use server";

import adminNotification from "@/lib/contactEmailTemplate";
import { sendEmail } from "@/lib/sendEmail";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles POST request for contact form submission.
 * Validates required fields and sends an email notification to the admin.
 *
 * @param {NextRequest} request - The incoming request object containing JSON body.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { firstName, lastName, email, mobileNumber, query } =
      await request.json();

    // Validate required fields
    if (!firstName || !mobileNumber) {
      return NextResponse.json(
        {
          status: 400,
          message: "Contact details required",
        },
        { status: 400 },
      );
    }

    // Send email notification to admin
    await sendEmail(
      "aman@developerchoudhary.com", // Admin email recipient
      "New user contacted", // Email subject
      adminNotification(firstName, lastName, email, mobileNumber, query), // Email content
    );

    // Respond with success message
    return NextResponse.json(
      {
        status: 200,
        message: "Email sent successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    // Handle errors and respond with internal server error
    return NextResponse.json(
      {
        status: 500,
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
