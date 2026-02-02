import { NextResponse } from "next/server";

const GOOGLE_AUTH_CLIENT_ID = process.env.GOOGLE_AUTH_CLIENT_ID;
const GOOGLE_AUTH_CALLBACK_URL = process.env.GOOGLE_AUTH_CALLBACK_URL;

export async function GET() {
  try {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_AUTH_CLIENT_ID}&redirect_uri=${GOOGLE_AUTH_CALLBACK_URL}&response_type=code&scope=profile email`;

    return NextResponse.redirect(url);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { status: false, message: errorMessage },
      { status: 500 }
    );
  }
}
