"use server";

import adminNotification from "@/lib/contactEmailTemplate";
import { sendEmail } from "@/lib/sendEmail";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, mobileNumber, query } =
      await request.json();

    // Validation
    if (!firstName || !mobileNumber) {
      return NextResponse.json(
        {
          status: 400,
          message: "Contact details required",
        },
        { status: 400 },
      );
    }

    // Send Email
    await sendEmail(
      "aman@developerchoudhary.com",
      "New user contacted",
      adminNotification(firstName, lastName, email, mobileNumber, query),
    );

    return NextResponse.json(
      {
        status: 200,
        message: "Email send successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message: error,
      },
      { status: 500 },
    );
  }
}
