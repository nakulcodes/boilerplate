import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // TODO: Replace with your actual authentication logic
    const response = await fetch(`${process.env.SERVER_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Authentication failed" },
        { status: response.status }
      );
    }

    // Extract top-level domain
    const hostname = new URL(process.env.SERVER_URL as string).hostname;
    const domain = hostname.split(".").slice(-2).join(".");

    const cookieStore = await cookies();
    cookieStore.set("token", data.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      domain: process.env.NODE_ENV === "production" ? `.${domain}` : undefined, 
      expires: new Date(
        Date.now() + Number(process.env.JWT_EXPIRE || 86400) * 1000
      ),
    });

    const loginResponse = NextResponse.json({ user: data.data.user });

    loginResponse.headers.set(
      "Cache-Control",
      "no-cache, no-store, max-age=0, must-revalidate"
    );
    loginResponse.headers.set("Pragma", "no-cache");
    loginResponse.headers.set("Expires", "0");

    return loginResponse;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
